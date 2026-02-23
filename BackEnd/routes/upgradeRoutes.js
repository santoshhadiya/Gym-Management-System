const express = require("express");
const router = express.Router();

const {
  calculateUpgradeCost,
  getMembershipDetails,
  getPlanHistory,
  getAvailablePlans,
} = require("../controllers/upgradeController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// @route   POST /api/upgrades/calculate
// @desc    Calculate upgrade cost for a new plan
// @access  Private (Member)
router.post("/calculate", protect, authorize("member"), calculateUpgradeCost);

// @route   GET /api/upgrades/membership-details
// @desc    Get current membership with queued plans
// @access  Private (Member)
router.get("/membership-details", protect, authorize("member"), getMembershipDetails);

// @route   GET /api/upgrades/history
// @desc    Get plan purchase history
// @access  Private (Member)
router.get("/history", protect, authorize("member"), getPlanHistory);

// @route   GET /api/upgrades/available-plans
// @desc    Get all available plans with upgrade eligibility
// @access  Private (Member)
router.get("/available-plans", protect, authorize("member"), getAvailablePlans);

module.exports = router;
