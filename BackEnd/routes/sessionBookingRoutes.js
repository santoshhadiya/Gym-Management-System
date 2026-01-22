const router = require("express").Router();
const {protect, authorize} =require("../middlewares/authMiddleware.js")
const { bookSession, getMyBookings } =require("../controllers/sessionBookingController.js")

router.post("/:sessionId", protect, authorize("member"), bookSession);
router.get("/my", protect, authorize("member"), getMyBookings);

module.exports= router;