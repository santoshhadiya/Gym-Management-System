const router = require("express").Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  createSession,
  getAllSessions,
  updateSession,
  getAvailableSessions,
  deleteSession,
  generateSessionQR,
  validateSessionQR,
} = require("../controllers/sessionController");

// Session CRUD routes
router.post("/", protect, authorize("admin"), createSession);
router.get("/", protect, getAllSessions);
router.get("/upcoming", protect, getAvailableSessions);
router.put("/:id", protect, authorize("admin"), updateSession);
router.delete("/:id", protect, authorize("admin"), deleteSession);

// QR Code routes
router.post("/:id/generate-qr", protect, authorize("admin"), generateSessionQR);
router.post("/validate-qr", protect, validateSessionQR);

module.exports = router;