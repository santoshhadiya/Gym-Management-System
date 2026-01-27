const express = require("express");
const router = express.Router();
const {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry
} = require("../controllers/inquiryController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public route
router.post("/", createInquiry);

// Admin routes
router.get("/", protect, authorize("admin"), getAllInquiries);
router.put("/:id", protect, authorize("admin"), updateInquiryStatus);
router.delete("/:id", protect, authorize("admin"), deleteInquiry);

module.exports = router;