const jwt = require('jsonwebtoken');

// Inside your router.get('/generate-token', protect, ...)
const generateToken = (req, res) => {
  try {
    // Token expires in 10s to allow a small buffer for scanning
    const qrToken = jwt.sign(
      { userId: req.user._id, timestamp: Date.now() }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10s' }
    );
    res.json({ qrToken });
  } catch (error) {
    res.status(500).json({ message: "Error generating code" });
  }
};