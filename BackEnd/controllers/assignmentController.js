const Member = require("../models/Member");
const User = require("../models/User");
const AssignmentHistory = require("../models/AssignmentHistory");
const Conversation = require("../models/Conversation"); // ✅ Import
const Message = require("../models/Message"); // ✅ Import

exports.assignTrainer = async (req, res) => {
  const { trainerId, memberIds, reason } = req.body;

  const trainer = await User.findById(trainerId);
  if (!trainer || trainer.role !== "trainer") {
    return res.status(404).json({ message: "Trainer not found" });
  }

  const capacity = trainer.trainerDetails?.capacity || 10;
  const active = trainer.trainerDetails?.activeClients || 0;

  if (active + memberIds.length > capacity) {
    return res.status(400).json({ message: "Trainer capacity exceeded" });
  }

  for (const memberId of memberIds) {
    const member = await Member.findById(memberId).populate("user");

    if (member.assignedTrainer) {
      await AssignmentHistory.create({
        member: member._id,
        oldTrainer: member.assignedTrainer,
        newTrainer: trainer._id,
        reason,
      });

      await User.findByIdAndUpdate(member.assignedTrainer, {
        $inc: { "trainerDetails.activeClients": -1 },
      });
    }

    // Assign new trainer
    member.assignedTrainer = trainer._id;
    member.assignedDate = new Date();
    await member.save();

    // ---  AUTOMATIC CHAT MESSAGE LOGIC ---
    try {
      // 1. Check or Create Conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [member.user._id, trainer._id] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [member.user._id, trainer._id],
          lastMessage: "Hi! I’m your new member. Excited to start my training with you.", // Initial text
          lastMessageBy: member.user._id,
          lastMessageAt: new Date()
        });
      }

      // 2. Create the Welcome Message
      // Only send if it's a NEW assignment (or logic to prevent duplicates if desired)
      await Message.create({
        conversationId: conversation._id,
        sender: member.user._id, // Message from MEMBER
        text: "Hi! I’m your new member. Excited to start my training with you.",
      });

      // Update conversation metadata if it existed but was old
      await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: "Hi! I’m your new member. Excited to start my training with you.",
          lastMessageBy: member.user._id,
          lastMessageAt: new Date()
      });

    } catch (chatError) {
      console.error("Auto-chat failed for member " + memberId, chatError);
      // Don't fail the assignment if chat fails
    }
    // ---------------------------------------
  }

  await User.findByIdAndUpdate(trainer._id, {
    $inc: { "trainerDetails.activeClients": memberIds.length },
  });

  res.json({ message: "Trainer assigned successfully" });
};

exports.unassignTrainer = async (req, res) => {
  const { memberId } = req.params;

  const member = await Member.findById(memberId);
  if (!member || !member.assignedTrainer) {
    return res.status(404).json({ message: "Member not assigned" });
  }

  await AssignmentHistory.create({
    member: member._id,
    oldTrainer: member.assignedTrainer,
    newTrainer: null,
    reason: "Admin unassigned",
  });

  await User.findByIdAndUpdate(member.assignedTrainer, {
    $inc: { "trainerDetails.activeClients": -1 },
  });

  member.assignedTrainer = null;
  member.assignedDate = null;
  await member.save();

  res.json({ message: "Trainer unassigned successfully" });
};

exports.getAssignmentHistory = async (req, res) => {
  const history = await AssignmentHistory.find()
    .populate("member", "user")
    .populate("oldTrainer", "name")
    .populate("newTrainer", "name")
    .sort({ createdAt: -1 });

  res.json(history);
};