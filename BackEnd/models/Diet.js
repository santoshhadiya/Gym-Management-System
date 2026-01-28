const mongoose = require("mongoose");

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const dayDietSchema = new mongoose.Schema({
  day: { type: String, required: true },
  meals: {
    Breakfast: { type: String, default: "" },
    Lunch: { type: String, default: "" },
    Snacks: { type: String, default: "" },
    Dinner: { type: String, default: "" },
  },
  nutrition: nutritionSchema
});

const weekDietSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  days: [dayDietSchema]
});

const dietSchema = new mongoose.Schema(
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
    weeks: [weekDietSchema],
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Diet", dietSchema);