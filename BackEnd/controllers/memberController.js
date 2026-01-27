const Member = require("../models/Member");
const User = require("../models/User");
const Plan = require("../models/Plan");
const Payment = require("../models/Payment"); 
const mongoose = require("mongoose");

/**
 * @desc   Get logged-in member profile
 * @route  GET /api/members/profile
 * @access Private (Member)
 */
exports.getMemberProfile = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id })
      .populate("user", "-password")
      .populate("plan")
      .populate("assignedTrainer", "name email profileImage"); // ✅ Populated fully

    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... (rest of the file remains unchanged)
/**
 * @desc   Update logged-in member profile
 * @route  PUT /api/members/profile
 * @access Private (Member)
 */
exports.updateMemberProfile = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id });

    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    member.height = req.body.height ?? member.height;
    member.currentWeight = req.body.currentWeight ?? member.currentWeight;
    member.fitnessGoal = req.body.fitnessGoal ?? member.fitnessGoal;
    member.notes = req.body.notes ?? member.notes;

    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get all members (Admin/Trainer)
 * @route  GET /api/members
 * @access Private (Admin/Trainer)
 */
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("user", "name email phone status createdAt")
      .populate("assignedTrainer", "name")
      .populate("plan", "name");

    const formatted = members.map((m) => ({
      _id: m._id,
      name: m.user.name,
      email: m.user.email,
      phone: m.user.phone,
      status: m.user.status,
      plan: m.plan ? { _id: m.plan._id, name: m.plan.name } : null,
      trainer: m.assignedTrainer ? { _id: m.assignedTrainer._id, name: m.assignedTrainer.name } : null,
      joinDate: m.user.createdAt,
      height: m.height,
      currentWeight: m.currentWeight,
      fitnessGoal: m.fitnessGoal,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc   Get all members with Payment Data (Admin)
// @route  GET /api/members/all
// @access Admin
exports.getAllMembersAll = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("user", "name email phone status createdAt")
      .populate("assignedTrainer", "name")
      .populate("plan", "name price"); //  Ensure price is populated

    //  Process members in parallel to get payment stats
    const formatted = await Promise.all(members.map(async (m) => {
      // Fetch all payments for this member
      const payments = await Payment.find({ member: m._id }).sort({ paidAt: -1 });
      
      const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
      const planPrice = m.plan ? m.plan.price : 0;
      const pending = Math.max(0, planPrice - totalPaid);
      
      // Determine Status
      let paymentStatus = "Pending";
      if (totalPaid >= planPrice && planPrice > 0) paymentStatus = "Paid";
      else if (totalPaid > 0) paymentStatus = "Partial";

      return {
        _id: m._id,
        name: m.user.name,
        email: m.user.email,
        phone: m.user.phone,
        status: m.user.status,
        plan: m.plan?.name || "-",
        planPrice: planPrice,
        trainer: m.assignedTrainer?.name || "Unassigned",
        joinDate: m.user.createdAt,
        
        // Dynamic Payment Data
        paid: totalPaid,
        pending: pending,
        dueDate: m.expiryDate ? m.expiryDate.toISOString().split('T')[0] : "-",
        paymentStatus: paymentStatus,
        
        history: payments.map(p => ({
           id: p._id,
           date: p.paidAt.toISOString().split('T')[0],
           amount: p.amount,
           method: p.method,
           ref: p.transactionId || "-"
        }))
      };
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all members with Payment Data (Admin)
// @route  GET /api/members/all/manage
// @access Admin
exports.getAllMembersAllForManageMember = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("user", "name email phone status createdAt")
      .populate("assignedTrainer", "name email")
      .populate("plan", "name price");

    const formatted = await Promise.all(
      members.map(async (m) => {
        const payments = await Payment.find({ member: m._id }).sort({ paidAt: -1 });
        const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
        const planPrice = m.plan?.price || 0;
        const pending = Math.max(0, planPrice - totalPaid);

        let paymentStatus = "Pending";
        if (totalPaid >= planPrice && planPrice > 0) paymentStatus = "Paid";
        else if (totalPaid > 0) paymentStatus = "Partial";

        return {
          _id: m._id,
          name: m.user?.name || "",
          email: m.user?.email || "",
          phone: m.user?.phone || "",
          status: m.user?.status || "Inactive",
          plan: m.plan ? { _id: m.plan._id, name: m.plan.name, price: m.plan.price } : null,
          trainer: m.assignedTrainer ? { _id: m.assignedTrainer._id, name: m.assignedTrainer.name } : null,
          joinDate: m.user?.createdAt,
          age: m.age || "",
          gender: m.gender || "Male",
          height: m.height || "",
          currentWeight: m.currentWeight || "",
          fitnessGoal: m.fitnessGoal || "",
          paid: totalPaid,
          pending: pending,
          paymentStatus: paymentStatus,
          history: payments.map((p) => ({
            _id: p._id,
            date: p.paidAt ? p.paidAt.toISOString().split("T")[0] : "-",
            amount: p.amount,
            method: p.method || "-",
            ref: p.transactionId || "-",
          })),
        };
      })
    );
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin create member
// @route  POST /api/members
// @access Admin
exports.createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      plan,
      height,
      currentWeight,
      fitnessGoal,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let selectedPlan = null;
    if (plan) {
      if (!mongoose.Types.ObjectId.isValid(plan)) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }
      selectedPlan = await Plan.findById(plan);
      if (!selectedPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: "member",
      status: "Active",
    });

    const member = await Member.create({
      user: user._id,
      plan: selectedPlan?._id || null,
      height,
      currentWeight,
      fitnessGoal,
    });

    res.status(201).json({
      _id: member._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      plan: selectedPlan ? { _id: selectedPlan._id, name: selectedPlan.name, price: selectedPlan.price } : null,
      trainer: "Unassigned",
      joinDate: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin update member
// @route  PUT /api/members/:id
// @access Admin
exports.updateMemberByAdmin = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate("user");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.user.name = req.body.name || member.user.name;
    member.user.phone = req.body.phone || member.user.phone;
    await member.user.save();

    member.plan = req.body.plan || member.plan;
    member.height = req.body.height || member.height;
    member.currentWeight = req.body.currentWeight || member.currentWeight;
    await member.save();

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc   Deactivate member
// @route  PUT /api/members/:id/deactivate
// @access Admin
exports.deactivateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate("user");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    member.user.status = member.user.status === "Active" ? "Inactive" : "Active";
    await member.user.save();
    res.json({ status: member.user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};