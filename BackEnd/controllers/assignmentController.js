const Member = require("../models/Member");
const User = require("../models/User");
const AssignmentHistory = require("../models/AssignmentHistory");

exports.assignTrainer = async (req, res) => {
  const { trainerId, memberIds, reason } = req.body;

  const trainer = await User.findById(trainerId);
  if (!trainer || trainer.role !== "trainer") {
    return res.status(404).json({ message: "Trainer not found" });
  }

  const capacity = trainer.trainerDetails.capacity;
  const active = trainer.trainerDetails.activeClients;

  if (active + memberIds.length > capacity) {
    return res.status(400).json({ message: "Trainer capacity exceeded" });
  }

  for (const memberId of memberIds) {
    const member = await Member.findById(memberId);

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

    member.assignedTrainer = trainer._id;
    member.assignedDate = new Date();
    await member.save();
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

  res.json(
    history.map(h => ({
      _id: h._id,
      date: h.createdAt.toISOString().split("T")[0],
      member: h.member?.user?.name || "Unknown",
      oldTrainer: h.oldTrainer?.name || "Unassigned",
      newTrainer: h.newTrainer?.name || "Unassigned",
      reason: h.reason,
    }))
  );
};