const Session = require("../models/Session.js");
const crypto = require("crypto");

exports.createSession = async (req, res) => {
  try {
    const { 
      trainer, 
      additionalTrainers, 
      externalTrainers, 
      type, 
      date, 
      time, 
      duration, 
      status, 
      notes, 
      capacity 
    } = req.body;

    // Validate at least one trainer is provided
    if (!trainer) {
      return res.status(400).json({ message: "Primary trainer is required" });
    }

    // Remove duplicates from additionalTrainers (exclude primary trainer)
    let cleanedAdditionalTrainers = [];
    if (additionalTrainers && Array.isArray(additionalTrainers)) {
      cleanedAdditionalTrainers = additionalTrainers.filter(
        t => t && t !== trainer
      );
    }

    // Clean and validate external trainers
    let cleanedExternalTrainers = [];
    if (externalTrainers && Array.isArray(externalTrainers)) {
      cleanedExternalTrainers = externalTrainers
        .filter(name => name && name.trim() !== "")
        .map(name => name.trim());
    }

    const session = await Session.create({
      trainer,
      additionalTrainers: cleanedAdditionalTrainers,
      externalTrainers: cleanedExternalTrainers,
      type,
      date,
      time,
      duration: duration || "60 mins",
      status: status || "Upcoming",
      notes: notes || "",
      capacity: capacity || 10,
      bookedCount: 0,
      createdBy: req.user.id,
    });

    // Populate trainer references before sending response
    await session.populate('trainer', 'name email');
    await session.populate('additionalTrainers', 'name email');

    res.status(201).json(session);
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("trainer", "name email")
      .populate("additionalTrainers", "name email")
      .sort({ date: -1, time: -1 });

    res.json(sessions);
  } catch (err) {
    console.error("GET ALL SESSIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { 
      trainer, 
      additionalTrainers, 
      externalTrainers, 
      type, 
      date, 
      time, 
      duration, 
      status, 
      notes, 
      capacity,
      cancelReason
    } = req.body;

    // Find the session first
    const existingSession = await Session.findById(req.params.id);
    if (!existingSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Prepare update object
    const updateData = {};
    
    if (trainer !== undefined) updateData.trainer = trainer;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;

    // Handle additionalTrainers
    if (additionalTrainers !== undefined) {
      if (Array.isArray(additionalTrainers)) {
        // Remove duplicates and exclude primary trainer
        const cleanedAdditional = additionalTrainers.filter(
          t => t && t !== updateData.trainer && t !== existingSession.trainer?.toString()
        );
        updateData.additionalTrainers = cleanedAdditional;
      } else {
        updateData.additionalTrainers = [];
      }
    }

    // Handle externalTrainers
    if (externalTrainers !== undefined) {
      if (Array.isArray(externalTrainers)) {
        const cleanedExternal = externalTrainers
          .filter(name => name && name.trim() !== "")
          .map(name => name.trim());
        updateData.externalTrainers = cleanedExternal;
      } else {
        updateData.externalTrainers = [];
      }
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    )
      .populate("trainer", "name email")
      .populate("additionalTrainers", "name email");

    res.json(session);
  } catch (err) {
    console.error("UPDATE SESSION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET upcoming sessions
exports.getAvailableSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      status: "Upcoming",
      date: { $gte: new Date().toISOString().split("T")[0] }
    })
      .populate("trainer", "name specialization")
      .populate("additionalTrainers", "name specialization")
      .sort({ date: 1, time: 1 });

    res.json(sessions);
  } catch (err) {
    console.error("GET AVAILABLE SESSIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Session deleted successfully", session });
  } catch (err) {
    console.error("DELETE SESSION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// NEW: Generate QR code for a session
exports.generateSessionQR = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if session is upcoming
    if (session.status !== "Upcoming") {
      return res.status(400).json({ 
        message: "QR codes can only be generated for upcoming sessions" 
      });
    }

    const qrId = crypto.randomBytes(32).toString('hex');
    const sessionDate = new Date(session.date);
    const expiryDate = new Date(sessionDate);
    expiryDate.setHours(23, 59, 59, 999); // Expires at end of session day

    // Update session state
    session.currentQrId = qrId;
    session.qrGeneratedAt = new Date();
    session.qrExpiresAt = expiryDate;

    // SAFETY CHECK: Initialize if it doesn't exist for older documents
    if (!session.qrHistory) {
      session.qrHistory = [];
    }

    session.qrHistory.push({
      qrId: qrId,
      generatedAt: new Date(),
      generatedBy: req.user.id, // ID of admin generating the code
    });

    await session.save();

    const qrData = {
      sessionId: session._id.toString(),
      sessionType: session.type,
      sessionDate: session.date,
      sessionTime: session.time,
      qrId: qrId,
      generatedAt: new Date().toISOString(),
      expiresAt: expiryDate.toISOString(),
    };

    res.json({
      message: "QR code generated successfully",
      qrData: qrData,
      session: session
    });

  } catch (err) {
    console.error("GENERATE QR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// NEW: Validate if QR is still valid
exports.validateSessionQR = async (req, res) => {
  try {
    const { sessionId, qrId } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if QR ID matches
    if (session.currentQrId !== qrId) {
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    // Check if QR is still valid
    if (!session.isQRValid()) {
      return res.status(400).json({ 
        message: "QR code has expired or is not valid for today" 
      });
    }

    res.json({ 
      valid: true, 
      message: "QR code is valid",
      session: session
    });

  } catch (err) {
    console.error("VALIDATE QR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};