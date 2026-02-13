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
    enum: ["Booked", "Cancelled", "Attended", "Confirmed"], // Added 'Confirmed' to match your controller logic
    default: "Booked",
  },
  // [NEW] Add this field to store the reason
  cancelReason: {
    type: String,
    default: "", 
  }
}, { timestamps: true });

module.exports = mongoose.model("SessionBooking", bookingSchema); 