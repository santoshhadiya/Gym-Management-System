const SessionBooking = require("../models/SessionBooking.js")

exports.bookSession = async (req, res) => {
  const exists = await SessionBooking.findOne({
    session: req.params.sessionId,
    member: req.user.id,
  });

  if (exists) {
    return res.status(400).json({ message: "Already booked" });
  }

  const booking = await SessionBooking.create({
    session: req.params.sessionId,
    member: req.user.id,
  });

  res.status(201).json(booking);
};

exports.getMyBookings = async (req, res) => {
  const bookings = await SessionBooking.find({ member: req.user.id })
    .populate({
      path: "session",
      populate: { path: "trainer", select: "name" },
    });

  res.json(bookings);
};