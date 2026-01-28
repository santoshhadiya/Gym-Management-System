const router = require("express").Router();
const { protect, authorize } = require("../middlewares/authMiddleware.js");
const {
  bookSession,
  getMyBookings,
  getAllBookingsForAdmin,
  cancelBookingByAdmin,
  cancelMyBooking, // <--- Import the new controller
} = require("../controllers/sessionBookingController.js");

// Member Routes
router.post("/:sessionId", protect, authorize("member"), bookSession);
router.get("/my", protect, authorize("member"), getMyBookings);

// [NEW] Route for cancellation (Matches Frontend: activeApi.delete(`/session-bookings/${sessionId}`))
router.delete("/:sessionId", protect, authorize("member"), cancelMyBooking);

// Admin Routes
router.get("/admin", protect, authorize("member"), getMyBookings); // Note: This route path looks redundant with 'get/my', double check your requirement
router.put("/:id/cancel", protect, authorize("admin"), cancelBookingByAdmin);
router.get("/admin/all", protect, authorize("admin"), getAllBookingsForAdmin);

module.exports = router;