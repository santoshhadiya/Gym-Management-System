const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assumes your user model is named 'User'
      required: true,
    },
    date: {
      type: String, // Stored as "YYYY-MM-DD" per your controller logic
      required: true,
    },
    checkInAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Compound index to ensure a user can't have duplicate entries for the same day
// This acts as a database-level safety net for your 'existing' check
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
