const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementFeed
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Admin Management Routes
router.get("/", protect, authorize("admin"), getAnnouncements);
router.post("/", protect, authorize("admin"), createAnnouncement);
router.put("/:id", protect, authorize("admin"), updateAnnouncement);
router.delete("/:id", protect, authorize("admin"), deleteAnnouncement);

// Feed for Users (Not used in Admin panel but good to have)
router.get("/feed", protect, getAnnouncementFeed);

module.exports = router;