import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ToastContainer, toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  // --- STYLE INJECTION ---
  useEffect(() => {
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- MOCK DATA ---
  const stats = [
    { label: "Active Clients", value: 24, icon: "fa-users", color: "bg-[#CDE7FE]", text: "text-blue-900" },
    { label: "Sessions Done", value: 145, icon: "fa-dumbbell", color: "bg-[#D9F17F]", text: "text-green-900" },
    { label: "Pending Plans", value: 5, icon: "fa-clipboard-list", color: "bg-[#FEEF75]", text: "text-yellow-900" },
    { label: "Avg Rating", value: "4.9", icon: "fa-star", color: "bg-purple-100", text: "text-purple-900" },
  ];

  const todaysSessions = [
    { id: 1, time: "07:00 AM", client: "Riya Patel", type: "PT - Legs", status: "Upcoming" },
    { id: 2, time: "09:00 AM", client: "Amit Sharma", type: "Consultation", status: "Upcoming" },
    { id: 3, time: "05:00 PM", client: "Group Batch A", type: "HIIT Class", status: "Pending" },
    { id: 4, time: "07:00 PM", client: "Vikram Singh", type: "PT - Back", status: "Pending" },
  ];

  const recentActivity = [
    { id: 1, text: "Riya updated weight: 65kg (-1kg)", time: "2h ago", icon: "fa-weight-scale", color: "text-green-600" },
    { id: 2, text: "Amit completed 'Cardio Blast' workout", time: "4h ago", icon: "fa-check-circle", color: "text-blue-600" },
    { id: 3, text: "New feedback from Sneha: 'Great session!'", time: "5h ago", icon: "fa-comment-dots", color: "text-yellow-600" },
  ];

  // --- CHART DATA ---
  
  // 1. Weekly Activity (Bar)
  const activityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sessions",
        data: [5, 7, 6, 8, 6, 9, 2],
        backgroundColor: "#CDE7FE",
        borderRadius: 6,
        hoverBackgroundColor: "#9ecaff"
      }
    ]
  };

  // 2. Client Goals (Doughnut)
  const goalsData = {
    labels: ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility"],
    datasets: [
      {
        data: [12, 8, 3, 1],
        backgroundColor: ["#D9F17F", "#CDE7FE", "#FEEF75", "#e5e7eb"],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { display: false } }
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

  // --- ACTIONS ---
  const handleStartSession = (client) => {
    toast.success(`Session started for ${client}`);
  };

  return (
    <div className="w-full space-y-8 pb-10">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your clients, schedule, and performance.</p>
        </div>
        <div className="flex gap-3">
           <Link to="/trainer/workout-diet">
              <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                <i className="fa-solid fa-clipboard-list"></i> Assign Plan
              </button>
           </Link>
           <Link to="/trainer/chat/member">
              <button className="px-5 py-2.5 bg-[#CDE7FE] text-blue-900 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                <i className="fa-solid fa-comment-dots"></i> Message All
              </button>
           </Link>
        </div>
      </div>

      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.color} ${stat.text}`}>
                <i className={`fa-solid ${stat.icon}`}></i>
             </div>
             <div>
                <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Weekly Activity */}
         <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#CDE7FE] rounded-full"></span> Weekly Sessions
               </h3>
               <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg p-2 focus:ring-0 cursor-pointer">
                  <option>This Week</option>
                  <option>Last Week</option>
               </select>
            </div>
            <div className="h-64 relative w-full">
               <Bar data={activityData} options={barOptions} />
            </div>
         </div>

         {/* Client Goals Distribution */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-left flex items-center gap-2">
               <span className="w-2 h-6 bg-[#D9F17F] rounded-full"></span> Client Goals
            </h3>
            <div className="h-48 w-48 relative mb-6">
               <Doughnut data={goalsData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%' }} />
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-gray-900">24</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Total</span>
               </div>
            </div>
            <div className="w-full space-y-2">
               <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D9F17F]"></span> Weight Loss</span>
                  <span>50%</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#CDE7FE]"></span> Muscle Gain</span>
                  <span>33%</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FEEF75]"></span> Other</span>
                  <span>17%</span>
               </div>
            </div>
         </div>
      </div>

      {/* 3. SCHEDULE & ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* Today's Schedule */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View Calendar</button>
            </div>
            
            <div className="space-y-4">
               {todaysSessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-[#CDE7FE]/10 transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center min-w-[60px]">
                           <p className="text-xs text-gray-400 font-bold uppercase">{session.time.split(' ')[1]}</p>
                           <p className="text-lg font-black text-gray-900">{session.time.split(' ')[0]}</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900">{session.client}</h4>
                           <p className="text-xs text-gray-500">{session.type}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleStartSession(session.client)}
                        className="w-10 h-10 rounded-full bg-white text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors shadow-sm cursor-pointer"
                        title="Start Session"
                     >
                        <i className="fa-solid fa-play text-xs"></i>
                     </button>
                  </div>
               ))}
               {todaysSessions.length === 0 && <p className="text-gray-400 text-center py-4">No sessions today.</p>}
            </div>
         </div>

         {/* Recent Activity Feed */}
         <div className="bg-[#f8fbff] p-8 rounded-[2.5rem] border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
               <i className="fa-solid fa-bolt"></i> Live Activity
            </h3>
            
            <div className="space-y-6 relative">
               {/* Vertical Line */}
               <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-blue-100"></div>

               {recentActivity.map(activity => (
                  <div key={activity.id} className="flex gap-4 relative">
                     <div className={`w-7 h-7 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center shrink-0 z-10 ${activity.color}`}>
                        <i className={`fa-solid ${activity.icon} text-xs`}></i>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{activity.time}</p>
                     </div>
                  </div>
               ))}
               
               <button className="w-full py-3 mt-4 bg-white text-blue-600 rounded-xl font-bold text-xs shadow-sm hover:bg-blue-50 transition-colors cursor-pointer">
                  View All Activity
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;