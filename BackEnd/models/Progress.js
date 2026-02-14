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
    workoutCompleted: { type: Boolean, default: false },
    dietCompleted: { type: Boolean, default: false },
    workoutCompletedAt: { type: Date },
    dietCompletedAt: { type: Date }
  },
  { timestamps: true }
);

// Ensure one progress entry per member per date
progressSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);