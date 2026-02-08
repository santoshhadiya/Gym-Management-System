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
    const { sessionId, qrId } = req.body;
    const memberId = req.user.id;

    // 1. Find the session to verify QR
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 2. Check QR Validity (Using logic from sessionController)
    if (session.currentQrId !== qrId) {
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    // 3. Find and update the member's booking
    const booking = await SessionBooking.findOne({
      session: sessionId,
      member: memberId
    });

    if (!booking) {
      return res.status(404).json({ message: "No booking found for this session" });
    }

    if (booking.bookingStatus === "Attended") {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // 4. Update status
    booking.bookingStatus = "Attended";
    booking.attendedAt = new Date();
    await booking.save();

    res.status(200).json({ message: "Attendance marked successfully", booking });
  } catch (err) {
    console.error("MARK ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Server error during attendance marking" });
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