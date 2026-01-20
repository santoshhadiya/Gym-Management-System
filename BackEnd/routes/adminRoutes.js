const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/status', updateUserStatus);

module.exports = router;
