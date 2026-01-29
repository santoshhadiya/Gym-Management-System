const Feedback = require("../models/Feedback");

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Member)
exports.createFeedback = async (req, res) => {
  try {
    const { rating, comment, type } = req.body;

    // Check if feedback of this type already exists for this user
    const existingFeedback = await Feedback.findOne({ member: req.user.id, type });
    if (existingFeedback) {
      return res.status(400).json({ message: `You have already submitted ${type} feedback. Please edit it instead.` });
    }

    const feedback = await Feedback.create({
      member: req.user.id,
      rating,
      comment,
      type,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update my existing feedback
// @route   PUT /api/feedback/:id
// @access  Private (Member)
exports.updateMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ _id: req.params.id, member: req.user.id });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.rating = req.body.rating || feedback.rating;
    feedback.comment = req.body.comment || feedback.comment;
    
    // Reset status to Pending on edit
    feedback.status = "Pending"; 

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my feedback history
// @route   GET /api/feedback/my
// @access  Private (Member)
exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ member: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private (Admin)
exports.getAllFeedback = async (req, res) => {
  try {
    // [UPDATED] Added 'profileImage' to populate
    const feedbacks = await Feedback.find()
      .populate("member", "name email profileImage") 
      .sort({ createdAt: -1 });
    
    const formatted = feedbacks.map(f => ({
       _id: f._id,
       member: f.member ? f.member.name : "Unknown",
       email: f.member ? f.member.email : "",
       avatar: f.member?.profileImage || "", // Now this will contain the image path
       type: f.type,
       rating: f.rating,
       message: f.comment,
       date: f.createdAt,
       status: f.status,
       reply: f.reply
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback status / Reply (Admin)
// @route   PUT /api/feedback/:id/status
// @access  Private (Admin)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (req.body.reply) {
       feedback.reply = req.body.reply;
       feedback.replyDate = new Date();
       feedback.status = "Reviewed";
    } else if (req.body.status) {
       feedback.status = req.body.status;
    }

    await feedback.save();

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback/trainer
// @access  Private (trainer)
exports.getTrainersFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ type: "Trainer" })
      .populate("member", "name email profileImage")
      .sort({ createdAt: -1 });

    const formatted = feedbacks.map(f => ({
      _id: f._id,
      member: f.member ? f.member.name : "Unknown",
      email: f.member ? f.member.email : "",
      avatar: f.member?.profileImage || "",
      type: f.type,
      rating: f.rating,
      message: f.comment,
      date: f.createdAt,
      status: f.status,
      reply: f.reply,
    }));

    res.status(200).json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer feedback",
      error: error.message,
    });
  }
};