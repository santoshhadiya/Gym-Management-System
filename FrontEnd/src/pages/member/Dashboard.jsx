import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { ToastContainer, toast } from 'react-toastify';

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

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const Dashboard = () => {
   // --- STATE ---
   const [memberData, setMemberData] = useState(null);
   const [loading, setLoading] = useState(true);

   const user = JSON.parse(localStorage.getItem("userInfo"));

   // --- STYLE INJECTION ---
   useEffect(() => {
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      const linkToast = document.createElement("link");
      linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
      linkToast.rel = "stylesheet";
      document.head.appendChild(linkToast);

      return () => {
         document.head.removeChild(linkFA);
         document.head.removeChild(linkToast);
      };
   }, []);

   // --- FETCH DATA ---
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
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
               pending: 0, // Simplified logic: if fetched, assumes paid? Or check profile pending logic if available. 
               // Better: use profile.planPrice vs total paid from memberController logic if available, 
               // but memberController 'getAllMembersAll' logic isn't exposed to 'getMemberProfile' directly in same format.
               // We'll stick to displaying the last transaction amount.
               date: new Date(payments[0].paidAt).toLocaleDateString()
            } : { amount: 0, pending: 0, date: "N/A" };

            // Notifications (Mock for now, or derive from status)
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

               // Chart Data Helpers
               weightData: weightHistory.map(w => w.weight),
               weightLabels: weightHistory.map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),

               // Diet Adherence (Pie)
               dietCompleted: progressLogs.filter(p => p.dietCompleted).length,
               dietMissed: totalTrackedDays - progressLogs.filter(p => p.dietCompleted).length
            });

         } catch (err) {
            console.error(err);
            // toast.error("Failed to load dashboard");
         } finally {
            setLoading(false);
         }
      };

      if (user) fetchData();
   }, []);

   if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
   if (!memberData) return <div className="p-10 text-center text-gray-500">No data available.</div>;

   // --- CHART CONFIG ---
   const weightChartData = {
      labels: memberData.weightLabels.length > 0 ? memberData.weightLabels : ["Start", "Current"],
      datasets: [{
         label: "Weight",
         data: memberData.weightData.length > 0 ? memberData.weightData : [0, 0],
         borderColor: "#D9F17F",
         backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "rgba(217, 241, 127, 0.4)");
            gradient.addColorStop(1, "rgba(217, 241, 127, 0)");
            return gradient;
         },
         tension: 0.4,
         fill: true,
         pointBackgroundColor: "#fff",
         pointBorderColor: "#D9F17F",
      }]
   };

   const dietChartData = {
      labels: ["Followed", "Missed"],
      datasets: [{
         data: [memberData.dietCompleted, memberData.dietMissed],
         backgroundColor: ["#1f2937", "#f3f4f6"],
         borderWidth: 0,
      }]
   };

   return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 font-sans">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* 1. WELCOME HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden w-fit">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 flex gap-6 mt-4 md:mt-0 text-center">
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
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
                  <i className="fa-solid fa-check-double"></i>
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Attendance</p>
                  <h3 className="text-2xl font-black text-gray-900">{memberData.attendance}%</h3>
               </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <i className="fa-solid fa-weight-scale"></i>
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Weight Change</p>
                  <h3 className="text-2xl font-black text-gray-900">{memberData.weightChange}</h3>
               </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-2">
                  <i className="fa-solid fa-user-ninja"></i>
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Trainer</p>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{memberData.trainer}</h3>
               </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-2">
                  <i className="fa-solid fa-calendar-check"></i>
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${memberData.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {memberData.status}
                  </span>
               </div>
            </div>
         </div>

         {/* 3. MAIN DASHBOARD CONTENT */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Charts */}
            <div className="lg:col-span-2 space-y-6">

               {/* Weight Chart */}
               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-bold text-gray-900">Progress Tracking</h3>
                     <select className="bg-gray-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 text-gray-500 cursor-pointer focus:ring-0">
                        <option>Weight</option>
                     </select>
                  </div>
                  <div className="h-64 w-full">
                     <Line
                        data={weightChartData}
                        options={{
                           responsive: true,
                           maintainAspectRatio: false,
                           plugins: { legend: { display: false } },
                           scales: { y: { grid: { display: false } }, x: { grid: { display: false } } }
                        }}
                     />
                  </div>
               </div>

               {/* Next Session Card */}
               <div className="bg-[#f8f9fa] p-6 rounded-[2.5rem] border border-gray-100 flex justify-between items-center">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Up Next</p>
                     {memberData.nextSession ? (
                        <>
                           <h3 className="text-xl font-bold text-gray-900">{memberData.nextSession.type}</h3>
                           <p className="text-sm text-gray-500 mt-1">
                              <i className="fa-regular fa-clock mr-2"></i> {memberData.nextSession.date}
                           </p>
                        </>
                     ) : (
                        <p className="text-gray-500 font-bold">No upcoming sessions.</p>
                     )}
                  </div>
                  <Link to="/member/booking">
                     <button className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
                        {memberData.nextSession ? "Manage" : "Book Now"}
                     </button>
                  </Link>
               </div>
            </div>

            {/* Right Column: Diet & Info */}
            <div className="space-y-6">

               {/* Diet Adherence */}
               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center relative">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Diet Adherence</h3>
                  <div className="w-40 h-40 mx-auto relative">
                     <Doughnut
                        data={dietChartData}
                        options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-black text-gray-900">
                           {memberData.dietCompleted + memberData.dietMissed > 0
                              ? Math.round((memberData.dietCompleted / (memberData.dietCompleted + memberData.dietMissed)) * 100)
                              : 0}%
                        </span>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-4 text-xs font-bold">
                     <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-800"></span> Followed</div>
                     <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-200"></span> Missed</div>
                  </div>
               </div>

               {/* Notifications */}
               <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                     <i className="fa-regular fa-bell"></i> Alerts
                  </h3>
                  <div className="space-y-3">
                     {memberData.notifications.map(n => (
                        <div key={n.id} className="flex gap-3 items-start p-2 hover:bg-white/50 rounded-xl transition-colors cursor-default">
                           <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                           <p className="text-xs text-gray-600 leading-relaxed">{n.text}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Payment Overview */}
               <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Payment Status</h3>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-gray-500">Last Payment</span>
                     <span className="text-sm font-bold text-gray-900">₹{memberData.lastPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-xs text-gray-500">Date</span>
                     <span className="text-xs font-medium text-gray-700">{memberData.lastPayment.date}</span>
                  </div>
                  <Link to="/member/payment-history" className="block mt-4 text-center text-xs font-bold text-blue-600 hover:underline">
                     View History
                  </Link>
               </div>

            </div>
         </div>

      </div>
   );
};

export default Dashboard;