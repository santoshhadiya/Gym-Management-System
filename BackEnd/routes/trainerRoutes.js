const router = require("express").Router();
const { getAllTrainers,getAllTrainersData,createTrainer,updateTrainer,getTrainerMembers,deactivateTrainer } = require("../controllers/trainerController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/", protect, authorize("admin"), getAllTrainers);
router.get("/data", protect, authorize("admin"), getAllTrainersData);
router.post("/", protect, authorize("admin"), createTrainer);
router.put("/:id", protect, authorize("admin"), updateTrainer);
router.patch("/:id/deactivate", protect, authorize("admin"), deactivateTrainer);
router.get("/:id/members", protect, authorize("admin"), getTrainerMembers);


module.exports = router;
