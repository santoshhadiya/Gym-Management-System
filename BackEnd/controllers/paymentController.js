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
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    //  Enforce FULL payment
    const amount = plan.price;

    // Create payment 
    const payment = await Payment.create({
      member: member._id,
      plan: plan._id,
      amount,
      method,
      transactionId: `TXN-${Date.now()}`,
      status: "Success",
    });

    //  Activate membership 
    member.plan = plan._id;
    member.status = "Active";
    member.startDate = new Date();
    member.expiryDate = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    );

    await member.save();

    res.status(201).json({
      message: "Payment successful. Membership activated.",
      payment,
    });
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
