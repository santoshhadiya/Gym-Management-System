const Member = require("../models/Member");
const User = require("../models/User");
const Session = require("../models/Session");
const SessionBooking = require("../models/SessionBooking");
const Feedback = require("../models/Feedback");
const Workout = require("../models/Workout");

// @desc    Get comprehensive trainer dashboard data
// @route   GET /api/dashboard/trainer
// @access  Private (Trainer)
exports.getTrainerDashboard = async (req, res) => {
  try {
    const trainerId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // 1. Parallel Data Fetching - Comprehensive trainer metrics
    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      todaySessions,
      upcomingSessions,
      completedSessions,
      totalPlans,
      feedbacks,
      members,
      allSessions
    ] = await Promise.all([
      // Total members assigned to trainer
      Member.countDocuments({ assignedTrainer: trainerId }),
      
      // Active members (with active membership status)
      Member.countDocuments({ assignedTrainer: trainerId, status: "Active" }),
      
      // Inactive members
      Member.countDocuments({ assignedTrainer: trainerId, status: "Inactive" }),
      
      // Today's sessions
      Session.find({ 
        trainer: trainerId,
        date: today,
        status: { $in: ["Upcoming", "Confirmed"] }
      }).populate("trainer", "name"),
      
      // Upcoming sessions (next 30 days)
      Session.find({ 
        trainer: trainerId,
        date: { $gte: today },
        status: { $in: ["Upcoming", "Confirmed"] }
      }).populate("trainer", "name").sort({ date: 1 }).limit(50),
      
      // Completed sessions (last 30 days)
      Session.find({ 
        trainer: trainerId,
        status: "Completed",
        date: { $gte: thirtyDaysAgo }
      }),
      
      // Total plans created by trainer
      Workout.countDocuments({ trainer: trainerId }),
      
      // Recent feedback
      Feedback.find({ type: "Trainer" })
        .populate("member", "name email")
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Get all members with details for analytics
      Member.find({ assignedTrainer: trainerId })
        .populate("user", "name email status createdAt")
        .populate("plan", "name"),
      
      // Get all sessions for the week to calculate stats
      Session.find({ 
        trainer: trainerId,
        date: { $gte: weekStartStr },
        status: { $in: ["Upcoming", "Completed", "Confirmed"] }
      })
    ]);

    // 2. Calculate detailed metrics
    const trainerProfile = req.user;
    const totalSessionsCompleted = completedSessions?.length || 0;
    const totalSessionsApproaching = upcomingSessions?.length || 0;
    
    // Format today's sessions with all details
    const formattedTodaysSessions = (todaySessions && todaySessions.length > 0) 
      ? todaySessions.map(s => ({
          id: s._id,
          time: s.time || "TBD",
          duration: s.duration || "60 mins",
          type: s.type || "Personal Training",
          date: s.date,
          status: s.status || "Upcoming",
          capacity: s.capacity || 10,
          bookedCount: s.bookedCount || 0,
          trainer: s.trainer?.name || "Unknown"
        }))
      : [];

    // Format upcoming sessions with all details
    const formattedUpcomingSessions = (upcomingSessions && upcomingSessions.length > 0)
      ? upcomingSessions.slice(0, 5).map(s => ({
          id: s._id,
          date: s.date,
          time: s.time || "TBD",
          type: s.type || "Training",
          status: s.status || "Upcoming",
          capacity: s.capacity || 10,
          bookedCount: s.bookedCount || 0,
          trainer: s.trainer?.name || "Unknown"
        }))
      : [];

    // Fitness goals distribution from members
    const goalsDistribution = {
      "Muscle Gain": (members || []).filter(m => m.fitnessGoal === "Muscle Gain").length,
      "Weight Loss": (members || []).filter(m => m.fitnessGoal === "Weight Loss").length,
      "General Fitness": (members || []).filter(m => m.fitnessGoal === "General Fitness").length,
      "Flexibility": (members || []).filter(m => m.fitnessGoal === "Flexibility").length,
      "Endurance": (members || []).filter(m => m.fitnessGoal === "Endurance").length
    };

    // Recent activity feed combining feedback and sessions
    const recentActivity = [
      ...(feedbacks && feedbacks.length > 0 ? feedbacks.map(f => ({
        id: `feedback-${f._id}`,
        type: "feedback",
        text: `Feedback from ${f.member?.name || 'Member'}: "${f.comment ? f.comment.substring(0, 30) : 'New feedback'}..."`,
        timestamp: f.createdAt,
        icon: "fa-comment-dots",
        color: "text-yellow-500"
      })) : []),
      ...(formattedTodaysSessions && formattedTodaysSessions.length > 0 ? formattedTodaysSessions.slice(0, 5).map(s => ({
        id: `session-${s.id}`,
        type: "session",
        text: `${s.type} session at ${s.time} - Capacity: ${s.bookedCount}/${s.capacity}`,
        timestamp: new Date(),
        icon: "fa-dumbbell",
        color: "text-blue-500"
      })) : [])
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

    // Session performance data for chart (last 7 days)
    const dailySessionCounts = {};
    const dailyCompletedCounts = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailySessionCounts[dateStr] = 0;
      dailyCompletedCounts[dateStr] = 0;
    }

    if (allSessions && allSessions.length > 0) {
      allSessions.forEach(s => {
        const dateStr = s.date;
        if (dateStr in dailySessionCounts) {
          dailySessionCounts[dateStr]++;
          if (s.status === "Completed") {
            dailyCompletedCounts[dateStr]++;
          }
        }
      });
    }

    const sessionChartData = {
      labels: Object.keys(dailySessionCounts).map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: "Sessions Scheduled",
          data: Object.values(dailySessionCounts),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true
        },
        {
          label: "Sessions Completed",
          data: Object.values(dailyCompletedCounts),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Client status overview
    const clientStatusData = {
      labels: ["Active", "Inactive"],
      datasets: [{
        data: [activeMembers || 0, inactiveMembers || 0],
        backgroundColor: ["#10b981", "#ef4444"]
      }]
    };

    // Goals distribution for chart
    const goalsChartData = {
      labels: Object.keys(goalsDistribution),
      datasets: [{
        data: Object.values(goalsDistribution),
        backgroundColor: ["#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981"]
      }]
    };

    // 3. Format Dashboard Response with comprehensive data
    res.json({
      trainer: {
        name: trainerProfile?.name || "Coach",
        email: trainerProfile?.email || "N/A",
        profileImage: trainerProfile?.profileImage || null,
        specialization: trainerProfile?.trainerDetails?.specialization || "Physical Training",
        experience: trainerProfile?.trainerDetails?.experience || "5+ years"
      },
      stats: [
        { 
          label: "Active Clients", 
          value: activeMembers || 0, 
          icon: "fa-users", 
          color: "bg-blue-100", 
          text: "text-blue-900",
          trend: "↑",
          description: "+2 this month"
        },
        { 
          label: "Today's Sessions", 
          value: todaySessions?.length || 0, 
          icon: "fa-calendar-check", 
          color: "bg-green-100", 
          text: "text-green-900",
          trend: "→",
          description: "On Track"
        },
        { 
          label: "Total Plans", 
          value: totalPlans || 0, 
          icon: "fa-file-lines", 
          color: "bg-yellow-100", 
          text: "text-yellow-900",
          trend: "↑",
          description: "+5 this month"
        }
      ],
      overview: {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        inactiveMembers: inactiveMembers || 0,
        completedSessionsThisMonth: totalSessionsCompleted,
        upcomingSessionsNext30Days: totalSessionsApproaching
      },
      todaysSessions: formattedTodaysSessions,
      upcomingSessions: formattedUpcomingSessions,
      recentActivity,
      charts: {
        sessionPerformance: sessionChartData,
        clientStatus: clientStatusData,
        goalsDistribution: goalsChartData
      },
      members: (members || []).map(m => ({
        _id: m._id,
        name: m.user?.name || "Unknown",
        email: m.user?.email || "N/A",
        plan: m.plan?.name || "No Plan",
        goal: m.fitnessGoal || "General Fitness",
        status: m.user?.status || "Inactive",
        height: m.height || 0,
        currentWeight: m.currentWeight || 0
      }))
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};