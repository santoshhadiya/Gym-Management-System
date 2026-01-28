const express = require("express");
const router = express.Router();
const { getPlans, getMyPlan, saveWorkout, saveDiet, trackProgress, trackWeight } = require("../controllers/workoutDietController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Progress & Weight Tracking
router.post("/progress", protect, authorize("member"), trackProgress);
router.post("/weight", protect, authorize("member"), trackWeight); // ✅ New Route

// Member Route (Must come before :memberId)
router.get("/my/plan", protect, authorize("member"), getMyPlan);

// Shared Read Access
router.get("/:memberId", protect, getPlans);

// Trainer Write Access
router.post("/:memberId/workout", protect, authorize("trainer"), saveWorkout);
router.post("/:memberId/diet", protect, authorize("trainer"), saveDiet);

module.exports = router;