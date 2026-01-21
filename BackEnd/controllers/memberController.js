const Member = require("../models/Member");
const User = require("../models/User");

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
      .populate("user", "name email status")
      .populate("assignedTrainer", "name");

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
