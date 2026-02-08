const express = require("express");
const router = express.Router();
const { getSchedules, updateSchedule } = require("../controllers/scheduleController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public access to view schedule
router.get("/", getSchedules);

// Private access for Admins to manage schedule
router.put("/", protect, authorize("admin"), updateSchedule);

module.exports = router;