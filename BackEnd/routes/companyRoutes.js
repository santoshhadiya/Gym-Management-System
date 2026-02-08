const express = require("express");
const router = express.Router();
const { getCompanyInfo, updateCompanyInfo } = require("../controllers/companyController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public route for landing page/footer
router.get("/", getCompanyInfo);

// Protected route for Admin Profile page
router.post("/", protect, authorize("admin"), updateCompanyInfo);

module.exports = router;