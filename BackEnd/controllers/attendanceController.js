exports.markAttendance = async (req, res) => {
  const { token } = req.body;
  console.log("--- New Attendance Request ---");
  console.log("User ID:", req.user?._id);
  console.log("Received Token:", token ? "Token present" : "Token MISSING");

  try {
    // 1. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token Data:", decoded);

    const today = new Date().toISOString().split('T')[0];
    console.log("Checking attendance for date:", today);

    // 2. Check for Duplicate
    const existing = await Attendance.findOne({ member: req.user._id, date: today });
    if (existing) {
      console.log("Duplicate found for user on this date.");
      return res.status(400).json({ message: "Attendance already marked for today" });
    }

    // 3. Attempt Create
    const record = await Attendance.create({
      member: req.user._id,
      date: today,
      checkInTime: new Date().toLocaleTimeString()
    });

    console.log("Record successfully saved to DB:", record);
    res.status(201).json(record);

  } catch (err) {
    // Log the specific error name and message
    console.error("Attendance Error Details:");
    console.error("Name:", err.name); 
    console.error("Message:", err.message);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid QR code format" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "QR code has expired (30s limit)" });
    }
    
    res.status(500).json({ message: "Server error during saving", error: err.message });
  }
};