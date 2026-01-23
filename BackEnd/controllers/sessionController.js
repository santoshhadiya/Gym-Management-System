const Session = require("../models/Session.js");

exports.createSession = async (req, res) => {
  try {
    

    const session = await Session.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json(session);
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("trainer", "name email")
      

    res.json(sessions);
  } catch (err) {
    console.log(err);
  }
};

exports.updateSession = async (req, res) => {
  const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(session);
};

// GET upcoming sessions
exports.getAvailableSessions = async (req, res) => {
  const sessions = await Session.find({
    status: "Upcoming",
    date: { $gte: new Date().toISOString().split("T")[0] }
  })
  .populate("trainer", "name specialization");

  res.json(sessions);
};
