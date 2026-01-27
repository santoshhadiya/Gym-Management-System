const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getAdminContact
} = require("../controllers/adminController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/contact", getAdminContact);

// trainer and admin can access this.
router.route("/users").get(getAllUsers).post(createUser);

// All admin routes
router.use(protect);
router.use(authorize("admin"));


router.route("/users/:id").delete(deleteUser);

router.put("/users/:id/status", updateUserStatus);

module.exports = router;
