const Media = require("../models/Media");
const fs = require("fs");
const path = require("path");

// @desc    Get all media
// @route   GET /api/media
exports.getAllMedia = async (req, res) => {
  try {
    // [UPDATED] Populate likes to get user details (name, email)
    const media = await Media.find()
      .populate("likes", "name email profileImage") 
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload new media
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { caption, category, visibility, type } = req.body;
    
    // Store relative path "uploads/filename.ext"
    const url = `uploads/${req.file.filename}`;

    const media = await Media.create({
      type,
      url: url,
      caption,
      category,
      visibility,
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update media details
exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    media.caption = req.body.caption || media.caption;
    media.category = req.body.category || media.category;
    media.visibility = req.body.visibility || media.visibility;
    media.status = req.body.status || media.status;

    const updatedMedia = await media.save();
    res.json(updatedMedia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Delete file from filesystem if exists
    const filePath = path.join(__dirname, "..", media.url); 
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();
    res.json({ message: "Media deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike media (Toggle)
// @route   PUT /api/media/:id/like
exports.likeMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const userId = req.user.id; 

    // Check if user already liked
    // Note: media.likes is array of ObjectIds (or Objects if populated). 
    // MongoDB findById doesn't populate by default inside the controller unless specified.
    // However, to be safe with comparisons, we cast to string.
    
    const isLiked = media.likes.some(id => id.toString() === userId);

    if (isLiked) {
      // Unlike: Filter out the user ID
      media.likes = media.likes.filter(id => id.toString() !== userId);
    } else {
      // Like: Add user ID
      media.likes.push(userId);
    }

    await media.save();

    // Re-populate to return full data to frontend
    await media.populate("likes", "name email profileImage");

    res.json(media);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message });
  }
};