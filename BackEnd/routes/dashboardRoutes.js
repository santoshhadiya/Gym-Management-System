const express = require("express");
const router = express.Router();
const { getTrainerDashboard } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/trainer", protect, authorize("trainer"), getTrainerDashboard);

module.exports = router;