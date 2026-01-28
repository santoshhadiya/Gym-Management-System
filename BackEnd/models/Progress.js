const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    weekNumber: { type: Number },
    day: { type: String }, // Monday, etc.
    workoutCompleted: { type: Boolean, default: false },
    dietCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index to ensure one entry per day per member
progressSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);