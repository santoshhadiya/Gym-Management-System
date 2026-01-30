const express = require("express");
const router = express.Router();
const { 
  generateQRToken, 
  markAttendance, 
  getMyAttendance,
  getAttendanceReport // New report function
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// --- Admin Only Routes ---
// It is safer to group these or ensure the controller functions exist
router.get("/generate-token", protect, authorize("admin"), generateQRToken);
router.get("/report", protect, authorize("admin"), getAttendanceReport);

// --- User & Member Routes ---
router.post("/mark", protect, markAttendance);
router.get("/my-history", protect, getMyAttendance);
router.get("/report", protect, authorize("admin"), getAttendanceReport);

module.exports = router;