const router = require("express").Router();
const { protect, authorize } = require("../middlewares/authMiddleware.js");
const {
  bookSession,
  getMyBookings,
  getAllBookingsForAdmin,
  cancelBookingByAdmin,
} = require("../controllers/sessionBookingController.js");

router.post("/:sessionId", protect, authorize("member"), bookSession);
router.get("/my", protect, authorize("member"), getMyBookings);
router.get("/admin", protect, authorize("member"), getMyBookings);
router.put("/:id/cancel", protect, authorize("admin"), cancelBookingByAdmin);
router.get("/admin/all", protect, authorize("admin"), getAllBookingsForAdmin);

module.exports = router;
