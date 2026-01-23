const Member = require("../models/Member");
const User = require("../models/User");
const Plan = require("../models/Plan");
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
      .populate("assignedTrainer", "name email");

    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

      plan: m.plan
        ? {
            _id: m.plan._id,
            name: m.plan.name,
          }
        : null,

      trainer: m.assignedTrainer
        ? {
            _id: m.assignedTrainer._id,
            name: m.assignedTrainer.name,
          }
        : null,

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


// @desc   Get all members (Admin)
// @route  GET /api/members
// @access Admin
exports.getAllMembersAll = async (req, res) => {
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
      plan: m.plan?.name || "-",
     
      trainer: m.assignedTrainer?.name || "Unassigned",

      joinDate: m.user.createdAt,

      height: m.height,
      currentWeight: m.currentWeight,
      fitnessGoal: m.fitnessGoal,

      // Hardcoded for now
      attendance: {
        present: 0,
        lastVisit: "N/A",
      },

      progress: {
        workouts: 0,
        weightLoss: "-",
      },

      payment: {
        lastPayment: "N/A",
        pending: 0,
      },
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    // 1. Check email
    const exists = await User.findOne({ email });

    if (exists) {
    
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Validate plan id (optional but recommended)
    let selectedPlan = null;

    if (plan) {
      if (!mongoose.Types.ObjectId.isValid(plan)) {
        return res.status(400).json({
          message: "Invalid plan selected",
        });
      }

      selectedPlan = await Plan.findById(plan);

      if (!selectedPlan) {
        return res.status(404).json({
          message: "Plan not found",
        });
      }
    }

    // 3. Create User (password will hash automatically)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: "member",
      status: "Active",
    });

    // 4. Create Member
    const member = await Member.create({
      user: user._id,
      plan: selectedPlan?._id || null,
      height,
      currentWeight,
      fitnessGoal,
    });

    // 5. Response
    res.status(201).json({
      _id: member._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,

      plan: selectedPlan
        ? {
            _id: selectedPlan._id,
            name: selectedPlan.name,
            price: selectedPlan.price,
          }
        : null,

      trainer: "Unassigned",
      joinDate: user.createdAt,
      height: member.height,
      currentWeight: member.currentWeight,
      fitnessGoal: member.fitnessGoal,
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

    // Update user fields (no password)
    member.user.name = req.body.name || member.user.name;
    member.user.phone = req.body.phone || member.user.phone;

    await member.user.save();

    // Update member fields
    member.plan = req.body.plan || member.plan;
    member.height = req.body.height || member.height;
    member.currentWeight = req.body.currentWeight || member.currentWeight;

    await member.save();

    res.json({
      _id: member._id,
      name: member.user.name,
      email: member.user.email,
      phone: member.user.phone,
      status: member.user.status,
      plan: member.plan,
      trainer: member.assignedTrainer?.name || "Unassigned",
      joinDate: member.user.createdAt,
      height: member.height,
      currentWeight: member.currentWeight,
      fitnessGoal: member.fitnessGoal,
    });
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

    member.user.status =
      member.user.status === "Active" ? "Inactive" : "Active";

    await member.user.save();

    res.json({ status: member.user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
