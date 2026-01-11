const User = require('../models/User');

// @desc    Get all users (Members, Trainers, Admins)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // Filter by role if needed
    const query = role ? { role } : {};
    
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Trainer or Admin manually
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { name, email, password, phone, role, trainerDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role, // Can be 'trainer' or 'admin'
      status: 'Active', // Admin created users are active by default
      trainerDetails: role === 'trainer' ? trainerDetails : undefined
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User Status (Approve/Reject/Suspend)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = req.body.status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};