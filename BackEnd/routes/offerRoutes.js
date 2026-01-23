const express = require("express");
const router = express.Router();

const {
  createOffer,
  deactivateOffer,
  getOffers,
} = require("../controllers/offerController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Admin only
router.post("/", protect, authorize("admin"), createOffer);
router.get("/", protect, authorize("admin"), getOffers);
router.put("/:planId/deactivate", protect, authorize("admin"), deactivateOffer);

module.exports = router;
