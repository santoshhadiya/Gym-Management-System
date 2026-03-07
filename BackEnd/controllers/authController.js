const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user (Member only public registration)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Default role is 'member' for public registration
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      status: role=="member"? "Active":"Inactive", // Requires Admin Approval
    });

    // Create Member profile if role is member
    if (user.role === "member") {
      await Member.create({
        user: user._id,
        status: "Active",
      });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // Check if active
      if (user.status !== "Active") {
        return res.status(401).json({
          message: `Account is ${user.status}. Please contact admin.`,
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin onboard a trainer
// @route   POST /api/auth/register-trainer
// @access  Private (Admin)
exports.registerTrainer = async (req, res) => {
  try {
    const { name, email, phone, password, trainerDetails } = req.body;

    //  Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Trainer already exists" });
    }

    // Create trainer user
    const trainer = await User.create({
      name,
      email,
      phone,
      password, // hashed by pre-save hook
      role: "trainer",
      trainerDetails, // specialization, experience, etc.
    });

    res.status(201).json({
      _id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      role: trainer.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin onboard a new Admin
// @route   POST /api/auth/register-admin
// @access  Private (Admin)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      phone,
      password, // Automatically hashed by UserSchema pre-save hook
      role: "admin",
      status: "Active", // Admins created by admins are active by default
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password (trainer)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword; //  hashed by pre-save hook
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
 
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with that email" });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const isHosted = false;
  const resetUrl = !isHosted ? `http://localhost:5173/reset-password/${resetToken}` : `https://songars-gym.vercel.app/reset-password/${resetToken}`;

  const message = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        .button:hover {
            background-color: #ffca2b !important;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <h1 style="margin: 0; color: #1e293b; font-size: 28px; font-weight: 900;">Songar's GYM</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 0 40px 20px 40px;">
                            <h2 style="margin: 0; color: #334155; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
                            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin-top: 15px;">
                                Hello, we received a request to reset your password. If this was you, please click the button below to set a new one.
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 20px 40px 40px 40px;">
                            <a href="${resetUrl}" target="_blank" style="background-color: #FEEF75; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(254, 239, 117, 0.4);">
                                RESET PASSWORD
                            </a>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This link is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;


  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: message, 
    });
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ message: "Email could not be sent" });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, token: generateToken(user._id) });
};
