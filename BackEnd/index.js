const express = require("express");
const http = require("http"); // ✅ Import http
const { initSocket } = require("./socket"); // ✅ Import socket init
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

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
const trainerRoutes = require("./routes/trainerRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const bookingRoutes = require("./routes/sessionBookingRoutes");
const offerRoutes = require("./routes/offerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const inquiriesRoutes = require("./routes/inquiryRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server

// ✅ Initialize Socket.IO
const io = initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Mount Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/session-bookings", bookingRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/inquiries", inquiriesRoutes);
app.use("/api/chat", chatRoutes);

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

// --- Cron Job: Check Expired Offers Daily ---
setInterval(async () => {
  try {
    const today = new Date();
    const expiredOffers = await Offer.find({
      isActive: true,
      endDate: { $lt: today },
    });

    if (expiredOffers.length > 0) {
      console.log(`Found ${expiredOffers.length} expired offers. Deactivating...`);
      
      for (const offer of expiredOffers) {
        offer.isActive = false;
        await offer.save();

        const plan = await Plan.findById(offer.plan);
        if (plan) {
          plan.price = plan.originalPrice; // Revert price
          plan.offer = null;
          await plan.save();
        }
      }
    }
  } catch (error) {
    console.error("Error in offer expiration check:", error);
  }
}, 24 * 60 * 60 * 1000); // Run every 24 hours

const PORT = process.env.PORT || 5000;

// ✅ Listen on server, not app
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));