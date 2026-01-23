const SessionBooking = require("../models/SessionBooking.js")
const Session = require("../models/Session.js")

exports.bookSession = async (req, res) => {
  try{
const { sessionId } = req.params;
  const memberId = req.user.id;

  // prevent duplicate booking
  const alreadyBooked = await SessionBooking.findOne({
    session: sessionId,
    member: memberId,
  });

  if (alreadyBooked) {
    return res.status(400).json({ message: "Already booked" });
  }

  // optional: capacity check
  const totalBookings = await SessionBooking.countDocuments({ session: sessionId });
  const session = await Session.findById(sessionId);

  if (totalBookings >= session.capacity) {
    return res.status(400).json({ message: "Session full" });
  }

  const booking = await SessionBooking.create({
    session: sessionId,
    member: memberId,
  });
  
  res.status(201).json(booking);
  }catch(err){
    console.log(err)
  }
};
exports.getMyBookings = async (req, res) => {
  const bookings = await SessionBooking.find({ member: req.user.id })
    .populate({
      path: "session",
      populate: { path: "trainer", select: "name" },
    });

  res.json(bookings);
};

exports.getAllBookingsForAdmin = async (req, res) => {
  const bookings = await SessionBooking.find()
    .populate("member", "name email")
    .populate({
      path: "session",
      populate: { path: "trainer", select: "name" },
    })
    .sort({ createdAt: -1 });

  res.json(bookings);
};


exports.cancelBookingByAdmin = async (req, res) => {
  const booking = await SessionBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.bookingStatus = "Cancelled";
  booking.cancelReason = req.body.reason || "Cancelled by admin";
  await booking.save();

  res.json(booking);
};