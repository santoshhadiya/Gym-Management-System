const router = require("express").Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  createSession,
  getAllSessions,
  updateSession,
  getAvailableSessions,
} = require("../controllers/sessionController");

router.post("/", protect, authorize("admin"), createSession);
router.get("/", protect, getAllSessions);
router.get("/upcoming", protect, getAvailableSessions);
router.put("/:id", protect, authorize("admin"), updateSession);

module.exports = router;
