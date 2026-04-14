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

    // 🔹 Health Information
    healthInfo: {
      medicalConditions: { type: String, default: "" },
      allergies: { type: String, default: "" },
      bloodGroup: { type: String, default: "" },
      pastSurgeries: { type: String, default: "" },
      medications: { type: String, default: "" },
      hasHeartCondition: { type: Boolean, default: false },
      feelsPainDuringExercise: { type: Boolean, default: false },
      hasAsthma: { type: Boolean, default: false },
      hasDiabetes: { type: Boolean, default: false },
      additionalNotes: { type: String, default: "" }
    },

    // 🔹 Plan Queue - For queued future plans
    planQueue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlanQueue",
      },
    ],

    // 🔹 Plan History - Track all plans the member has purchased
    planHistory: [
      {
        plan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Plan",
        },
        startDate: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        purchaseType: {
          type: String,
          enum: ["new", "upgrade", "queue"],
          default: "new",
        },
        amount: {
          type: Number,
        },
        payment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payment",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
