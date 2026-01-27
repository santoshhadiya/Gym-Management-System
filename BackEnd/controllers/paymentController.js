const Payment = require("../models/Payment");
const Member = require("../models/Member");
const Plan = require("../models/Plan");

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
    member.expiryDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
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
    const { memberId, amount, method, date, ref } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    if (!member.plan) return res.status(400).json({ message: "Member has no assigned plan" });

    const payment = await Payment.create({
      member: memberId,
      plan: member.plan,
      amount,
      method,
      transactionId: ref || `MANUAL-${Date.now()}`,
      paidAt: date || Date.now(),
      status: "Success"
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
        populate: { path: "user", select: "name email" } // Get member name
      })
      .populate("plan", "name")
      .sort({ paidAt: -1 });

    const formatted = payments.map(p => ({
      id: p.transactionId || p._id,
      _id: p._id, // Keep original ID for logic
      member: p.member?.user?.name || "Unknown Member",
      memberId: p.member?._id,
      plan: p.plan?.name || "Unknown Plan",
      amount: p.amount,
      method: p.method,
      date: p.paidAt ? p.paidAt.toISOString().split('T')[0] : "-",
      status: p.status === "Success" ? "Paid" : "Failed", // Map backend status to UI status
      recordedBy: "System", // Or add a field if tracking admin ID
      invoiceId: `INV-${p._id.toString().slice(-6).toUpperCase()}`
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};