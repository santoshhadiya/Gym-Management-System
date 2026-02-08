const Company = require("../models/Company"); // You will need to create this model

/**
 * @desc    Get Public Gym Information
 * @route   GET /api/company
 * @access  Public
 */
exports.getCompanyInfo = async (req, res) => {
  try {
    const company = await Company.findOne();
    res.status(200).json(company || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update Gym Information
 * @route   POST /api/company
 * @access  Private (Admin)
 */
exports.updateCompanyInfo = async (req, res) => {
  try {
    const { 
      name, address, mobile, email, 
      instagram, facebook, logo 
    } = req.body;

    // Updates the single existing document or creates it if it doesn't exist
    const company = await Company.findOneAndUpdate(
      {}, 
      { name, address, mobile, email, instagram, facebook, logo },
      { new: true, upsert: true }
    );

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};