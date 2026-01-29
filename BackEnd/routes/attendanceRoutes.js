const express = require("express");
const router = express.Router();
const {
  generateQRToken,
  markAttendance,
  getMyAttendance,
} = require("../controllers/attendanceController");

router.get("/generate-token", generateQRToken);


module.exports = router;
