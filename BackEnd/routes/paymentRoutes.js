const express = require("express");
const router = express.Router();

const {
  createPayment,
  getMyPayments,
  recordPayment,
  getAllPayments,
  createRazorpayOrder, 
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Member routes
router.post("/", protect, authorize("member"), createPayment);
router.get("/my", protect, authorize("member"), getMyPayments);
router.post("/razorpay-order", protect, authorize("member"), createRazorpayOrder);
router.post("/verify", protect, authorize("member"), verifyRazorpayPayment);

// Admin routes
router.post("/record", protect, authorize("admin"), recordPayment);
router.get("/all", protect, authorize("admin"), getAllPayments); 

module.exports = router;