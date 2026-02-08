const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["Booked", "Cancelled", "Attended", "Confirmed"],
    default: "Booked",
  },
  cancelReason: {
    type: String,
    default: "", 
  },
  // NEW: Track when attendance was marked
  attendedAt: {
    type: Date,
  },
  // NEW: Track QR code generation for security
  qrGenerated: {
    type: Boolean,
    default: false,
  },
  qrGeneratedAt: {
    type: Date,
  },
}, { timestamps: true });

// Index for faster queries
bookingSchema.index({ session: 1, member: 1 });
bookingSchema.index({ member: 1, bookingStatus: 1 });

module.exports = mongoose.model("SessionBooking", bookingSchema);