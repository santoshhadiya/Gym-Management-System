const express = require("express");
const router = express.Router();

const {
  getMemberProfile,
  updateMemberProfile,
  getAllMembers,
  getAllMembersAll,
} = require("../controllers/memberController");

console.log("✅ memberRoutes loaded");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Member routes
router
  .route("/profile")
  .get(protect, authorize("member"), getMemberProfile)
  .put(protect, authorize("member"), updateMemberProfile);

// Admin / Trainer routes
router.get("/", protect, authorize("admin", "trainer"), getAllMembers);
router.get("/all", protect, authorize("admin"), getAllMembersAll);

module.exports = router;
