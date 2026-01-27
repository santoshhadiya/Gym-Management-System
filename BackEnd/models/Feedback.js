const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["General", "Trainer", "Facility"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed"],
      default: "Pending",
    },
    //  Added fields for Admin Reply
    reply: {
      type: String,
      default: "",
    },
    replyDate: {
      type: Date,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);