const User = require('../models/User');

// @desc    Get user profile (Self)
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (Self)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Update basic fields if they exist in request body
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.profileImage = req.body.profileImage || user.profileImage;
      
      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      // Handle Role Specific Updates (Optional: prevent members from editing these if strictly managed by admin/trainer)
      // For now, allowing basic updates or you can restrict this block
      if (user.role === 'member' && req.body.fitnessGoal) {
         user.memberDetails.fitnessGoal = req.body.fitnessGoal;
      }
      // Add more specific field updates as needed...

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage,
        memberDetails: updatedUser.memberDetails,
        trainerDetails: updatedUser.trainerDetails,
        // Send back token if needed, or rely on existing token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};