const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: String,
  address: String,
  mobile: String,
  email: String,
  instagram: String,
  facebook: String,
  logo: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Company", CompanySchema);