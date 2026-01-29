const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// All routes are protected and for admins only
router.use(protect);
router.use(authorize("admin"));

router.get("/", equipmentController.getAllEquipment);
router.post("/", equipmentController.createEquipment);
router.put("/:id", equipmentController.updateEquipment);
router.delete("/:id", equipmentController.deleteEquipment);

module.exports = router;