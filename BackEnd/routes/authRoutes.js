const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  registerTrainer,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect,authorize } = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/register-trainer", protect, authorize("admin"), registerTrainer);
router.put("/change-password", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
