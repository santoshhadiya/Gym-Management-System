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