const express = require("express");
const router = express.Router();
const { 
  generateQRToken, 
  markAttendance, 
  getMyAttendance,
  getAttendanceReport // New report function
} = require("../controllers/attendanceController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/generate-token", protect, admin, generateQRToken);
router.post("/mark", protect, markAttendance);
router.get("/my-history", protect, getMyAttendance);
router.get("/report", protect, admin, getAttendanceReport);

module.exports = router;