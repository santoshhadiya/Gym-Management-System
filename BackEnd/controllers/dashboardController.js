const Member = require("../models/Member");
const User = require("../models/User");
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");
const Workout = require("../models/Workout");

// @desc    Get comprehensive trainer dashboard data
// @route   GET /api/dashboard/trainer
// @access  Private (Trainer)
exports.getTrainerDashboard = async (req, res) => {
  try {
    const trainerId = req.user.id;

    // 1. Parallel Data Fetching
    const [activeClients, sessions, feedbacks, pendingPlans] = await Promise.all([
      // Count total members assigned to this trainer
      Member.countDocuments({ assignedTrainer: trainerId }),
      
      // Get today's sessions for this trainer
      Session.find({ 
        trainer: trainerId,
        date: new Date().toISOString().split('T')[0] 
      }).populate("member", "name"),

      // Get recent feedback for this trainer
      Feedback.find({ type: "Trainer" }) // Or filter by specific trainer if linked
        .populate("member", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      // Count workout plans created by this trainer that might need updates
      Workout.countDocuments({ trainer: trainerId })
    ]);

    // 2. Format Activity Feed (Mocking some for UX, can be linked to a real 'Logs' model)
    const recentActivity = feedbacks.map(f => ({
      id: f._id,
      text: `New feedback from ${f.member?.name || 'User'}: "${f.comment.substring(0, 20)}..."`,
      time: "Recent",
      icon: "fa-comment-dots",
      color: "text-yellow-600"
    }));

    // 3. Format Dashboard Response
    res.json({
      stats: [
        { label: "Active Clients", value: activeClients, icon: "fa-users", color: "bg-[#CDE7FE]", text: "text-blue-900" },
        { label: "Today's Sessions", value: sessions.length, icon: "fa-dumbbell", color: "bg-[#D9F17F]", text: "text-green-900" },
        { label: "Total Plans", value: pendingPlans, icon: "fa-clipboard-list", color: "bg-[#FEEF75]", text: "text-yellow-900" },
        { label: "Avg Rating", value: req.user.trainerDetails?.rating || "5.0", icon: "fa-star", color: "bg-purple-100", text: "text-purple-900" },
      ],
      todaysSessions: sessions.map(s => ({
        id: s._id,
        time: s.startTime || "TBD",
        client: s.member?.name || "Unknown",
        type: s.type || "Personal Training",
        status: s.status || "Upcoming"
      })),
      recentActivity,
      // Aggregating goals distribution from assigned members
      goalsData: {
        labels: ["General", "Weight Loss", "Muscle Gain"],
        datasets: [{
          data: [10, 5, 9], // Replace with actual aggregation logic from Member.fitnessGoal
          backgroundColor: ["#D9F17F", "#CDE7FE", "#FEEF75"]
        }]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};