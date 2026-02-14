const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String },
  imageUrl: { type: String },
  isCustom: { type: Boolean, default: false }
});

const mealSchema = new mongoose.Schema({
  Breakfast: [foodItemSchema],
  Lunch: [foodItemSchema],
  Snacks: [foodItemSchema],
  Dinner: [foodItemSchema]
});

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 }
});

const dailyDietSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format
  meals: mealSchema,
  nutrition: nutritionSchema,
  notes: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
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
      ref: "User",
      required: true,
    },
    plans: [dailyDietSchema], // Array of date-based plans
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for faster queries
dietSchema.index({ member: 1, 'plans.date': 1 });

module.exports = mongoose.model("Diet", dietSchema);