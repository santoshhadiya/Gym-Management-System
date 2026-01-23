
const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  capacity: {
    type: Number,
    default: 10, // 1 = personal, >1 = group
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

module.exports= mongoose.model("Session", sessionSchema);