const express = require("express");
const router = express.Router();
const { 
  getLibraries,
  getPlans, 
  getMyPlan, 
  saveWorkout, 
  saveDiet, 
  trackProgress, 
  trackWeight,
  getHistory,
  deletePlan
} = require("../controllers/workoutDietController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Get Exercise & Food Libraries
router.get("/libraries", protect, authorize("trainer"), getLibraries);

// Progress & Weight Tracking
router.post("/progress", protect, authorize("member"), trackProgress);
router.post("/weight", protect, authorize("member"), trackWeight);

// Member History
router.get("/history", protect, authorize("member"), getHistory);

// Member Route (Must come before :memberId)
router.get("/my/plan", protect, authorize("member"), getMyPlan);

// Shared Read Access
router.get("/:memberId", protect, getPlans);

// Trainer Write Access
router.post("/:memberId/workout", protect, authorize("trainer"), saveWorkout);
router.post("/:memberId/diet", protect, authorize("trainer"), saveDiet);

// Delete Plan
router.delete("/:memberId/:type/:date", protect, authorize("trainer"), deletePlan);

module.exports = router;