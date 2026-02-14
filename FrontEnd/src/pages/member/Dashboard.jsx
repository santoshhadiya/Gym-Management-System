import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; // Updated to React Hot Toast
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   BarElement,
   Title,
   Tooltip,
   Legend,
   Filler,
   ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";
import { useGlobalContext } from "../../context/GlobalContext";
import Progress from "./Progress";

ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   BarElement,
   Title,
   Tooltip,
   Legend,
   Filler,
   ArcElement
);


const Dashboard = () => {
   const { BACKEND_URL, loadingIMG } = useGlobalContext()
   // --- STATE ---
   const [memberData, setMemberData] = useState(null);
   const [loading, setLoading] = useState(true);

   // Access Global Theme Colors
   const { colors, theme } = useTheme();
   const navigate = useNavigate()

   const user = JSON.parse(localStorage.getItem("userInfo"));

   // --- STYLE INJECTION ---
   // Removed local Toastify CSS injection as it's now global
   useEffect(() => {
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      return () => {
         document.head.removeChild(linkFA);
      };
   }, []);

   // --- FETCH DATA ---
   useEffect(() => {
      const fetchData = async () => {
         try {
            const token = user?.token;
            if (!token) return;

            // 1. Profile & Plan
            const profileRes = await fetch(`${BACKEND_URL}/api/members/profile`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const profile = await profileRes.json();

            // 2. Progress & Weight
            const progressRes = await fetch(`${BACKEND_URL}/api/workout-diet/my/plan`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const progressDataRaw = await progressRes.json();

            // 3. Payments
            const paymentRes = await fetch(`${BACKEND_URL}/api/payments/my`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const payments = await paymentRes.json();

            // 4. Sessions (Next Session)
            const bookingRes = await fetch(`${BACKEND_URL}/api/session-bookings/my`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const bookings = await bookingRes.json();

            // --- PROCESS DATA ---

            // Days Left Calculation
            const expiryDate = new Date(profile.expiryDate);
            const today = new Date();
            const diffTime = expiryDate - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Weight Change
            const weightHistory = progressDataRaw.weightHistory || [];
            const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : profile.currentWeight;
            const currentWeight = profile.currentWeight;
            const weightChangeVal = currentWeight - startWeight;
            const weightChangeStr = weightChangeVal > 0 ? `+${weightChangeVal} kg` : `${weightChangeVal} kg`;

            // Attendance (Mock calculation based on workout completion)
            const progressLogs = progressDataRaw.progress || [];
            const totalTrackedDays = progressLogs.length || 1;
            const completedWorkouts = progressLogs.filter(p => p.workoutCompleted).length;
            const attendanceRate = Math.round((completedWorkouts / totalTrackedDays) * 100);

            // Next Session
            const upcomingBookings = bookings.filter(b => b.bookingStatus !== 'Cancelled').sort((a, b) => new Date(a.session.date) - new Date(b.session.date));
            const nextSessionData = upcomingBookings.length > 0 ? {
               type: upcomingBookings[0].session.type,
               date: `${upcomingBookings[0].session.date}, ${upcomingBookings[0].session.time}`,
               trainer: upcomingBookings[0].session.trainer?.name || "Unknown",
               status: upcomingBookings[0].bookingStatus
            } : null;

            // Last Payment
            const lastPaymentData = payments.length > 0 ? {
               amount: payments[0].amount,
               pending: 0,
               date: new Date(payments[0].paidAt).toLocaleDateString()
            } : { amount: 0, pending: 0, date: "N/A" };

            // Notifications
            const notifications = [];
            if (daysLeft < 7 && daysLeft > 0) notifications.push({ id: 1, text: "Your membership expires soon! Renew now." });
            if (profile.status === 'Inactive') notifications.push({ id: 2, text: "Your account is currently inactive." });
            if (notifications.length === 0) notifications.push({ id: 0, text: "No new notifications." });

            setMemberData({
               name: profile.user?.name || "Member",
               id: profile._id,
               plan: profile.plan?.name || "No Plan",
               planExpiry: profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString() : "N/A",
               daysLeft: daysLeft > 0 ? daysLeft : 0,
               status: profile.status,
               trainer: profile.assignedTrainer?.name || "Unassigned",
               attendance: attendanceRate || 0,
               weightChange: weightChangeStr,
               nextSession: nextSessionData,
               lastPayment: lastPaymentData,
               notifications: notifications,
               weightData: weightHistory.map(w => w.weight),
               weightLabels: weightHistory.map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
               dietCompleted: progressLogs.filter(p => p.dietCompleted).length,
               dietMissed: totalTrackedDays - progressLogs.filter(p => p.dietCompleted).length
            });
            setLoading(false)
         } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard data"); // React Hot Toast
         } finally {
            setLoading(false);
         }
      };

      if (user) fetchData();
   }, [user]);

   if (loading) {
      return (
         <div className="fixed inset-0 flex items-center justify-center h-screen" style={{ color: colors.textMuted }}>
            <img src={loadingIMG} className="h-20 w-25" alt="Loading..." />
         </div>
      );
   }

   if (!memberData) return (
      <div className="p-10 text-center" style={{ color: colors.textMuted }}>
         No data available.
      </div>
   );

   // --- CHART CONFIG ---
   const weightChartData = {
      labels: memberData.weightLabels,
      datasets: [{
         label: "Weight",
         data: memberData.weightData,
         borderColor: colors.primary,
         backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "rgba(217, 241, 127, 0.4)");
            gradient.addColorStop(1, "rgba(217, 241, 127, 0)");
            return gradient;
         },
         tension: 0.4,
         fill: true,
         pointBackgroundColor: colors.card,
         pointBorderColor: colors.primary,
      }]
   };

   const dietChartData = {
      labels: ["Followed", "Missed"],
      datasets: [{
         data: [memberData.dietCompleted, memberData.dietMissed],
         // Use theme colors for chart segments
         backgroundColor: [theme === 'dark' ? '#374151' : '#1f2937', colors.border],
         borderWidth: 0,
      }]
   };
   const navigateMembership = () => {
      navigate('/member/membership');
   }
   const navigateProgress = () => {
      navigate('/member/progress')
   }
   return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 font-sans px-4 sm:px-0">

         {/* 1. WELCOME HEADER - Always Dark Style for contrast */}
         <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 text-white p-8 rounded-[1rem] shadow-xl relative overflow-hidden w-full md:w-fit mx-auto md:mx-0 cursor-pointer"
            onClick={navigateMembership}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 flex gap-6 mt-4 md:mt-0 text-center w-full justify-center md:justify-start md:w-auto">
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Plan</p>
                  <p className="text-xl font-bold text-[#D9F17F]">{memberData.plan}</p>
               </div>
               <div className="w-px bg-gray-700 h-10"></div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Days Left</p>
                  <p className="text-xl font-bold text-white">{memberData.daysLeft}</p>
               </div>
            </div>
         </div>

         {/* 2. KEY STATS GRID */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
               { icon: "fa-check-double", label: "Attendance", value: `${memberData.attendance}%` },
               { icon: "fa-weight-scale", label: "Weight Change", value: memberData.weightChange },
               { icon: "fa-user-ninja", label: "Trainer", value: memberData.trainer },
               { icon: "fa-calendar-check", label: "Status", value: memberData.status, isBadge: true }
            ].map((stat, i) => {
               const bgColors = ["#FEEF75", "#D9F17F", "#CDE7FE", "#FEEF75"];
               const cardBg = bgColors[i % bgColors.length];

               return (
                  <div
                     key={i}
                     onClick={navigateProgress}
                     className="relative overflow-hidden p-6 rounded-[1rem] border shadow-sm flex flex-col justify-between transition-all duration-500 cursor-pointer group hover:-translate-y-1 hover:shadow-xl"
                     style={{
                        backgroundColor: cardBg,
                        borderColor: 'rgba(255,255,255,0.4)'
                     }}
                  >
                     {/* DESIGN LAYER 1: Mesh Gradient Glow */}
                     <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-40 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />

                     {/* DESIGN LAYER 2: Geometric Glass Ring */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-[15px] border-white/10 rounded-full pointer-events-none" />

                     {/* DESIGN LAYER 3: Noise/Grain Overlay (Optional CSS Pattern) */}
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Ffilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                     {/* Content */}
                     <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/40 text-gray-800 shadow-inner backdrop-blur-md border border-white/20 transition-transform duration-300 group-hover:rotate-6">
                           <i className={`fa-solid ${stat.icon} text-xl`}></i>
                        </div>

                        <div className="space-y-1">
                           <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-60" style={{ color: '#000' }}>
                              {stat.label}
                           </p>
                           {stat.isBadge ? (
                              <div className="flex">
                                 <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/50 text-black border border-white/40 backdrop-blur-sm">
                                    {stat.value}
                                 </span>
                              </div>
                           ) : (
                              <h3 className="text-3xl font-black text-black tracking-tighter">
                                 {stat.value}
                              </h3>
                           )}
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
         <Progress />
      </div>
   );
};

export default Dashboard;