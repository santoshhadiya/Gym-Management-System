const Schedule = require("../models/Schedule");

// @desc    Get all schedule items
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update or create a schedule for a day
// Add/Update logic remains similar but ensures we can target by 'day'
exports.updateSchedule = async (req, res) => {
  const { day, hours, isClosed } = req.body;
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { day },
      { hours, isClosed: isClosed || false },
      { new: true, upsert: true } // Creates new record if day doesn't exist
    );
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};