const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["UPI", "Card", "Net Banking", "Cash", "Razorpay", "razorpay"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },

    transactionId: {
      type: String,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
