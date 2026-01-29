const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["Cardio", "Strength", "Accessories", "Recovery"],
    default: "Cardio"
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ["Good", "Repair Needed", "Out of Order", "Retired"],
    default: "Good"
  },
  purchaseDate: {
    type: Date,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Equipment", equipmentSchema);