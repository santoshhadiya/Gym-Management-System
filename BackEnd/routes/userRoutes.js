const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile,getAllAdmins} = require('../controllers/userController');
const { protect,authorize } = require('../middlewares/authMiddleware');

// All routes here require the user to be logged in
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);
router.get('/admins', protect, authorize('admin'), getAllAdmins);

module.exports = router;