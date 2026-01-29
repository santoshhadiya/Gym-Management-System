const express = require("express");
const router = express.Router();
const {
  getAllMedia,
  uploadMedia,
  updateMedia,
  deleteMedia,
  likeMedia,
} = require("../controllers/mediaController");
const upload = require("../middlewares/uploadMiddleware");
const { protect, authorize } = require("../middlewares/authMiddleware"); // Assuming you have these

// Public read, Admin write
router.get("/", getAllMedia);
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("file"),
  uploadMedia,
); // 'file' matches frontend form data key
router.put("/:id", protect, authorize("admin"), updateMedia);
router.delete("/:id", protect, authorize("admin"), deleteMedia);

router.put("/:id/like", protect, likeMedia);

module.exports = router;
