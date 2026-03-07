const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    audience: {
      type: String,
      enum: ["All Users", "Members Only", "Trainers Only"],
      default: "All Users",
    },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Critical"],
      default: "Normal",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    notify: {
      type: Boolean,
      default: false,
    },
    attachment: {
      type: String, // URL or filename
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);

const mongoose = require("mongoose");

const assignmentHistorySchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    oldTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    newTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentHistory", assignmentHistorySchema);

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assumes your user model is named 'User'
      required: true,
    },
    date: {
      type: String, // Stored as "YYYY-MM-DD" per your controller logic
      required: true,
    },
    checkInAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Compound index to ensure a user can't have duplicate entries for the same day
// This acts as a database-level safety net for your 'existing' check
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: String,
  address: String,
  mobile: String,
  email: String,
  instagram: String,
  facebook: String,
  logo: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Company", CompanySchema);


const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);

const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String },
  imageUrl: { type: String },
  isCustom: { type: Boolean, default: false }
});

const mealSchema = new mongoose.Schema({
  Breakfast: [foodItemSchema],
  Lunch: [foodItemSchema],
  Snacks: [foodItemSchema],
  Dinner: [foodItemSchema]
});

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 }
});

const dailyDietSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format
  meals: mealSchema,
  nutrition: nutritionSchema,
  notes: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const dietSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plans: [dailyDietSchema], // Array of date-based plans
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for faster queries
dietSchema.index({ member: 1, 'plans.date': 1 });

module.exports = mongoose.model("Diet", dietSchema);

const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["Cardio", "Strength", "Accessories", "Recovery"],
    default: "Cardio"
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ["Good", "Repair Needed", "Out of Order", "Retired"],
    default: "Good"
  },
  purchaseDate: {
    type: Date,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Equipment", equipmentSchema);

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["General", "Trainer", "Facility"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed"],
      default: "Pending",
    },
    //  Added fields for Admin Reply
    reply: {
      type: String,
      default: "",
    },
    replyDate: {
      type: Date,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);

const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);

const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  url: {
    type: String, // Stores path "uploads/filename.jpg"
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["General","Transformations", "Gym Events", "Equipment", "Workout Sessions"],
    default: "Gym Events",
  },
  visibility: {
    type: String,
    enum: ["Public", "Members Only", "Admin Only"],
    default: "Public",
  },
  views: {
    type: Number,
    default: 0,
  },
  // [UPDATED] Store array of User References instead of a number
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: {
    type: String,
    enum: ["Approved", "Pending"],
    default: "Approved",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Media", mediaSchema);

const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 🔹 Membership Plan (REFERENCE)
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },

    startDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired"],
      default: "Inactive",
    },

    // 🔹 Fitness Details
    height: {
      type: Number, // cm
    },
    currentWeight: {
      type: Number, // kg
    },
    fitnessGoal: {
      type: String,
      default: "General Fitness",
    },

    // 🔹 Trainer Assignment
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
    },

    // 🔹 Plan Queue - For queued future plans
    planQueue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlanQueue",
      },
    ],

    // 🔹 Plan History - Track all plans the member has purchased
    planHistory: [
      {
        plan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Plan",
        },
        startDate: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        purchaseType: {
          type: String,
          enum: ["new", "upgrade", "queue"],
          default: "new",
        },
        amount: {
          type: Number,
        },
        payment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payment",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);


const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
    unique: true, // Only ONE offer per plan
  },

  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true,
  },

  discountValue: {
    type: Number,
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["UPI", "Card", "Net Banking", "Cash", "Razorpay", "razorpay"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },

    transactionId: {
      type: String,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true, // Optional: if you want to maintain your custom ID
  },
  name: {
    type: String,
    required: [true, "Please add a plan name"],
    trim: true,
    unique: true,
  },
  duration: {
    type: Number, // Duration in days (e.g., 30)
    required: [true, "Please specify duration in days"],
  },
  durationLabel: {
    type: String, // Display label (e.g., "1 Month")
    required: true,
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  originalPrice: {
    type: Number,
    required: [true, "Please add an original price"],
  },
  discount: {
    type: Number, // Percentage
    default: 0,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null,
  },
  accessLevel: {
    type: String,
    enum: ["Gym Only", "Gym + Group", "All Access", "Off-Peak Only"],
    default: "Gym Only",
  },
  features: {
    type: [String], // Array of strings
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  analytics: {
    enrolled: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    popular: { type: Boolean, default: false },
  },
  createdDate: {
    type: String, // Or Date, keeping String to match your format "YYYY-MM-DD"
    default: () => new Date().toISOString().split("T")[0],
  },
});

module.exports = mongoose.model("Plan", PlanSchema);


const mongoose = require("mongoose");

const PlanQueueSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // When this queued plan is scheduled to start
    scheduledStartDate: {
      type: Date,
      required: true,
    },

    // When this queued plan is scheduled to expire
    scheduledExpiryDate: {
      type: Date,
      required: true,
    },

    // Track the payment for this queued plan
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // Type of plan purchase: 'queue' (future) or 'upgrade'
    purchaseType: {
      type: String,
      enum: ["queue", "upgrade"],
      default: "queue",
    },

    // For upgrades: store the original plan's remaining value
    upgradeDetails: {
      originalPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null,
      },
      remainingDays: {
        type: Number,
        default: 0,
      },
      remainingValue: {
        type: Number,
        default: 0,
      },
      discountApplied: {
        type: Number,
        default: 0,
      },
      amountCharged: {
        type: Number,
        default: 0,
      },
    },

    // Status of the queued plan
    status: {
      type: String,
      enum: ["Pending", "Active", "Completed", "Cancelled"],
      default: "Pending",
    },

    // Queue position (1 = next to activate after current plan)
    queuePosition: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanQueue", PlanQueueSchema);

const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    workoutCompleted: { type: Boolean, default: false },
    dietCompleted: { type: Boolean, default: false },
    workoutCompletedAt: { type: Date },
    dietCompletedAt: { type: Date }
  },
  { timestamps: true }
);

// Ensure one progress entry per member per date
progressSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);

const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    unique: true, // Monday, Tuesday, etc.
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  hours: {
    type: String, // e.g., "6 am – 10 pm"
    required: true,
    default: "Closed"
  },
  isClosed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    // Primary trainer (kept for backward compatibility)
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // NEW: Array of additional internal trainers
    additionalTrainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // NEW: Array of external trainer names (not in the database)
    externalTrainers: [
      {
        type: String,
        trim: true,
      },
    ],
    type: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "60 mins",
    },
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    notes: String,
    //cancelReason to store why the session was cancelled (Global)
    cancelReason: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 10, // 1 = personal, >1 = group
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    currentQrId: {
      type: String,
      default: null,
    },
    qrGeneratedAt: {
      type: Date,
    },
    qrExpiresAt: {
      type: Date,
    },
    // Ensure this is defined as an array to prevent the .push() error
    qrHistory: [
      {
        qrId: String,
        generatedAt: { type: Date, default: Date.now },
        generatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    bookedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

sessionSchema.methods.isQRValid = function () {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  return this.currentQrId && this.qrExpiresAt > now && this.date === today;
};

// Virtual to get all trainers (internal + external)
sessionSchema.virtual("allTrainers").get(function () {
  const trainers = [];

  // Add primary trainer
  if (this.trainer) {
    trainers.push({
      type: "internal",
      id: this.trainer._id || this.trainer,
      name: this.trainer.name || "Primary Trainer",
      isPrimary: true,
    });
  }

  // Add additional internal trainers
  if (this.additionalTrainers && this.additionalTrainers.length > 0) {
    this.additionalTrainers.forEach((t) => {
      trainers.push({
        type: "internal",
        id: t._id || t,
        name: t.name || "Additional Trainer",
        isPrimary: false,
      });
    });
  }

  // Add external trainers
  if (this.externalTrainers && this.externalTrainers.length > 0) {
    this.externalTrainers.forEach((name) => {
      trainers.push({
        type: "external",
        name: name,
        isPrimary: false,
      });
    });
  }

  return trainers;
});

// Ensure virtuals are included in JSON
sessionSchema.set("toJSON", { virtuals: true });
sessionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Session", sessionSchema);

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["Booked", "Cancelled", "Attended", "Confirmed"],
    default: "Booked",
  },
  cancelReason: {
    type: String,
    default: "", 
  },
 
  attendedAt: {
    type: Date,
  },
  // NEW: Track QR code generation for security
  qrGenerated: {
    type: Boolean,
    default: false,
  },
  qrGeneratedAt: {
    type: Date,
  },
  
}, { timestamps: true });

// Index for faster queries
bookingSchema.index({ session: 1, member: 1 });
bookingSchema.index({ member: 1, bookingStatus: 1 });

module.exports = mongoose.model("SessionBooking", bookingSchema);

const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: String,
  capacity: {
    type: Number,
    default: 10,
  },
  activeClients: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Full"],
    default: "Active",
  },
});

module.exports = mongoose.model("Trainer", trainerSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
    default: "Inactive",
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

UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    weekNumber: { type: Number },
    weight: { type: Number, required: true }, // in kg
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeightLog", weightLogSchema);


const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: String },
  duration: { type: String },
  imageUrl: { type: String },
  isCustom: { type: Boolean, default: false }
});

const dailyWorkoutSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format
  exercises: [exerciseSchema],
  calorieTarget: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const workoutSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plans: [dailyWorkoutSchema], // Array of date-based plans
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for faster queries
workoutSchema.index({ member: 1, 'plans.date': 1 });

module.exports = mongoose.model("Workout", workoutSchema);
