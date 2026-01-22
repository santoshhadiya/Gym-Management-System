const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false, // Security: Do not return password by default
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
  },
  role: {
    type: String,
    enum: ["member", "trainer", "admin"],
    default: "member",
  },
  status: {
    type: String,
    enum: ["Pending", "Active", "Inactive", "Blocked"],
    default: "Active",
  },
  profileImage: {
    type: String,
    default: "https://static.thenounproject.com/png/561365-200.png",
  },
  address: String,

  // --- Trainer Specific Data ---
  // (Populated only if role === 'trainer')
  trainerDetails: {
    specialization: String, // e.g., "Strength", "Yoga"
    experience: String, // e.g., "5 Years"
    certifications: [String],
    bio: String,
    activeClients: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    totalSessions: {
      // ✅ ADD
      type: Number,
      default: 0,
    },
    schedule: {
      type: String,
      default: "",
    },
    salary: {
      monthly: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ["Paid", "Pending"],
        default: "Pending",
      },
      lastPayment: {
        type: Date,
      },
    },
  },

  // --- System Fields ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving to DB
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password during login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
