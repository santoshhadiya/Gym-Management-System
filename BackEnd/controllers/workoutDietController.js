const Workout = require("../models/Workout");
const Diet = require("../models/Diet");
const Member = require("../models/Member");
const Progress = require("../models/Progress");
const WeightLog = require("../models/WeightLog"); // ✅ Import

// Helper to initialize empty week structure
const getEmptyWeeks = (numWeeks = 4) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeks = [];
  for (let i = 1; i <= numWeeks; i++) {
    const weekDays = days.map(d => ({ 
        day: d, 
        plan: "", 
        calorieTarget: 0, // ✅ Init
        meals: { Breakfast: "", Lunch: "", Snacks: "", Dinner: "" },
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }));
    weeks.push({ weekNumber: i, days: weekDays });
  }
  return weeks;
};

// @desc    Get Workout & Diet Plans for a Member (by ID)
// @route   GET /api/workout-diet/:memberId
// @access  Private (Trainer/Member)
exports.getPlans = async (req, res) => {
  try {
    const { memberId } = req.params;

    let workout = await Workout.findOne({ member: memberId });
    let diet = await Diet.findOne({ member: memberId });
    const progress = await Progress.find({ member: memberId }).sort({ date: -1 });
    const weightHistory = await WeightLog.find({ member: memberId }).sort({ date: -1 }); // ✅ Fetch Weight

    if (!workout) {
       workout = { weeks: getEmptyWeeks(), lastUpdated: null };
    }
    if (!diet) {
       diet = { weeks: getEmptyWeeks(), lastUpdated: null };
    }

    res.json({ workout, diet, progress, weightHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get MY Workout & Diet Plans (Member)
// @route   GET /api/workout-diet/my/plan
// @access  Private (Member)
exports.getMyPlan = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id });
    if (!member) return res.status(404).json({ message: "Member profile not found" });

    let workout = await Workout.findOne({ member: member._id });
    let diet = await Diet.findOne({ member: member._id });
    const progress = await Progress.find({ member: member._id });
    const weightHistory = await WeightLog.find({ member: member._id }).sort({ date: 1 }); // ✅ Sorted for chart

    if (!workout) {
       workout = { weeks: getEmptyWeeks(), lastUpdated: null };
    }
    if (!diet) {
       diet = { weeks: getEmptyWeeks(), lastUpdated: null };
    }

    res.json({ 
        workout, 
        diet, 
        progress,
        weightHistory, // ✅ Return to frontend
        memberName: req.user.name, 
        trainer: member.assignedTrainer 
    }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Save/Update Workout Plan
// @route   POST /api/workout-diet/:memberId/workout
// @access  Private (Trainer)
exports.saveWorkout = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { weeks } = req.body; 

    let workout = await Workout.findOne({ member: memberId });

    if (workout) {
      workout.weeks = weeks;
      workout.trainer = req.user.id;
      workout.lastUpdated = Date.now();
      await workout.save();
    } else {
      workout = await Workout.create({
        member: memberId,
        trainer: req.user.id,
        weeks,
        lastUpdated: Date.now()
      });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Update Diet Plan
// @route   POST /api/workout-diet/:memberId/diet
// @access  Private (Trainer)
exports.saveDiet = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { weeks } = req.body; 

    let diet = await Diet.findOne({ member: memberId });

    if (diet) {
      diet.weeks = weeks;
      diet.trainer = req.user.id;
      diet.lastUpdated = Date.now();
      await diet.save();
    } else {
      diet = await Diet.create({
        member: memberId,
        trainer: req.user.id,
        weeks,
        lastUpdated: Date.now()
      });
    }

    res.json(diet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track Daily Progress
// @route   POST /api/workout-diet/progress
// @access  Private (Member)
exports.trackProgress = async (req, res) => {
    try {
        const { date, type, status, weekNumber, day } = req.body; 
        
        const member = await Member.findOne({ user: req.user.id });
        if (!member) return res.status(404).json({ message: "Member not found" });

        let progress = await Progress.findOne({ member: member._id, date });

        if (!progress) {
            progress = new Progress({ 
                member: member._id, 
                date, 
                weekNumber, 
                day 
            });
        }

        if (type === 'workout') progress.workoutCompleted = status;
        if (type === 'diet') progress.dietCompleted = status;

        await progress.save();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Track Weight (Monthly/Weekly)
// @route   POST /api/workout-diet/weight
// @access  Private (Member)
exports.trackWeight = async (req, res) => {
    try {
        const { date, weight, weekNumber } = req.body;
        
        const member = await Member.findOne({ user: req.user.id });
        if (!member) return res.status(404).json({ message: "Member not found" });

        // Update existing log for that date/week or create new
        // Strategy: One entry per date. If user updates same date, overwrite.
        let log = await WeightLog.findOne({ member: member._id, date });

        if (log) {
            log.weight = weight;
            log.weekNumber = weekNumber;
            await log.save();
        } else {
            log = await WeightLog.create({
                member: member._id,
                date,
                weekNumber,
                weight
            });
        }
        
        // Optionally update current weight in Member profile for quick access
        member.currentWeight = weight;
        await member.save();

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};