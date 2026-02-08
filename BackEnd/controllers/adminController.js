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

// @desc    Get Admin Contact Info (For Trainers to chat)
// @route   GET /api/admin/contact
// @access  Private (Trainers/Admin)
exports.getAdminContact = async (req, res) => {
    try {
        // Find the first admin user (assuming single owner scenario for simplicity)
        const admin = await User.findOne({ role: 'admin' }).select('name email profileImage role');
        if (!admin) return res.status(404).json({ message: "Admin contact not found" });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * @desc   Get admin profile information
 * @route  GET /api/admin/profile
 * @access Private (Admin)
 */
exports.getAdminProfile = async (req, res) => {
  try {
    // Fetch admin details, excluding password
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Update admin profile text data
 * @route  PUT /api/admin/profile
 * @access Private (Admin)
 */
exports.updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update basic fields
    admin.name = req.body.name || admin.name;
    admin.phone = req.body.phone || admin.phone;
    admin.address = req.body.address || admin.address;

    // Handle password update if provided
    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      address: updatedAdmin.address,
      profileImage: updatedAdmin.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Upload Admin Local Profile Image
 * @route  POST /api/admin/profile/image
 * @access Private (Admin)
 */
exports.uploadAdminImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Store relative path for the local file
    const url = `uploads/${req.file.filename}`;

    const updatedAdmin = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: url },
      { new: true }
    ).select("-password");

    res.json({ 
      message: "Admin profile image updated", 
      profileImage: updatedAdmin.profileImage 
    });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed" });
  }
};