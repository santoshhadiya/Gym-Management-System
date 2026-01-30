const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Admin generates a token that expires in 30 seconds
exports.generateQRToken = async (req, res) => {
  const token = jwt.sign({ type: 'attendance-checkin', timestamp: Date.now() }, 
                process.env.JWT_SECRET, { expiresIn: '30s' });
  res.json({ qrToken: token });
};

// Member scans and hits this endpoint
exports.markAttendance = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const today = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({ member: req.user._id, date: today });
    if (existing) return res.status(400).json({ message: "Attendance already marked for today" });

    const record = await Attendance.create({
      member: req.user._id,
      date: today,
      checkInTime: new Date().toLocaleTimeString()
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired QR code" });
  }
};

exports.getMyAttendance = async (req, res) => {
  const history = await Attendance.find({ member: req.user._id }).sort({ createdAt: -1 });
  res.json(history);
};

// Get comprehensive report for Admin
exports.getAttendanceReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Get Summary Counts
    const totalRecords = await Attendance.countDocuments();
    const todayCount = await Attendance.countDocuments({ date: today });

    // 2. Get Today's Detailed List (with Member Names)
    // We use .populate('member', 'name') to get the user's name from the User model
    const todayList = await Attendance.find({ date: today })
      .populate('member', 'name email') 
      .sort({ createdAt: -1 });

    // 3. Get Recent Scans (Last 5 overall for a quick activity feed)
    const recentScans = await Attendance.find()
      .populate('member', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      totalAttendance: totalRecords,
      todayCount: todayCount,
      todayList: todayList,
      recentScans: recentScans,
      reportGeneratedAt: new Date().toLocaleString()
    });
  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ message: "Error generating comprehensive report" });
  }
};
