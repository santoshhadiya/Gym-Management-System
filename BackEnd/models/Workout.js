const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: String },
  duration: { type: String },
  imageUrl: { type: String },
  isCustom: { type: Boolean, default: false }
});

const dailyWorkoutSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format
  exercises: [exerciseSchema],
  calorieTarget: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
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
      ref: "User",
      required: true,
    },
    plans: [dailyWorkoutSchema], // Array of date-based plans
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for faster queries
workoutSchema.index({ member: 1, 'plans.date': 1 });

module.exports = mongoose.model("Workout", workoutSchema);