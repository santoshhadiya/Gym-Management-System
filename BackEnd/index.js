const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const planRoutes = require("./routes/planRoutes");
const userRoutes = require("./routes/userRoutes");
const memberRoutes = require("./routes/memberRoutes");
const paymentRotes = require("./routes/paymentRoutes");
const trainerRoutes=require("./routes/trainerRoutes")
const assignmentRoutes=require("./routes/assignmentRoutes")
const sessionRoutes=require("./routes/sessionRoutes");
const bookingRoutes=require("./routes/sessionBookingRoutes")
const offerRoutes = require("./routes/offerRoutes");
const Plan = require("./models/Plan");

dotenv.config();
connectDB(); // Connect with my database

const app = express();

// middlewares
app.use(cors());

// Body parser to handle JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

// --- Mount Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRotes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/session-bookings", bookingRoutes);
app.use("/api/offers", offerRoutes);
// --- Base Route for API Health Check ---
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

setInterval(async () => {
  const today = new Date();

  const expiredPlans = await Plan.find({
    "offer.isActive": true,
    "offer.endDate": { $lt: today },
  });

  for (let plan of expiredPlans) {
    plan.price = plan.offer.originalPrice;
    plan.offer.isActive = false;
    await plan.save();
  }

}, 1000 * 60 * 60); // every 1 hour

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.PORT} mode on port ${PORT}`);
});
