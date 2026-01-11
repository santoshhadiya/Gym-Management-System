const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Security: Do not return password by default
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  role: {
    type: String,
    enum: ['member', 'trainer', 'admin'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Inactive', 'Blocked'],
    default: 'Pending'
  },
  profileImage: {
    type: String,
    default: 'https://static.thenounproject.com/png/561365-200.png' 
  },
  address: String,
  
  // --- Member Specific Data ---
  // (Populated only if role === 'member')
  memberDetails: {
    plan: {
      type: String, // In future, use: mongoose.Schema.ObjectId, ref: 'Plan'
      default: null
    },
    startDate: Date,
    expiryDate: Date,
    assignedTrainer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User' // Reference to a Trainer
    },
    fitnessGoal: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Endurance', 'Flexibility'],
      default: 'General Fitness'
    },
    height: Number, // in cm
    currentWeight: Number, // in kg
    attendanceStreak: {
      type: Number,
      default: 0
    }
  },

  // --- Trainer Specific Data ---
  // (Populated only if role === 'trainer')
  trainerDetails: {
    specialization: String, // e.g., "Strength", "Yoga"
    experience: String, // e.g., "5 Years"
    certifications: [String],
    bio: String,
    activeClients: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5.0
    },
    schedule: {
      type: Object, // Can store availability JSON
      default: {}
    }
  },

  // --- System Fields ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving to DB
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password during login
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);