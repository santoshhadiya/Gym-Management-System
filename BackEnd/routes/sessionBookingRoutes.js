const router = require("express").Router();
const { protect, authorize } = require("../middlewares/authMiddleware.js");
const {
  bookSession,
  getMyBookings,
  getAllBookingsForAdmin,
  cancelBookingByAdmin,
  cancelMyBooking,
  markAttendance,
  getSessionAttendance,
  markAttendanceManually,
} = require("../controllers/sessionBookingController.js");

// Member Routes
router.post("/:sessionId", protect, authorize("member"), bookSession);
router.get("/my", protect, authorize("member"), getMyBookings);
router.delete("/:sessionId", protect, authorize("member"), cancelMyBooking);

// Attendance Routes
router.post("/mark-attendance", protect, authorize("member"), markAttendance);

// Admin Routes
router.get("/admin", protect, authorize("member"), getMyBookings);
router.put("/:id/cancel", protect, authorize("admin"), cancelBookingByAdmin);
router.get("/admin/all", protect, authorize("admin"), getAllBookingsForAdmin);

// Admin Attendance Routes
router.get("/session/:sessionId/attendance", protect, authorize("admin"), getSessionAttendance);
router.put("/:bookingId/mark-manual", protect, authorize("admin"), markAttendanceManually);

module.exports = router;