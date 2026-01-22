const Session = require("../models/Session.js")

exports.createSession = async (req, res) => {
  try {
    const session = await Session.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  const sessions = await Session.find()
    .populate("trainer", "name email");
  res.json(sessions);
};

exports.updateSession = async (req, res) => {
  const session = await Session.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(session);
};