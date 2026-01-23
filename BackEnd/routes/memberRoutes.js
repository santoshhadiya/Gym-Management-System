const express = require("express");
const router = express.Router();

const {
  getMemberProfile,
  updateMemberProfile,
  getAllMembers,
  getAllMembersAll,
  createMember,
  updateMemberByAdmin,
  deactivateMember,
} = require("../controllers/memberController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Member routes
router
  .route("/profile")
  .get(protect, authorize("member"), getMemberProfile)
  .put(protect, authorize("member"), updateMemberProfile);

// Admin / Trainer routes
router.post("/", protect, authorize("admin"), createMember);
router.put("/:id", protect, authorize("admin"), updateMemberByAdmin);
router.put("/:id/deactivate", protect, authorize("admin"), deactivateMember);
router.get("/", protect, authorize("admin", "trainer"), getAllMembers);
router.get("/all", protect, authorize("admin"), getAllMembersAll);

module.exports = router;
