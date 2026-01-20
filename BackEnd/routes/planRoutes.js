const express = require('express');
const router = express.Router();
const { 
  getPlans, 
  getAllPlansAdmin, 
  createPlan, 
  updatePlan, 
  deletePlan 
} = require('../controllers/planController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route
router.get('/', getPlans);

// Admin routes
router.use(protect); 
router.use(admin);

router.get('/admin', getAllPlansAdmin);
router.post('/admin', createPlan);
router.put('/admin/:id', updatePlan);
router.delete('/admin/:id', deletePlan);

module.exports = router;