const express = require("express");
const router = express.Router();

const {
  createPayment,
  getMyPayments,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/", protect, authorize("member"), createPayment);
router.get("/my", protect, authorize("member"), getMyPayments);

module.exports = router;
