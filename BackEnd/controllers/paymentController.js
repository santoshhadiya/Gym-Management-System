const Payment = require("../models/Payment");
const Member = require("../models/Member");
const Plan = require("../models/Plan");
const PlanQueue = require("../models/PlanQueue");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const planService = require("../services/planService");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SC45T3ibqRcWn4",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "3r35e84X8l2auHrwmLhI32I1",
});

// @desc   Step 1: Create Razorpay Order (handles new purchase, upgrade, or queue)
// @route  POST /api/payments/razorpay-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { planId, purchaseType, amountToCharge } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // If purchase type is upgrade and amount is specified, use that amount
    // Otherwise use plan price
    const finalAmount =
      purchaseType === "upgrade" && amountToCharge ? amountToCharge : plan.price;

    const options = {
      amount: finalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Step 2: Verify Signature & Activate Membership (handles new, upgrade, queue)
// @route  POST /api/payments/verify
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      purchaseType, // 'new', 'upgrade', or 'queue'
      memberId, // For Admin actions
      amountToCharge, // For upgrade payments
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

    // 2. Retrieve Member & Plan Details
    let member;
    if (memberId) {
      member = await Member.findById(memberId).populate("plan");
    } else if (req.user && req.user.id) {
      member = await Member.findOne({ user: req.user.id }).populate("plan");
    }

    const newPlan = await Plan.findById(planId);

    if (!member || !newPlan) {
      return res.status(404).json({ message: "Member or Plan details not found" });
    }

    const today = new Date();
    let response = {};

    // 3. HANDLE DIFFERENT PURCHASE TYPES
    if (purchaseType === "upgrade") {
      // ===== UPGRADE LOGIC =====
      response = await handleUpgradePayment(
        member,
        newPlan,
        razorpay_payment_id,
        today,
        amountToCharge
      );
    } else if (purchaseType === "queue") {
      // ===== QUEUE LOGIC =====
      response = await handleQueuePayment(
        member,
        newPlan,
        razorpay_payment_id,
        today
      );
    } else {
      // ===== NEW PURCHASE LOGIC =====
      response = await handleNewPayment(
        member,
        newPlan,
        razorpay_payment_id,
        today
      );
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error("PAYMENT VERIFY CRASH:", error);
    res
      .status(500)
      .json({
        message: "Server error during verification",
        error: error.message,
      });
  }
};

/**
 * Handle new plan purchase (no active plan)
 */
async function handleNewPayment(member, newPlan, transactionId, today) {
  // Create payment record
  const payment = await Payment.create({
    member: member._id,
    plan: newPlan._id,
    amount: newPlan.price,
    method: "Razorpay",
    transactionId,
    status: "Success",
    paidAt: today,
  });

  // Calculate expiry date
  const expiryDate = new Date(
    today.getTime() + newPlan.duration * 24 * 60 * 60 * 1000
  );

  // Update member with new plan
  member.plan = newPlan._id;
  member.status = "Active";
  member.startDate = today;
  member.expiryDate = expiryDate;

  // Add to plan history
  member.planHistory.push({
    plan: newPlan._id,
    startDate: today,
    expiryDate,
    purchaseType: "new",
    amount: newPlan.price,
    payment: payment._id,
  });

  await member.save();

  return {
    message: "Payment verified and membership activated",
    purchaseType: "new",
    plan: newPlan.name,
    startDate: today,
    expiryDate,
    paymentId: payment._id,
  };
}

/**
 * Handle plan upgrade
 */
async function handleUpgradePayment(
  member,
  newPlan,
  transactionId,
  today,
  amountToCharge
) {
  // Create payment record with upgrade amount
  const payment = await Payment.create({
    member: member._id,
    plan: newPlan._id,
    amount: amountToCharge || newPlan.price,
    method: "Razorpay",
    transactionId,
    status: "Success",
    paidAt: today,
  });

  // Calculate remaining value and new expiry
  const upgradeCalc = planService.calculateUpgradeCost(
    member,
    member.plan,
    newPlan
  );

  if (!upgradeCalc.allowed) {
    throw new Error(upgradeCalc.reason);
  }

  // Update member with new plan details
  // New plan starts immediately, expiry extends
  member.plan = newPlan._id;
  member.status = "Active";
  member.startDate = today;
  member.expiryDate = upgradeCalc.newExpiryDate;

  // Add to plan history with upgrade details
  member.planHistory.push({
    plan: newPlan._id,
    startDate: today,
    expiryDate: upgradeCalc.newExpiryDate,
    purchaseType: "upgrade",
    amount: amountToCharge || newPlan.price,
    payment: payment._id,
  });

  await member.save();

  // **CRITICAL: Recalculate all queued plans based on new active plan expiry**
  // This ensures queued plans automatically shift forward without gaps/overlaps
  try {
    await planService.recalculateQueuedPlansAfterUpgrade(
      member._id,
      upgradeCalc.newExpiryDate
    );
  } catch (error) {
    console.error("Warning: Failed to recalculate queued plans after upgrade:", error);
    // Don't fail the upgrade if queue recalculation fails, just log it
  }

  return {
    message: "Plan upgraded successfully",
    purchaseType: "upgrade",
    currentPlan: upgradeCalc.currentPlan,
    upgradedPlan: upgradeCalc.upgrade,
    calculation: upgradeCalc.calculation,
    newExpiryDate: upgradeCalc.newExpiryDate,
    paymentId: payment._id,
  };
}

/**
 * Handle plan queueing with proper multiple queue handling
 */
async function handleQueuePayment(member, newPlan, transactionId, today) {
  // Create payment record
  const payment = await Payment.create({
    member: member._id,
    plan: newPlan._id,
    amount: newPlan.price,
    method: "Razorpay",
    transactionId,
    status: "Success",
    paidAt: today,
  });

  // Calculate scheduled dates considering all existing queued plans
  const queueDates = await planService.calculateQueuedPlanDates(
    member,
    newPlan
  );

  const scheduledStartDate = queueDates.scheduledStartDate;
  const scheduledExpiryDate = queueDates.scheduledExpiryDate;
  const queuePosition = queueDates.queuePosition;

  const planQueue = await PlanQueue.create({
    member: member._id,
    plan: newPlan._id,
    scheduledStartDate,
    scheduledExpiryDate,
    payment: payment._id,
    purchaseType: "queue",
    status: "Pending",
    queuePosition,
  });

  // Add to member's plan queue
  member.planQueue.push(planQueue._id);
  await member.save();

  return {
    message: "Payment verified and plan queued successfully",
    purchaseType: "queue",
    queuedPlan: newPlan.name,
    queuedPlanDuration: newPlan.duration,
    scheduledStartDate,
    scheduledExpiryDate,
    queuePosition,
    note: `Your plan will activate on ${scheduledStartDate.toLocaleDateString()} as Queue #${queuePosition}. Each queued plan will start after the previous one expires.`,
    paymentId: payment._id,
  };
}

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
