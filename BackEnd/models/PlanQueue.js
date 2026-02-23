const mongoose = require("mongoose");

const PlanQueueSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // When this queued plan is scheduled to start
    scheduledStartDate: {
      type: Date,
      required: true,
    },

    // When this queued plan is scheduled to expire
    scheduledExpiryDate: {
      type: Date,
      required: true,
    },

    // Track the payment for this queued plan
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // Type of plan purchase: 'queue' (future) or 'upgrade'
    purchaseType: {
      type: String,
      enum: ["queue", "upgrade"],
      default: "queue",
    },

    // For upgrades: store the original plan's remaining value
    upgradeDetails: {
      originalPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null,
      },
      remainingDays: {
        type: Number,
        default: 0,
      },
      remainingValue: {
        type: Number,
        default: 0,
      },
      discountApplied: {
        type: Number,
        default: 0,
      },
      amountCharged: {
        type: Number,
        default: 0,
      },
    },

    // Status of the queued plan
    status: {
      type: String,
      enum: ["Pending", "Active", "Completed", "Cancelled"],
      default: "Pending",
    },

    // Queue position (1 = next to activate after current plan)
    queuePosition: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanQueue", PlanQueueSchema);
