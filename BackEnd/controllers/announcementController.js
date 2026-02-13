const Announcement = require("../models/Announcement");

// @desc    Get all announcements (Admin)
// @route   GET /api/announcements
// @access  Private/Admin
exports.getAnnouncements = async (req, res) => {
  try {
    // Admin needs to see all announcements (active & expired) for management
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    
    // Map to frontend structure
    const formatted = announcements.map(a => ({
        id: a._id,
        _id: a._id,
        title: a.title,
        message: a.message,
        audience: a.audience,
        priority: a.priority,
        publishDate: new Date(a.publishDate).toISOString().split('T')[0],
        // Handle expiryDate safely if it exists
        expiryDate: a.expiryDate ? new Date(a.expiryDate).toISOString().split('T')[0] : "",
        // Determine status based on active flag AND date check
        status: (a.isActive && new Date(a.expiryDate) > new Date()) ? "Active" : "Expired",
        views: a.views,
        attachment: a.attachment,
        notify: a.notify
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience, priority, publishDate, expiryDate, notify } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      audience,
      priority,
      publishDate: publishDate || new Date(),
      expiryDate,
      notify,
      createdBy: req.user.id
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Not found" });

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Not found" });

    // Used findByIdAndDelete as .remove() is deprecated in newer Mongoose versions
    await Announcement.findByIdAndDelete(req.params.id); 
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active announcements (Public/Member/Trainer)
// @route   GET /api/announcements/feed
// @access  Private
exports.getAnnouncementFeed = async (req, res) => {
  try {
    const role = req.user.role; // 'member' or 'trainer'
    
    const query = {
        isActive: true,
        $or: [
            { audience: "All Users" },
            { audience: role === 'member' ? "Members Only" : "Trainers Only" }
        ],
        // UPDATED: Strictly filter for expiryDate greater than NOW
        expiryDate: { $gt: new Date() } 
    };

    const announcements = await Announcement.find(query).sort({ priority: -1, publishDate: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};