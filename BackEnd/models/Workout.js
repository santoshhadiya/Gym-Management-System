const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  day: { type: String, required: true }, // Monday, Tuesday...
  plan: { type: String, default: "" },
});

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  days: [daySchema]
});

const workoutSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Trainer
      required: true,
    },
    weeks: [weekSchema], // Array of weeks
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);