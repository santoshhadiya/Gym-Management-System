const Payment = require("../models/Payment");
const Member = require("../models/Member");
const Plan = require("../models/Plan");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SC45T3ibqRcWn4",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "3r35e84X8l2auHrwmLhI32I1",
});

// @desc   Step 1: Create Razorpay Order
// @route  POST /api/payments/razorpay-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const options = {
      amount: plan.price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Step 2: Verify Signature & Activate Membership
// @route  POST /api/payments/verify
// Updated verifyRazorpayPayment in paymentController.js
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    // 1. Verify Signature
    const signData = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "3r35e84X8l2auHrwmLhI32I1")
      .update(signData.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 2. Retrieve Member and Plan Details
    const member = await Member.findOne({ user: req.user.id });
    const plan = await Plan.findById(planId);

    if (!member || !plan) {
      return res.status(404).json({ message: "Member or Plan details not found" });
    }

    // 3. Determine Start and Expiry Dates (Queuing Logic)
    const today = new Date();
    let startDate = today;
    let isQueued = false;

    // If current plan is still active, set start date to the existing expiry date
    if (member.expiryDate && new Date(member.expiryDate) > today) {
      startDate = new Date(member.expiryDate);
      isQueued = true;
    }

    // Calculate new expiry based on the determined startDate and plan duration
    const expiryDate = new Date(
      startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000
    );

    // 4. Create local Payment Record
    await Payment.create({
      member: member._id,
      plan: plan._id,
      amount: plan.price,
      method: "Razorpay",
      transactionId: razorpay_payment_id,
      status: "Success",
      paidAt: today,
    });

    // 5. Update Membership Details
    member.plan = plan._id;
    member.status = "Active";
    member.startDate = startDate;
    member.expiryDate = expiryDate;
    await member.save();

    // 6. Send Response
    return res.status(201).json({
      message: isQueued 
        ? "Payment verified and plan queued successfully" 
        : "Payment verified and membership activated",
      startDate,
      expiryDate,
    });

  } catch (error) {
    console.error("PAYMENT VERIFY CRASH:", error);
    res.status(500).json({ message: "Server error during verification", error: error.message });
  }
};

// @desc   Full payment & instant membership activation
// @route  POST /api/payments
// @access Private (Member)
exports.createPayment = async (req, res) => {
  try {
    const { planId, method } = req.body;

    const member = await Member.findOne({ user: req.user.id });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const amount = plan.price;

    const payment = await Payment.create({
      member: member._id,
      plan: plan._id,
      amount,
      method,
      transactionId: `TXN-${Date.now()}`,
      status: "Success",
    });

    member.plan = plan._id;
    member.status = "Active";
    member.startDate = new Date();
    member.expiryDate = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000,
    );
    await member.save();

    res.status(201).json({ message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get member payment history
// @route  GET /api/payments/my
// @access Private (Member)
exports.getMyPayments = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id });
    const payments = await Payment.find({ member: member._id })
      .populate("plan", "name price")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin record manual payment
// @route  POST /api/payments/record
// @access Admin
exports.recordPayment = async (req, res) => {
  try {
    const { memberId, amount, method, date, ref, planId } = req.body; // planId added

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Use passed planId or fallback to member's current plan
    const finalPlanId = planId || member.plan;

    const payment = await Payment.create({
      member: memberId,
      plan: finalPlanId,
      amount,
      method,
      transactionId: ref || `ADMIN-${Date.now()}`,
      paidAt: date || Date.now(),
      status: "Success",
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all payments (Admin History)
// @route  GET /api/payments/all
// @access Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "member",
        populate: { path: "user", select: "name email" }, // Get member name
      })
      .populate("plan", "name")
      .sort({ paidAt: -1 });

    const formatted = payments.map((p) => ({
      id: p.transactionId || p._id,
      _id: p._id, // Keep original ID for logic
      member: p.member?.user?.name || "Unknown Member",
      memberId: p.member?._id,
      plan: p.plan?.name || "Unknown Plan",
      amount: p.amount,
      method: p.method,
      date: p.paidAt ? p.paidAt.toISOString().split("T")[0] : "-",
      status: p.status === "Success" ? "Paid" : "Failed", // Map backend status to UI status
      recordedBy: "System", // Or add a field if tracking admin ID
      invoiceId: `INV-${p._id.toString().slice(-6).toUpperCase()}`,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
