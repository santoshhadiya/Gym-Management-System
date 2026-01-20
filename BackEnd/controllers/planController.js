const Plan = require('../models/Plan');

// @desc    Get all active plans (Public)
// @route   GET /api/plans
// @access  Public
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'Active' });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all plans (Admin)
// @route   GET /api/admin/plans
// @access  Private/Admin
exports.getAllPlansAdmin = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a plan
// @route   POST /api/admin/plans
// @access  Private/Admin
exports.createPlan = async (req, res) => {
  try {
    // Basic logic to generate a simple numeric ID if needed, 
    // though MongoDB _id is preferred. 
    // This is just to match your specific 'id: 1' requirement.
    const count = await Plan.countDocuments();
    const newPlan = { ...req.body, id: count + 1 };
    
    const plan = await Plan.create(newPlan);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a plan
// @route   PUT /api/admin/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res) => {
  try {
    // Assuming :id is the MongoDB _id. 
    // If you want to update by your custom 'id', use findOneAndUpdate({id: req.params.id}...)
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(200).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/admin/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    await plan.deleteOne();
    res.status(200).json({ message: 'Plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};