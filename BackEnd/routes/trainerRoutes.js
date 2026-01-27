const router = require("express").Router();
const { getAllTrainers, getAllTrainersData, createTrainer, updateTrainer, getTrainerMembers, deactivateTrainer, getTrainerProfile, updateTrainerProfile,getTrainerMembersAll } = require("../controllers/trainerController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Self-profile management
router.get("/profile", protect, authorize("trainer"), getTrainerProfile);
router.put("/profile", protect, authorize("trainer"), updateTrainerProfile);
router.get("/:id/members/all", protect, authorize("trainer"), getTrainerMembersAll);


router.get("/", protect, getAllTrainers); 

// Admin specific routes
router.get("/data", protect, authorize("admin"), getAllTrainersData);
router.post("/", protect, authorize("admin"), createTrainer);
router.put("/:id", protect, authorize("admin"), updateTrainer);
router.patch("/:id/deactivate", protect, authorize("admin"), deactivateTrainer);
router.get("/:id/members", protect, authorize("admin"), getTrainerMembers);

module.exports = router;