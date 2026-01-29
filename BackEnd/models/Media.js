const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  url: {
    type: String, // Stores path "uploads/filename.jpg"
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Transformations", "Gym Events", "Equipment", "Workout Sessions"],
    default: "Gym Events",
  },
  visibility: {
    type: String,
    enum: ["Public", "Members Only", "Admin Only"],
    default: "Public",
  },
  views: {
    type: Number,
    default: 0,
  },
  // [UPDATED] Store array of User References instead of a number
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: {
    type: String,
    enum: ["Approved", "Pending"],
    default: "Approved",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Media", mediaSchema);