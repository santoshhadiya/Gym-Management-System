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
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";
import Feedbacks from "./Feedbacks";
import AssignedMembers from "./AssignedMembers";

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
   const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
   const { colors, theme } = useTheme();
   const [dashboardData, setDashboardData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState();

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

   // --- FETCH LIVE DATA FROM BACKEND ---
   useEffect(() => {
      const fetchDashboard = async () => {
         try {
            setIsLoading(true);
            // Fetches comprehensive trainer stats and metrics from the backend
            const res = await api.get("/dashboard/trainer");
            setDashboardData(res.data);
         } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            toast.error("Failed to load dashboard data.");
         } finally {
            setIsLoading(false);
         }
      };
      fetchDashboard();
   }, [api]);

   // --- CHART CONFIGURATIONS ---
   const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
   };

   const lineOptions = {
      ...commonOptions,
      scales: {
         y: { beginAtZero: true, grid: { color: theme === 'dark' ? '#374151' : '#f3f4f6' } },
         x: { grid: { display: false } }
      }
   };

   const handleAction = (msg) => {
      toast.info(msg);
   };

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative w-16 h-16">
               <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="font-black text-gray-400 tracking-tighter text-sm uppercase">Optimizing Coach View...</p>
         </div>
      );
   }

   // Destructure real-time data from the backend response
   const {
      stats = [],
      todaysSessions = [],
      recentActivity = [],
      goalsData = { labels: [], datasets: [{ data: [] }] }
   } = dashboardData || {};

   return (
      <div className="w-full space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <ToastContainer position="bottom-right" autoClose={3000} theme={theme} />

         {/* HEADER SECTION */}
         <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D9F17F] text-green-900 uppercase">Coach Mode</span>
               </div>
               <p className="text-gray-500 font-medium" style={{ color: colors.textMuted }}>Manage members and track live gym performance.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
               
               <Link to="/trainer/workout-diet" className="flex-1 md:flex-none">
                  <button className="w-full px-6 py-3 bg-black text-white rounded-2xl text-xs font-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                     <i className="fa-solid fa-plus"></i> New Plan
                  </button>
               </Link>
            </div>
         </div>

         {/* STATS GRID - Aggregating live counts for clients, sessions, and ratings */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
               <div key={i} className="group relative bg-white p-6 rounded-[1rem] border border-gray-100 shadow-sm overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <div className="flex justify-between items-start mb-4">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.color} ${stat.text}`}>
                        <i className={`fa-solid ${stat.icon}`}></i>
                     </div>
                     
                  </div>
                  <div>
                     <h3 className="text-3xl font-black" style={{ color: colors.text }}>{stat.value}</h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <i className={`fa-solid ${stat.icon} absolute -right-4 -bottom-4 text-7xl opacity-[0.03] group-hover:opacity-[0.07] transition-all`}></i>
               </div>
            ))}
         </div>

         <div className="flex gap-4">

            {/* LIVE INTEL FEED - Displays recent client interactions and feedback */}
            <div className="bg-[#121212] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden w-[50%]">
               <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  Live Intel
               </h3>

               <div className="space-y-8 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-white/10"></div>

                  {recentActivity.length > 0 ? recentActivity.map(activity => (
                     <div key={activity.id} className="flex gap-6 relative group">
                        <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10 group-hover:bg-blue-500 transition-colors`}>
                           <i className={`fa-solid ${activity.icon} text-xs text-white/50 group-hover:text-white`}></i>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white/90 leading-tight">{activity.text}</p>
                           <p className="text-[9px] text-white/30 font-black uppercase mt-2 tracking-widest">{activity.time}</p>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-12 opacity-30">
                        <i className="fa-solid fa-satellite-dish text-4xl mb-4"></i>
                        <p className="text-[10px] font-black uppercase tracking-tighter">Awaiting Signal...</p>
                     </div>
                  )}

                  <button className="w-full py-4 mt-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer">
                     History Log
                  </button>
               </div>

               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full"></div>
            </div>

            {/* GOAL BREAKDOWN - Visualizing member fitness goal distribution */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-between w-[50%]" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <h3 className="text-lg font-black w-full text-left mb-6" style={{ color: colors.text }}>Roster Goals</h3>
               <div className="h-56 w-56 relative">
                  <Doughnut data={goalsData} options={{ ...commonOptions, cutout: '75%' }} />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-4xl font-black" style={{ color: colors.text }}>{stats[0]?.value || 0}</span>
                     <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Active</span>
                  </div>
               </div>
               <div className="w-full mt-6 space-y-3">
                  {goalsData.labels.map((label, idx) => (
                     <div key={label} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
                        <div className="flex items-center gap-3">
                           <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goalsData.datasets[0].backgroundColor[idx] }}></span>
                           <span className="text-[10px] font-black uppercase text-gray-500">{label}</span>
                        </div>
                        <span className="text-xs font-black" style={{ color: colors.text }}>{goalsData.datasets[0].data[idx]}</span>
                     </div>
                  ))}
               </div>
            </div>

         </div>
         <div>
            <Feedbacks/>
            <AssignedMembers/>
         </div>
      </div>
   );
};

export default Dashboard;