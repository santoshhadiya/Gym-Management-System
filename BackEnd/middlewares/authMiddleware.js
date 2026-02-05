const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 Protect routes (JWT check)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      if (user.status !== "Active") {
        return res.status(401).json({ 
          message: `Your account is ${user.status}. Access denied.`,
          code: "ACCOUNT_DEACTIVATED" // Useful for frontend handling
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

//  Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user?.role}) is not allowed to access this resource`,
      });
    }
   
    next();
  };
};

module.exports = { protect, authorize };
