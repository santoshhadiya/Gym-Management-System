const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    audience: {
      type: String,
      enum: ["All Users", "Members Only", "Trainers Only"],
      default: "All Users",
    },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Critical"],
      default: "Normal",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    notify: {
      type: Boolean,
      default: false,
    },
    attachment: {
      type: String, // URL or filename
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);