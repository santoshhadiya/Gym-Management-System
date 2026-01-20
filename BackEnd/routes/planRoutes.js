const express = require('express');
const router = express.Router();

const {
  getPlans,
  getAllPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

const { protect, authorize } = require('../middlewares/authMiddleware');

//  Public route
router.get('/', getPlans);

// Admin-only routes
router.get('/admin', protect, authorize('admin'), getAllPlansAdmin);
router.post('/admin', protect, authorize('admin'), createPlan);
router.put('/admin/:id', protect, authorize('admin'), updatePlan);
router.delete('/admin/:id', protect, authorize('admin'), deletePlan);

module.exports = router;
