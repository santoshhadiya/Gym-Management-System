const SessionBooking = require("../models/SessionBooking.js");
const Session = require("../models/Session.js");

exports.bookSession = async (req, res) => {
  try {
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
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const totalBookings = await SessionBooking.countDocuments({
      session: sessionId,
    });

    if (totalBookings >= session.capacity) {
      return res.status(400).json({ message: "Session full" });
    }

    const booking = await SessionBooking.create({
      session: sessionId,
      member: memberId,
    });

    await Session.findByIdAndUpdate(sessionId, { $inc: { bookedCount: 1 } });

    res.status(201).json(booking);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await SessionBooking.find({ member: req.user.id })
      .populate({
        path: "session",
        populate: [
          { path: "trainer", select: "name" },
          { path: "additionalTrainers", select: "name" }
        ],
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("GET MY BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBookingsForAdmin = async (req, res) => {
  try {
    const bookings = await SessionBooking.find()
      .populate("member", "name email")
      .populate({
        path: "session",
        populate: [
          { path: "trainer", select: "name" },
          { path: "additionalTrainers", select: "name" }
        ],
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("GET ALL BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBookingByAdmin = async (req, res) => {
  try {
    const booking = await SessionBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.bookingStatus = "Cancelled";
    booking.cancelReason = req.body.reason || "Cancelled by admin";
    await booking.save();

    // Decrement booked count
    await Session.findByIdAndUpdate(booking.session, { $inc: { bookedCount: -1 } });

    res.json(booking);
  } catch (err) {
    console.error("CANCEL BOOKING BY ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelMyBooking = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const memberId = req.user.id;

    // Find and delete the booking for this specific session and member
    const booking = await SessionBooking.findOneAndDelete({
      session: sessionId,
      member: memberId,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or already cancelled" });
    }

    await Session.findByIdAndUpdate(sessionId, { $inc: { bookedCount: -1 } });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATED: Mark attendance via QR code scan (member-initiated)
exports.markAttendance = async (req, res) => {
  try {
    const { sessionId, qrId, sessionDate } = req.body;
    const memberId = req.user.id;

    // Validate required fields
    if (!sessionId || !qrId || !sessionDate) {
      return res.status(400).json({ 
        message: "Missing required fields: sessionId, qrId, sessionDate" 
      });
    }

    // Find the session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify QR code is valid
    if (session.currentQrId !== qrId) {
      return res.status(400).json({ 
        message: "Invalid QR code. Please scan the current session QR code." 
      });
    }

    // Check if QR is expired or not valid for today
    const today = new Date().toISOString().split('T')[0];
    
    if (session.date !== today) {
      return res.status(400).json({ 
        message: `This QR code is only valid on the session date: ${session.date}` 
      });
    }

    if (!session.isQRValid()) {
      return res.status(400).json({ 
        message: "QR code has expired. Please ask the trainer to generate a new one." 
      });
    }

    // Find the member's booking
    const booking = await SessionBooking.findOne({
      session: sessionId,
      member: memberId,
    });

    if (!booking) {
      return res.status(404).json({ 
        message: "You don't have a booking for this session. Please book the session first." 
      });
    }

    // Check if already attended
    if (booking.bookingStatus === 'Attended') {
      return res.status(400).json({ 
        message: "Attendance already marked for this session" 
      });
    }

    // Check if booking is cancelled
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ 
        message: "Cannot mark attendance for a cancelled booking" 
      });
    }

    // Mark attendance
    booking.bookingStatus = 'Attended';
    booking.attendedAt = new Date();
    booking.qrIdUsed = qrId;
    booking.attendanceMethod = 'qr_scan';
    booking.attendanceMetadata = {
      scannedBy: memberId,
      scannedAt: new Date(),
    };

    await booking.save();

    // Populate session details for response
    await booking.populate('session');

    res.json({ 
      message: "Attendance marked successfully! Welcome to the session.",
      booking: booking
    });

  } catch (err) {
    console.error("MARK ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Get attendance stats for a session (Admin only)
exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const bookings = await SessionBooking.find({ session: sessionId })
      .populate("member", "name email")
      .sort({ createdAt: 1 });

    const stats = {
      totalBookings: bookings.length,
      attended: bookings.filter(b => b.bookingStatus === 'Attended').length,
      booked: bookings.filter(b => b.bookingStatus === 'Booked').length,
      cancelled: bookings.filter(b => b.bookingStatus === 'Cancelled').length,
    };

    res.json({
      session: session,
      bookings: bookings,
      stats: stats
    });

  } catch (err) {
    console.error("GET SESSION ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Manual attendance marking (Admin only)
exports.markAttendanceManually = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await SessionBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus === 'Attended') {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ 
        message: "Cannot mark attendance for cancelled booking" 
      });
    }

    booking.bookingStatus = 'Attended';
    booking.attendedAt = new Date();
    booking.attendanceMethod = 'admin';
    booking.attendanceMetadata = {
      scannedBy: req.user.id,
      scannedAt: new Date(),
    };

    await booking.save();
    await booking.populate('member', 'name email');
    await booking.populate('session');

    res.json({
      message: `Attendance marked manually for ${booking.member.name}`,
      booking: booking
    });

  } catch (err) {
    console.error("MANUAL ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};