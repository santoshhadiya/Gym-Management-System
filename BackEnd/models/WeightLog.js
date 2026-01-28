const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
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
    weight: { type: Number, required: true }, // in kg
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeightLog", weightLogSchema);