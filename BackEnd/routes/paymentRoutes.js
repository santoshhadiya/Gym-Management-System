const express = require("express");
const router = express.Router();

const {
  createPayment,
  getMyPayments,
  recordPayment,
  getAllPayments, //  Import new controller
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Member routes
router.post("/", protect, authorize("member"), createPayment);
router.get("/my", protect, authorize("member"), getMyPayments);

// Admin routes
router.post("/record", protect, authorize("admin"), recordPayment);
router.get("/all", protect, authorize("admin"), getAllPayments); // ✅ New Route

module.exports = router;