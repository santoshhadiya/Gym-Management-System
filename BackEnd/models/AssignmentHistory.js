const mongoose = require("mongoose");

const assignmentHistorySchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    oldTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    newTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentHistory", assignmentHistorySchema);