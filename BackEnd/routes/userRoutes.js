const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// All routes here require the user to be logged in
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

module.exports = router;