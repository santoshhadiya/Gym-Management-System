const express = require("express");
const http = require("http"); // ✅ Import http
const { initSocket } = require("./socket"); // ✅ Import socket init
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
// Models
const Plan = require("./models/Plan");
const Offer = require("./models/Offer"); // Required for cron job
// Route Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const planRoutes = require("./routes/planRoutes");
const userRoutes = require("./routes/userRoutes");
const memberRoutes = require("./routes/memberRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const upgradeRoutes = require("./routes/upgradeRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const bookingRoutes = require("./routes/sessionBookingRoutes");
const offerRoutes = require("./routes/offerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const inquiriesRoutes = require("./routes/inquiryRoutes");
const chatRoutes = require("./routes/chatRoutes");
const workoutDietRoutes = require("./routes/workoutDietRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const publicRoutes = require("./routes/publicRoutes");
const companyRoutes=require("./routes/companyRoutes");
const scheduleRoutes=require("./routes/scheduleRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server
const io = initSocket(server);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://songars-gym.onrender.com",
      "https://songars-gym.vercel.app",
      "http://10.205.95.201:5173"
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  "/images",
  express.static(path.join(__dirname, "utils/images"))
);

// --- Mount Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upgrades", upgradeRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/session-bookings", bookingRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/inquiries", inquiriesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/workout-diet", workoutDietRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/company", companyRoutes)
app.use("/api/schedule", scheduleRoutes)
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Base Route ---
app.get("/", (req, res) => {
  res.send("Gym Management API is running...");
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// --- Cron Job: Check for Expiring AND Starting offers ---
setInterval(async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Handle EXPIRED offers (Existing logic)
    const expiredOffers = await Offer.find({ isActive: true, endDate: { $lt: today } });
    for (const offer of expiredOffers) {
      offer.isActive = false;
      await offer.save();
      const plan = await Plan.findById(offer.plan);
      if (plan) {
        plan.price = plan.originalPrice;
        plan.offer = null;
        await plan.save();
      }
    }

    // 2. Handle STARTING offers (New logic to fix your bug)
    // Find active offers where the startDate is today and the plan price is still the originalPrice
    const startingToday = await Offer.find({ 
      isActive: true, 
      startDate: { $lte: today }, 
      endDate: { $gte: today } 
    });

    for (const offer of startingToday) {
      const plan = await Plan.findById(offer.plan);
      if (plan && plan.price === plan.originalPrice) {
        let newPrice = plan.originalPrice;
        if (offer.discountType === "percentage") {
          newPrice = plan.originalPrice - (plan.originalPrice * offer.discountValue) / 100;
        } else {
          newPrice = plan.originalPrice - offer.discountValue;
        }
        plan.price = Math.max(newPrice, 0);
        await plan.save();
        console.log(`Applied scheduled offer for plan: ${plan.name}`);
      }
    }
  } catch (error) {
    console.error("Error in offer cron check:", error);
  }
}, 24 * 60 * 60 * 1000);// Run every 24 hours

const PORT = process.env.PORT || 5000;

//  Listen on server, not app
server.listen(PORT,"0.0.0.0", () => console.log(`Server running on port ${PORT}`));
