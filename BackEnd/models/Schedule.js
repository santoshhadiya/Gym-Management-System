const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    unique: true, // Monday, Tuesday, etc.
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  hours: {
    type: String, // e.g., "6 am – 10 pm"
    required: true,
    default: "Closed"
  },
  isClosed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);