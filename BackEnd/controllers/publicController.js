// backend/controllers/publicController.js
const User = require("../models/User");
const Member = require("../models/Member");
const Feedback = require("../models/Feedback");

/**
 * @desc    Get aggregate stats and featured feedback for Home Page
 * @route   GET /api/public/home-data
 * @access  Public
 */
exports.getHomeData = async (req, res) => {
  try {
    // 1. Get real counts for stats strip
    const activeMembersCount = await User.countDocuments({ role: "member", status: "Active" });
    const trainerCount = await User.countDocuments({ role: "trainer", status: "Active" });
    
    // 2. [UPDATED] Get top 3 latest 5-star feedbacks that have been Reviewed by Admin
    const testimonials = await Feedback.find({ 
        rating: 5, 
        status: "Reviewed"  // Only show moderated feedback
      })
      .populate("member", "name profileImage")
      .sort({ createdAt: -1 })
      

    const formattedTestimonials = testimonials.map(t => ({
      name: t.member?.name || "Anonymous Member",
      role: "Verified Member",
      review: t.comment,
      rating: t.rating,
      image: t.member?.profileImage || ""
    }));

    res.json({
      stats: {
        members: activeMembersCount,
        trainers: trainerCount,
        access: "24/7",
        rating: "4.9"
      },
      testimonials: formattedTestimonials
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};