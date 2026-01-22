const mongoose = require("mongoose")

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
    enum: ["Booked", "Cancelled", "Attended"],
    default: "Booked",
  },
}, { timestamps: true });

module.exports= mongoose.model("SessionBooking", bookingSchema);