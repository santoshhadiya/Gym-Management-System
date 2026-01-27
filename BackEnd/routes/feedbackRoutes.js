const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  updateMyFeedback,
  getTrainersFeedback,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/trainer", protect, authorize("trainer"), getTrainersFeedback);


// Member routes
router.post("/", protect, authorize("member"), createFeedback);
router.post("/:id", protect, authorize("member"), updateMyFeedback);
router.get("/my", protect, authorize("member"), getMyFeedback);

// Admin routes
router.get("/", protect, authorize("admin"), getAllFeedback);
router.put("/:id/status", protect, authorize("admin"), updateFeedbackStatus);




module.exports = router;
