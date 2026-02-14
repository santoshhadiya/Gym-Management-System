const Workout = require("../models/Workout");
const Diet = require("../models/Diet");
const Member = require("../models/Member");
const Progress = require("../models/Progress");
const WeightLog = require("../models/WeightLog");
const { EXERCISE_LIBRARY, FOOD_LIBRARY } = require("../utils/libraries");

// @desc    Get Exercise and Food Libraries
// @route   GET /api/workout-diet/libraries
// @access  Private (Trainer)
exports.getLibraries = async (req, res) => {
  try {
    res.json({
      exercises: EXERCISE_LIBRARY,
      foods: FOOD_LIBRARY
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Workout & Diet Plans for a Member (by ID)
// @route   GET /api/workout-diet/:memberId
// @access  Private (Trainer/Member)
exports.getPlans = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { startDate, endDate } = req.query; // Optional date range

    let workout = await Workout.findOne({ member: memberId });
    let diet = await Diet.findOne({ member: memberId });
    
    // Filter plans by date range if provided
    if (startDate && endDate && workout) {
      workout.plans = workout.plans.filter(p => 
        p.date >= startDate && p.date <= endDate
      );
    }
    
    if (startDate && endDate && diet) {
      diet.plans = diet.plans.filter(p => 
        p.date >= startDate && p.date <= endDate
      );
    }

    const progress = await Progress.find({ member: memberId }).sort({ date: -1 });
    const weightHistory = await WeightLog.find({ member: memberId }).sort({ date: 1 });

    res.json({ 
      workout: workout || { plans: [] }, 
      diet: diet || { plans: [] }, 
      progress, 
      weightHistory 
    });
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

    const { startDate, endDate } = req.query;

    let workout = await Workout.findOne({ member: member._id });
    let diet = await Diet.findOne({ member: member._id });
    
    // Filter by date range if provided
    if (startDate && endDate && workout) {
      workout.plans = workout.plans.filter(p => 
        p.date >= startDate && p.date <= endDate
      );
    }
    
    if (startDate && endDate && diet) {
      diet.plans = diet.plans.filter(p => 
        p.date >= startDate && p.date <= endDate
      );
    }

    const progress = await Progress.find({ member: member._id }).sort({ date: -1 });
    const weightHistory = await WeightLog.find({ member: member._id }).sort({ date: 1 });

    res.json({ 
      workout: workout || { plans: [] }, 
      diet: diet || { plans: [] }, 
      progress,
      weightHistory,
      memberName: req.user.name, 
      trainer: member.assignedTrainer 
    }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Update Workout Plan for Specific Date
// @route   POST /api/workout-diet/:memberId/workout
// @access  Private (Trainer)
exports.saveWorkout = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { date, exercises, calorieTarget, notes } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    let workout = await Workout.findOne({ member: memberId });

    if (!workout) {
      // Create new workout document
      workout = await Workout.create({
        member: memberId,
        trainer: req.user.id,
        plans: [{
          date,
          exercises: exercises || [],
          calorieTarget: calorieTarget || 0,
          notes: notes || ""
        }],
        lastUpdated: Date.now()
      });
    } else {
      // Check if plan for this date exists
      const planIndex = workout.plans.findIndex(p => p.date === date);
      
      if (planIndex > -1) {
        // Update existing plan
        workout.plans[planIndex] = {
          date,
          exercises: exercises || [],
          calorieTarget: calorieTarget || 0,
          notes: notes || "",
          isCompleted: workout.plans[planIndex].isCompleted,
          completedAt: workout.plans[planIndex].completedAt
        };
      } else {
        // Add new plan
        workout.plans.push({
          date,
          exercises: exercises || [],
          calorieTarget: calorieTarget || 0,
          notes: notes || ""
        });
      }
      
      workout.trainer = req.user.id;
      workout.lastUpdated = Date.now();
      await workout.save();
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Update Diet Plan for Specific Date
// @route   POST /api/workout-diet/:memberId/diet
// @access  Private (Trainer)
exports.saveDiet = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { date, meals, nutrition, notes } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    let diet = await Diet.findOne({ member: memberId });

    if (!diet) {
      // Create new diet document
      diet = await Diet.create({
        member: memberId,
        trainer: req.user.id,
        plans: [{
          date,
          meals: meals || { Breakfast: [], Lunch: [], Snacks: [], Dinner: [] },
          nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
          notes: notes || ""
        }],
        lastUpdated: Date.now()
      });
    } else {
      // Check if plan for this date exists
      const planIndex = diet.plans.findIndex(p => p.date === date);
      
      if (planIndex > -1) {
        // Update existing plan
        diet.plans[planIndex] = {
          date,
          meals: meals || { Breakfast: [], Lunch: [], Snacks: [], Dinner: [] },
          nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
          notes: notes || "",
          isCompleted: diet.plans[planIndex].isCompleted,
          completedAt: diet.plans[planIndex].completedAt
        };
      } else {
        // Add new plan
        diet.plans.push({
          date,
          meals: meals || { Breakfast: [], Lunch: [], Snacks: [], Dinner: [] },
          nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
          notes: notes || ""
        });
      }
      
      diet.trainer = req.user.id;
      diet.lastUpdated = Date.now();
      await diet.save();
    }

    res.json(diet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track Daily Progress (STRICT DATE VALIDATION)
// @route   POST /api/workout-diet/progress
// @access  Private (Member)
exports.trackProgress = async (req, res) => {
  try {
    const { date, type, status } = req.body;
    
    // STRICT DATE VALIDATION: Only allow marking on the exact date
    const today = new Date().toISOString().split('T')[0];
    
    if (date !== today) {
      return res.status(400).json({ 
        message: `You can only mark plans as complete on their scheduled date (${date}). Today is ${today}.`,
        canComplete: false 
      });
    }
    
    const member = await Member.findOne({ user: req.user.id });
    if (!member) return res.status(404).json({ message: "Member not found" });

    let progress = await Progress.findOne({ member: member._id, date });

    if (!progress) {
      progress = new Progress({ 
        member: member._id, 
        date
      });
    }

    if (type === 'workout') {
      progress.workoutCompleted = status;
      if (status) progress.workoutCompletedAt = new Date();
    }
    
    if (type === 'diet') {
      progress.dietCompleted = status;
      if (status) progress.dietCompletedAt = new Date();
    }

    await progress.save();
    
    // Also update the plan's completion status
    if (type === 'workout') {
      const workout = await Workout.findOne({ member: member._id });
      if (workout) {
        const plan = workout.plans.find(p => p.date === date);
        if (plan) {
          plan.isCompleted = status;
          if (status) plan.completedAt = new Date();
          await workout.save();
        }
      }
    } else if (type === 'diet') {
      const diet = await Diet.findOne({ member: member._id });
      if (diet) {
        const plan = diet.plans.find(p => p.date === date);
        if (plan) {
          plan.isCompleted = status;
          if (status) plan.completedAt = new Date();
          await diet.save();
        }
      }
    }
    
    res.json({ progress, canComplete: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track Weight
// @route   POST /api/workout-diet/weight
// @access  Private (Member)
exports.trackWeight = async (req, res) => {
  try {
    const { date, weight } = req.body;
    
    const member = await Member.findOne({ user: req.user.id });
    if (!member) return res.status(404).json({ message: "Member not found" });

    let log = await WeightLog.findOne({ member: member._id, date });

    if (log) {
      log.weight = weight;
      await log.save();
    } else {
      log = await WeightLog.create({
        member: member._id,
        date,
        weight
      });
    }
    
    // Update current weight in Member profile
    member.currentWeight = weight;
    await member.save();

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Member History (All Plans with Status)
// @route   GET /api/workout-diet/history
// @access  Private (Member)
exports.getHistory = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const workout = await Workout.findOne({ member: member._id });
    const diet = await Diet.findOne({ member: member._id });
    const progress = await Progress.find({ member: member._id }).sort({ date: -1 });

    // Combine workout and diet plans with their completion status
    const history = [];
    
    if (workout && workout.plans) {
      workout.plans.forEach(plan => {
        const prog = progress.find(p => p.date === plan.date);
        history.push({
          date: plan.date,
          type: 'workout',
          exercises: plan.exercises,
          calorieTarget: plan.calorieTarget,
          isCompleted: prog?.workoutCompleted || false,
          completedAt: prog?.workoutCompletedAt
        });
      });
    }
    
    if (diet && diet.plans) {
      diet.plans.forEach(plan => {
        const prog = progress.find(p => p.date === plan.date);
        const existingIndex = history.findIndex(h => h.date === plan.date);
        
        if (existingIndex > -1) {
          history[existingIndex].dietMeals = plan.meals;
          history[existingIndex].nutrition = plan.nutrition;
          history[existingIndex].dietCompleted = prog?.dietCompleted || false;
          history[existingIndex].dietCompletedAt = prog?.dietCompletedAt;
        } else {
          history.push({
            date: plan.date,
            type: 'diet',
            dietMeals: plan.meals,
            nutrition: plan.nutrition,
            isCompleted: prog?.dietCompleted || false,
            completedAt: prog?.dietCompletedAt
          });
        }
      });
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Plan by Date
// @route   DELETE /api/workout-diet/:memberId/:type/:date
// @access  Private (Trainer)
exports.deletePlan = async (req, res) => {
  try {
    const { memberId, type, date } = req.params;
    
    if (type === 'workout') {
      const workout = await Workout.findOne({ member: memberId });
      if (workout) {
        workout.plans = workout.plans.filter(p => p.date !== date);
        await workout.save();
      }
    } else if (type === 'diet') {
      const diet = await Diet.findOne({ member: memberId });
      if (diet) {
        diet.plans = diet.plans.filter(p => p.date !== date);
        await diet.save();
      }
    }
    
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};