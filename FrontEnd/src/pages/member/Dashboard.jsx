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
  // --- MOCK DATA ---
  const memberData = {
    name: "Santosh Hadiya",
    id: "MEM-2024-001",
    plan: "Yearly Elite",
    planExpiry: "2025-08-15",
    daysLeft: 245,
    status: "Active",
    trainer: "Raj Mehta",
    attendance: 85, // %
    weightChange: "-4.5 kg",
    nextSession: {
      type: "Personal Training",
      date: "Tomorrow, 07:00 AM",
      trainer: "Raj Mehta",
      status: "Confirmed"
    },
    lastPayment: {
      amount: 12000,
      date: "2024-08-15",
      status: "Paid",
      pending: 0
    },
    notifications: [
      { id: 1, text: "Gym closed on 15th Aug for Independence Day.", type: "Announcement" },
      { id: 2, text: "New Diet Plan assigned by Raj Mehta.", type: "Update" }
    ]
  };

  // --- CHART DATA ---
  
  // 1. Weight Progress (Line)
  const weightData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Weight (kg)",
        data: [90, 89, 87.5, 85.5],
        borderColor: "#D9F17F",
        backgroundColor: "rgba(217, 241, 127, 0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#D9F17F",
        pointRadius: 6,
      }
    ]
  };

  // 2. Weekly Attendance (Bar)
  const attendanceData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Hours Trained",
        data: [1.5, 2, 0, 1.5, 2, 3, 0],
        backgroundColor: "#CDE7FE",
        borderRadius: 6,
        hoverBackgroundColor: "#9ecaff"
      }
    ]
  };

  // 3. Workout Distribution (Doughnut)
  const workoutTypeData = {
    labels: ["Cardio", "Strength", "Yoga", "HIIT"],
    datasets: [
      {
        data: [30, 45, 15, 10],
        backgroundColor: ["#FEEF75", "#CDE7FE", "#D9F17F", "#e5e7eb"],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  // 4. Calories Burned (Line)
  const caloriesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Calories Burned",
        data: [450, 520, 0, 480, 600, 750],
        borderColor: "#FEEF75", // Yellow
        backgroundColor: "rgba(254, 239, 117, 0.2)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#FEEF75",
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
        x: { grid: { display: false } }, 
        y: { beginAtZero: true, grid: { borderDash: [4, 4], color: "#f3f4f6" } } 
    }
  };

  // --- STYLE INJECTION ---
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="w-full space-y-6">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Membership Card */}
        <div className="bg-gradient-to-br from-[#fcfdfd] to-[#f0fdf4] p-6 rounded-3xl border border-[#D9F17F] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-id-card text-6xl text-green-700"></i>
          </div>
          <div className="relative z-10">
             <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Membership</p>
             <h3 className="text-xl font-black text-gray-900">{memberData.plan}</h3>
             <div className="mt-3 flex items-center gap-2">
                <span className="bg-[#D9F17F] text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                   {memberData.status}
                </span>
                <span className="text-xs text-gray-500 font-medium">Expires in {memberData.daysLeft} days</span>
             </div>
          </div>
        </div>

        {/* Trainer Card */}
        <div className="bg-gradient-to-br from-[#fcfdfd] to-[#eff6ff] p-6 rounded-3xl border border-[#CDE7FE] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-user-ninja text-6xl text-blue-700"></i>
          </div>
          <div className="relative z-10">
             <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Assigned Trainer</p>
             <h3 className="text-xl font-black text-gray-900">{memberData.trainer}</h3>
             <div className="mt-3">
                <Link to="/member/chat">
                   <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors bg-white">
                      <i className="fa-regular fa-comment-dots mr-1"></i> Chat Now
                   </button>
                </Link>
             </div>
          </div>
        </div>

        {/* Next Session Card */}
        <div className="bg-gradient-to-br from-[#fcfdfd] to-[#fffbeb] p-6 rounded-3xl border border-[#FEEF75] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-calendar-check text-6xl text-yellow-700"></i>
          </div>
          <div className="relative z-10">
             <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">Next Session</p>
             <h3 className="text-lg font-black text-gray-900 leading-tight">{memberData.nextSession.type}</h3>
             <p className="text-sm text-gray-600 mt-1"><i className="fa-regular fa-clock mr-1"></i> {memberData.nextSession.date}</p>
             <div className="mt-3">
                <span className="text-[10px] font-bold bg-white/80 border border-yellow-200 text-yellow-800 px-2 py-1 rounded">
                   {memberData.nextSession.status}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS & CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
         
         {/* Chart 1: Weight Progress */}
         <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-6 bg-[#D9F17F] rounded-full"></span> Weight Progress
            </h3>
            <div className="h-40 relative flex-1">
               <Line data={weightData} options={chartOptions} />
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">Consistent drop over 4 weeks</p>
         </div>

         {/* Chart 2: Attendance */}
         <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col xl:col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-6 bg-[#CDE7FE] rounded-full"></span> Weekly Activity (Hours)
            </h3>
            <div className="h-40 relative flex-1">
               <Bar data={attendanceData} options={barOptions} />
            </div>
         </div>

         {/* Chart 3: Workout Distribution */}
         <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-6 bg-[#FEEF75] rounded-full"></span> Workout Mix
            </h3>
            <div className="h-40 relative flex-1 flex justify-center">
               <Doughnut data={workoutTypeData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div className="flex justify-center gap-3 mt-2">
               <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-[#CDE7FE]"></span> Strength</div>
               <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-[#FEEF75]"></span> Cardio</div>
            </div>
         </div>

         {/* Chart 4: Calories Burned */}
         <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col xl:col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-6 bg-[#FEEF75] rounded-full"></span> Calories Burned
            </h3>
            <div className="h-48 relative flex-1">
               <Line data={caloriesData} options={barOptions} />
            </div>
         </div>

         {/* Quick Summary / Text Stats */}
         <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col xl:col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Performance Snapshot</h3>
            <div className="grid grid-cols-2 gap-4 h-full">
               <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex flex-col justify-center text-center">
                  <p className="text-xs text-green-600 font-bold uppercase">Total Weight Loss</p>
                  <p className="text-3xl font-black text-gray-900">{memberData.weightChange}</p>
               </div>
               <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-center text-center">
                  <p className="text-xs text-blue-600 font-bold uppercase">Attendance Rate</p>
                  <p className="text-3xl font-black text-gray-900">{memberData.attendance}%</p>
               </div>
            </div>
         </div>

      </div>

      {/* 3. BOTTOM ROW: QUICK ACTIONS & NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Quick Actions</h3>
           <div className="grid grid-cols-2 gap-3">
              <Link to="/member/booking" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FEEF75]/20 hover:bg-[#FEEF75]/40 transition-colors cursor-pointer border border-[#FEEF75]/30">
                 <i className="fa-solid fa-calendar-plus text-xl text-yellow-700 mb-2"></i>
                 <span className="text-xs font-bold text-yellow-800">Book Session</span>
              </Link>
              <Link to="/member/payment" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors cursor-pointer border border-green-100">
                 <i className="fa-solid fa-credit-card text-xl text-green-700 mb-2"></i>
                 <span className="text-xs font-bold text-green-800">Pay Due</span>
              </Link>
              <Link to="/member/chat" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100">
                 <i className="fa-solid fa-comments text-xl text-blue-700 mb-2"></i>
                 <span className="text-xs font-bold text-blue-800">Ask Trainer</span>
              </Link>
              <Link to="/member/progress" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer border border-purple-100">
                 <i className="fa-solid fa-chart-pie text-xl text-purple-700 mb-2"></i>
                 <span className="text-xs font-bold text-purple-800">My Stats</span>
              </Link>
           </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex justify-between items-center">
              Notifications <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{memberData.notifications.length}</span>
           </h3>
           <div className="space-y-3">
              {memberData.notifications.map(n => (
                 <div key={n.id} className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-xl transition-colors">
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
           <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Pending Dues</span>
              <span className={`text-sm font-bold ${memberData.lastPayment.pending > 0 ? 'text-red-500' : 'text-green-500'}`}>
                 {memberData.lastPayment.pending > 0 ? `₹${memberData.lastPayment.pending}` : 'Cleared'}
              </span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;