const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
    unique: true, // Only ONE offer per plan
  },

  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true,
  },

  discountValue: {
    type: Number,
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);