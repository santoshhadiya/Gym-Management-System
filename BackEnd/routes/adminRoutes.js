const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getAdminContact,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminImage,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/contact", getAdminContact);
router.route("/users").get(getAllUsers).post(createUser);
router.use(protect);
router.use(authorize("admin"));
router.route("/users/:id").delete(deleteUser);
router.put("/users/:id/status", updateUserStatus);
router.route("/profile").get(getAdminProfile).put(updateAdminProfile);
router.post("/profile/image", upload.single("file"),uploadAdminImage
);
module.exports = router;
