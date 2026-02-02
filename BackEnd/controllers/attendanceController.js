const Attendance = require("../models/Attendance");
const jwt = require("jsonwebtoken");
const { getIo } = require("../socket");

exports.generateQRToken = async (req, res) => {
  const token = jwt.sign(
    {
      type: "attendance-checkin",
      adminId: req.user._id, // Capture the ID of the person generating the QR
      id: `qr-${Date.now()}`,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30s" },
  );
  res.json({ qrToken: token });
};

exports.markAttendance = async (req, res) => {
  const { token } = req.body;

  try {
    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      member: req.user._id,
      date: today,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });
    }

    const record = await Attendance.create({
      member: req.user._id,
      date: today,
      checkInAt: new Date(),
    });

    // --- SOCKET NOTIFICATION ---
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const adminId = decoded.adminId; // Extracted from the QR token
      const io = getIo();

      // Emit to the Admin's room specifically
      io.to(adminId.toString()).emit("qr-scanned", {
        message: "Member checked in!",
        memberName: req.user.name,
      });
    } catch (socketErr) {
      console.error("Socket notification failed:", socketErr);
    }

    res.status(201).json(record);
  } catch (err) {
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ message: "Invalid format" });
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "QR expired" });
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch user's personal attendance history
exports.getMyAttendance = async (req, res) => {
  const history = await Attendance.find({ member: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(history);
};

// Admin report generation logic
exports.getAttendanceReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const totalRecords = await Attendance.countDocuments();
    const todayCount = await Attendance.countDocuments({ date: today });
    
    // FETCH ALL instead of just today
    const allRecords = await Attendance.find()
      .populate("member", "name email")
      .sort({ createdAt: -1 });

    const recentScans = await Attendance.find()
      .populate("member", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      totalAttendance: totalRecords,
      todayCount: todayCount,
      allRecords: allRecords, // Changed from todayList
      recentScans: recentScans,
      reportGeneratedAt: new Date().toLocaleString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating comprehensive report" });
  }
};


exports.checkLatestScan = async (req, res) => {
  try {
    // Find the single most recent attendance record
    // We populate the member name just in case you want to show a toast/notification
    const latestRecord = await Attendance.findOne()
      .populate("member", "name")
      .sort({ createdAt: -1 });

    if (!latestRecord) {
      return res.json({ newScan: false });
    }

    res.json({
      success: true,
      latestId: latestRecord._id,
      memberName: latestRecord.member?.name,
      timestamp: latestRecord.checkInAt
    });
  } catch (err) {
    res.status(500).json({ message: "Polling error" });
  }
};