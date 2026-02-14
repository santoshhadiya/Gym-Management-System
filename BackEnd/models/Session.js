const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    // Primary trainer (kept for backward compatibility)
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // NEW: Array of additional internal trainers
    additionalTrainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // NEW: Array of external trainer names (not in the database)
    externalTrainers: [
      {
        type: String,
        trim: true,
      },
    ],
    type: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "60 mins",
    },
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    notes: String,
    //cancelReason to store why the session was cancelled (Global)
    cancelReason: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 10, // 1 = personal, >1 = group
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    currentQrId: {
      type: String,
      default: null,
    },
    qrGeneratedAt: {
      type: Date,
    },
    qrExpiresAt: {
      type: Date,
    },
    // Ensure this is defined as an array to prevent the .push() error
    qrHistory: [
      {
        qrId: String,
        generatedAt: { type: Date, default: Date.now },
        generatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    bookedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

sessionSchema.methods.isQRValid = function () {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  return this.currentQrId && this.qrExpiresAt > now && this.date === today;
};

// Virtual to get all trainers (internal + external)
sessionSchema.virtual("allTrainers").get(function () {
  const trainers = [];

  // Add primary trainer
  if (this.trainer) {
    trainers.push({
      type: "internal",
      id: this.trainer._id || this.trainer,
      name: this.trainer.name || "Primary Trainer",
      isPrimary: true,
    });
  }

  // Add additional internal trainers
  if (this.additionalTrainers && this.additionalTrainers.length > 0) {
    this.additionalTrainers.forEach((t) => {
      trainers.push({
        type: "internal",
        id: t._id || t,
        name: t.name || "Additional Trainer",
        isPrimary: false,
      });
    });
  }

  // Add external trainers
  if (this.externalTrainers && this.externalTrainers.length > 0) {
    this.externalTrainers.forEach((name) => {
      trainers.push({
        type: "external",
        name: name,
        isPrimary: false,
      });
    });
  }

  return trainers;
});

// Ensure virtuals are included in JSON
sessionSchema.set("toJSON", { virtuals: true });
sessionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Session", sessionSchema);
