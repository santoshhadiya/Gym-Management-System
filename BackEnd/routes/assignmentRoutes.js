const router = require("express").Router();
const { assignTrainer,unassignTrainer,getAssignmentHistory } = require("../controllers/assignmentController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/", protect, authorize("admin"), assignTrainer);
router.delete("/:memberId", protect, authorize("admin"), unassignTrainer);
router.get("/history", protect, authorize("admin"), getAssignmentHistory);

module.exports = router;