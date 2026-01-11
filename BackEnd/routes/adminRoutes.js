const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUserStatus, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes are protected and require Admin role
router.use(protect);
router.use(admin);

router.route('/users').get(getAllUsers).post(createUser);

router.route('/users/:id').delete(deleteUser);

router.put('/users/:id/status', updateUserStatus);

module.exports = router;