const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true // Optional: if you want to maintain your custom ID
  },
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    trim: true,
    unique: true
  },
  duration: {
    type: Number, // Duration in days (e.g., 30)
    required: [true, 'Please specify duration in days']
  },
  durationLabel: {
    type: String, // Display label (e.g., "1 Month")
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please add an original price']
  },
  discount: {
    type: Number, // Percentage
    default: 0
  },
  accessLevel: {
    type: String,
    enum: ['Gym Only', 'Gym + Group', 'All Access', 'Off-Peak Only'],
    default: 'Gym Only'
  },
  features: {
    type: [String], // Array of strings
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  analytics: {
    enrolled: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    popular: { type: Boolean, default: false }
  },
  createdDate: {
    type: String, // Or Date, keeping String to match your format "YYYY-MM-DD"
    default: () => new Date().toISOString().split('T')[0]
  }
});

module.exports = mongoose.model('Plan', PlanSchema);