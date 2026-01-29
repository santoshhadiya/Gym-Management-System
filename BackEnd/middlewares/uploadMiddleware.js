const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "../uploads"); // Points to backend/uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the absolute path we defined above
  },
  filename: (req, file, cb) => {
    // Generate unique filename: fieldname-timestamp.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File Filter (Images & Videos only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mkv|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images and Videos Only!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});

module.exports = upload;