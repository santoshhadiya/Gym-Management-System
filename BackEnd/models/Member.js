const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 🔹 Membership Plan (REFERENCE)
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },

    startDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired"],
      default: "Inactive",
    },

    // 🔹 Fitness Details
    height: {
      type: Number, // cm
    },
    currentWeight: {
      type: Number, // kg
    },
    fitnessGoal: {
      type: String,
      default: "General Fitness",
    },

    // 🔹 Trainer Assignment
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
