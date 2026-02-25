import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
   ArcElement,
   Filler
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";
import TrainerNav from "../../components/trainer/TrainerNav";

// Register ChartJS components
ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   BarElement,
   Title,
   Tooltip,
   Legend,
   ArcElement,
   Filler
);

const Dashboard = () => {
   const { api, BACKEND_URL } = useGlobalContext();
   const { colors, theme } = useTheme();
   const navigate = useNavigate();

   const [dashboardData, setDashboardData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedTab, setSelectedTab] = useState("overview");

   // Professional color palette
   const paletteColors = {
      white: "#FFFFFF",
      mattBlack: "#000000",
      lightBlue: "#CDE7FE",
      lime: "#D9F17F",
      softYellow: "#FEEF75",
      gray: "#6B7280"
   };

   // --- STYLE INJECTION ---
   useEffect(() => {
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      return () => {
         if (document.head.contains(linkFA)) {
            document.head.removeChild(linkFA);
         }
      };
   }, []);

   // --- FETCH LIVE DATA ---
   useEffect(() => {
      const fetchDashboard = async () => {
         try {
            setIsLoading(true);
            const res = await api.get("/dashboard/trainer");
            setDashboardData(res.data);
         } catch (err) {
            console.error("Dashboard Error:", err);
            toast.error("Failed to load dashboard data");
         } finally {
            setIsLoading(false);
         }
      };
      fetchDashboard();
   }, [api]);

   // --- CHART OPTIONS ---
   const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: {
            position: "bottom",
            labels: {
               color: paletteColors.mattBlack,
               padding: 20,
               font: { size: 12, weight: "600" }
            }
         },
         tooltip: {
            backgroundColor: paletteColors.white,
            titleColor: paletteColors.mattBlack,
            bodyColor: paletteColors.mattBlack,
            borderColor: paletteColors.lightBlue,
            borderWidth: 2,
            padding: 12,
            titleFont: { size: 13, weight: "bold" },
            bodyFont: { size: 12 }
         }
      },
      scales: {
         y: {
            beginAtZero: true,
            grid: { color: paletteColors.lightBlue, drawBorder: false },
            ticks: { color: paletteColors.gray }
         },
         x: {
            grid: { display: false },
            ticks: { color: paletteColors.gray }
         }
      }
   };

   const lineChartOptions = {
      ...chartOptions,
      tension: 0.4,
      fill: true
   };

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative w-16 h-16">
               <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="font-black text-gray-400 tracking-tighter text-sm uppercase">Loading Coach Dashboard...</p>
         </div>
      );
   }

   const {
      trainer = {},
      stats = [],
      overview = {},
      todaysSessions = [],
      upcomingSessions = [],
      recentActivity = [],
      charts = {},
      members = []
   } = dashboardData || {};

   const getTransparentColor = (hex, opacity) => {
      if (!hex) return `rgba(255, 255, 255, ${opacity})`;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
   };

   return (
      <div className="w-full">

         <div className="w-full pb-10 space-y-8 px-6 lg:px-10 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <style>{`
            .stat-card {
               transition: all 0.3s ease;
            }
            .stat-card:hover {
               transform: translateY(-4px);
               box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            }
            .chart-container {
               position: relative;
               height: 300px;
            }
            .nav-hub-card {
               transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
               cursor: pointer;
            }
            .nav-hub-card:hover {
               transform: translateY(-8px);
               box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }
         `}</style>
            {/* ========== HEADER ========== */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl overflow-hidden border-4" style={{ borderColor: paletteColors.lightBlue }}>
                        {trainer.profileImage ? (
                           <img src={trainer.profileImage} alt={trainer.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                              {trainer.name?.charAt(0) || "T"}
                           </div>
                        )}
                     </div>
                     <div>
                        <h1 className="text-3xl font-black" style={{ color: paletteColors.mattBlack }}>
                           Coach Dashboard
                        </h1>
                        <p className="text-sm" style={{ color: paletteColors.gray }}>
                           {trainer.name} • {trainer.specialization}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="flex gap-3 flex-wrap">
                  <Link to="/trainer/members" className="flex-1 sm:flex-none">
                     <button className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border-2"
                        style={{
                           backgroundColor: paletteColors.white,
                           borderColor: '#F3F4F6',
                           color: paletteColors.mattBlack
                        }}
                        onMouseEnter={e => e.target.style.backgroundColor = paletteColors.lightBlue}
                        onMouseLeave={e => e.target.style.backgroundColor = paletteColors.white}
                     >
                        <i className="fa-solid fa-users"></i> My Clients
                     </button>
                  </Link>
                  <Link to="/trainer/sessions" className="flex-1 sm:flex-none">
                     <button className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border-2"
                        style={{
                           backgroundColor: paletteColors.white,
                           borderColor: '#F3F4F6',
                           color: paletteColors.mattBlack
                        }}
                        onMouseEnter={e => e.target.style.backgroundColor = paletteColors.softYellow}
                        onMouseLeave={e => e.target.style.backgroundColor = paletteColors.white}
                     >
                        <i className="fa-solid fa-calendar-check"></i> Sessions
                     </button>
                  </Link>
                  <Link to="/trainer/workout-diet" className="flex-1 sm:flex-none">
                     <button className="w-full px-6 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
                        style={{
                           backgroundColor: paletteColors.mattBlack
                        }}
                     >
                        <i className="fa-solid fa-plus"></i> New Plan
                     </button>
                  </Link>
               </div>
            </div>

            {/* ========== KEY METRICS CARDS ========== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {stats.map((stat, idx) => (
                  <div
                     key={idx}
                     className="stat-card border rounded-2xl p-6 relative overflow-hidden group"
                     style={{
                        backgroundColor: paletteColors.white,
                        borderColor: '#F3F4F6',
                        boxShadow: "0 2px 8px rgba(205, 231, 254, 0.1)"
                     }}
                  >
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                           <p className="text-xs font-bold uppercase tracking-widest" style={{ color: paletteColors.gray }}>
                              {stat.label}
                           </p>
                           <h3 className="text-4xl font-black mt-2" style={{ color: paletteColors.mattBlack }}>
                              {stat.value}
                           </h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${stat.color} ${stat.text}`}>
                           <i className={`fa-solid ${stat.icon}`}></i>
                        </div>
                     </div>

                  </div>
               ))}
            </div>

            {/* ========== MAIN CONTENT GRID ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

               {/* ========== LEFT COLUMN (2/3 width) ========== */}
               <div className="lg:col-span-2 space-y-6">

                  {/* Today's Sessions */}
                  <div className="border rounded-2xl p-6" style={{ backgroundColor: paletteColors.white, borderColor: '#F3F4F6' }}>
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                        <i className="fa-solid fa-clock" style={{ color: paletteColors.lime }}></i>
                        Today's Sessions
                     </h3>
                     {todaysSessions.length > 0 ? (
                        <div className="space-y-3">
                           {todaysSessions.map((session, idx) => (
                              <Link key={idx} to={`/trainer/sessions/${session.id}`}>
                                 <div className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
                                    style={{
                                       backgroundColor: paletteColors.white,
                                       borderColor: '#F3F4F6',
                                       opacity: 0.95
                                    }}
                                    onMouseEnter={e => {
                                       e.currentTarget.style.borderColor = paletteColors.lime;
                                       e.currentTarget.style.backgroundColor = getTransparentColor(paletteColors.lime, 0.05);
                                    }}
                                    onMouseLeave={e => {
                                       e.currentTarget.style.borderColor = paletteColors.lightBlue;
                                       e.currentTarget.style.backgroundColor = paletteColors.white;
                                    }}
                                 >
                                    <div className="flex items-center justify-between mb-2">
                                       <div className="font-bold text-sm" style={{ color: paletteColors.mattBlack }}>
                                          {session.type}
                                       </div>
                                       <span className="text-xs px-2 py-1 rounded-lg font-bold"
                                          style={{
                                             backgroundColor: session.status === "Upcoming" ? getTransparentColor(paletteColors.lime, 0.2) : getTransparentColor(paletteColors.lightBlue, 0.2),
                                             color: session.status === "Upcoming" ? paletteColors.mattBlack : paletteColors.mattBlack
                                          }}>
                                          {session.status}
                                       </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs" style={{ color: paletteColors.gray }}>
                                       <div>
                                          <i className="fa-solid fa-users mr-2"></i>
                                          Capacity: {session.bookedCount}/{session.capacity}
                                       </div>
                                       <div>
                                          <i className="fa-solid fa-hourglass-end mr-2"></i>
                                          {session.time} • {session.duration}
                                       </div>
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-12" style={{ opacity: 0.5 }}>
                           <i className="fa-solid fa-calendar-xmark text-4xl mb-3" style={{ color: paletteColors.gray }}></i>
                           <p className="text-sm" style={{ color: paletteColors.gray }}>
                              No sessions scheduled for today
                           </p>
                        </div>
                     )}
                  </div>

                  {/* Upcoming Sessions */}
                  <div className="border rounded-2xl p-6" style={{ backgroundColor: paletteColors.white, borderColor: '#F3F4F6' }}>
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                           <i className="fa-solid fa-calendar-days" style={{ color: paletteColors.softYellow }}></i>
                           Upcoming Sessions
                        </h3>
                        <Link to="/trainer/sessions" className="text-xs font-bold" style={{ color: paletteColors.lime }}>
                           View All →
                        </Link>
                     </div>
                     {upcomingSessions.length > 0 ? (
                        <div className="space-y-2">
                           {upcomingSessions.map((session, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg"
                                 style={{
                                    backgroundColor: paletteColors.white,
                                    borderLeft: `3px solid ${paletteColors.lime}`
                                 }}>
                                 <div>
                                    <p className="text-sm font-bold" style={{ color: paletteColors.mattBlack }}>{session.type}</p>
                                    <p className="text-xs" style={{ color: paletteColors.gray }}>Capacity: {session.bookedCount}/{session.capacity}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xs font-bold" style={{ color: paletteColors.mattBlack }}>{session.date}</p>
                                    <p className="text-xs" style={{ color: paletteColors.gray }}>{session.time}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-6" style={{ opacity: 0.5 }}>
                           <i className="fa-solid fa-calendar-xmark text-3xl mb-3" style={{ color: paletteColors.gray }}></i>
                           <p className="text-sm" style={{ color: paletteColors.gray }}>
                              No upcoming sessions scheduled
                           </p>
                        </div>
                     )}
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="border rounded-2xl p-6" style={{ backgroundColor: paletteColors.white, borderColor: '#F3F4F6' }}>
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                        <i className="fa-solid fa-bell" style={{ color: paletteColors.softYellow }}></i>
                        Activity
                     </h3>
                     <div className="space-y-3 max-h-60 overflow-y-auto">
                        {recentActivity.length > 0 ? (
                           recentActivity.map((activity, idx) => (
                              <div key={idx} className="flex gap-3 pb-3 border-b" style={{ borderColor: paletteColors.lightBlue }}>
                                 <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                    style={{
                                       backgroundColor: paletteColors.lightBlue,
                                       color: paletteColors.mattBlack
                                    }}>
                                    <i className={`fa-solid ${activity.icon}`}></i>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold line-clamp-2" style={{ color: paletteColors.mattBlack }}>
                                       {activity.text}
                                    </p>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-8" style={{ opacity: 0.5 }}>
                              <i className="fa-solid fa-inbox text-2xl mb-2" style={{ color: paletteColors.gray }}></i>
                              <p className="text-xs" style={{ color: paletteColors.gray }}>No recent activity</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* ========== RIGHT COLUMN (1/3 width) ========== */}
               </div>
               <div className="space-y-6">

                  {/* Client Summary Overview */}
                  <div className="border rounded-2xl p-6" style={{ backgroundColor: paletteColors.white, borderColor: '#F3F4F6'}}>
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                        <i className="fa-solid fa-users-line" style={{ color: paletteColors.lime }}></i>
                        Client Summary
                     </h3>
                     <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-4 rounded-lg text-center" style={{ backgroundColor: getTransparentColor(paletteColors.lime, 0.1) }}>
                           <p className="text-2xl font-black" style={{ color: paletteColors.mattBlack }}>{overview.activeMembers}</p>
                           <p className="text-xs mt-2" style={{ color: paletteColors.gray }}>Active</p>
                        </div>
                        <div className="p-4 rounded-lg text-center" style={{ backgroundColor: getTransparentColor(paletteColors.lightBlue, 0.1) }}>
                           <p className="text-2xl font-black" style={{ color: paletteColors.mattBlack }}>{overview.inactiveMembers}</p>
                           <p className="text-xs mt-2" style={{ color: paletteColors.gray }}>Inactive</p>
                        </div>
                     </div>
                     <div className="pt-4 border-t space-y-3" style={{ borderColor: paletteColors.lightBlue }}>
                        <div className="flex items-center justify-between text-sm">
                           <span style={{ color: paletteColors.gray }}>Total Clients</span>
                           <span className="font-bold" style={{ color: paletteColors.mattBlack }}>{overview.totalMembers}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <span style={{ color: paletteColors.gray }}>This Month</span>
                           <span className="font-bold" style={{ color: paletteColors.mattBlack }}>{overview.completedSessionsThisMonth || 0} sessions</span>
                        </div>
                     </div>
                  </div>

                  {/* Fitness Goals Distribution */}
                  <div className="border rounded-2xl p-6" style={{ backgroundColor: paletteColors.white, borderColor: '#F3F4F6' }}>
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                        <i className="fa-solid fa-bullseye" style={{ color: paletteColors.softYellow }}></i>
                        Goals Breakdown
                     </h3>
                     <div className="chart-container">
                        {charts.goalsDistribution && (
                           <Doughnut
                              data={{
                                 ...charts.goalsDistribution,
                                 datasets: [{
                                    ...charts.goalsDistribution.datasets[0],
                                    backgroundColor: [paletteColors.softYellow, paletteColors.lightBlue, paletteColors.lime, paletteColors.mattBlack, paletteColors.gray]
                                 }]
                              }}
                              options={{
                                 ...chartOptions,
                                 plugins: {
                                    ...chartOptions.plugins,
                                    legend: { display: false }
                                 },
                                 cutout: '65%'
                              }}
                           />
                        )}
                     </div>
                     {charts.goalsDistribution && (
                        <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: paletteColors.lightBlue }}>
                           {charts.goalsDistribution.labels.map((label, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                 <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: charts.goalsDistribution.datasets[0].backgroundColor[idx] }}></span>
                                    <span style={{ color: paletteColors.gray }}>{label}</span>
                                 </div>
                                 <span className="font-bold" style={{ color: paletteColors.mattBlack }}>
                                    {charts.goalsDistribution.datasets[0].data[idx]}
                                 </span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>


               </div>
            </div>

            {/* ========== QUICK ACTION NAVIGATION HUB ========== */}
            <div className="space-y-4">
               <h2 className="text-lg font-bold" style={{ color: paletteColors.mattBlack }}>
                  <i className="fa-solid fa-magic mr-2" style={{ color: paletteColors.lime }}></i>
                  Quick Access
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Link to="/trainer/members">
                     <div className="nav-hub-card border rounded-2xl p-6 text-center transition-all"
                        style={{
                           backgroundColor: getTransparentColor(paletteColors.lightBlue, 0.1),
                           borderColor: '#F3F4F6',
                           border: `2px solid ${paletteColors.lightBlue}`
                        }}
                     >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: paletteColors.lightBlue, color: paletteColors.mattBlack }}>
                           <i className="fa-solid fa-people-group"></i>
                        </div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: paletteColors.mattBlack }}>My Clients</h4>
                        <p className="text-xs" style={{ color: paletteColors.gray }}>{overview.totalMembers} total</p>
                     </div>
                  </Link>

                  <Link to="/trainer/sessions">
                     <div className="nav-hub-card border rounded-2xl p-6 text-center transition-all"
                        style={{
                           backgroundColor: getTransparentColor(paletteColors.lime, 0.1),
                           borderColor: paletteColors.lime,
                           border: `2px solid ${paletteColors.lime}`
                        }}
                     >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: paletteColors.lime, color: paletteColors.mattBlack }}>
                           <i className="fa-solid fa-calendar-check"></i>
                        </div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: paletteColors.mattBlack }}>Sessions</h4>
                        <p className="text-xs" style={{ color: paletteColors.gray }}>{todaysSessions.length} today</p>
                     </div>
                  </Link>

                  <Link to="/trainer/workout-diet">
                     <div className="nav-hub-card border rounded-2xl p-6 text-center transition-all"
                        style={{
                           backgroundColor: getTransparentColor(paletteColors.softYellow, 0.1),
                           borderColor: paletteColors.softYellow,
                           border: `2px solid ${paletteColors.softYellow}`
                        }}
                     >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: paletteColors.softYellow, color: paletteColors.mattBlack }}>
                           <i className="fa-solid fa-dumbbell"></i>
                        </div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: paletteColors.mattBlack }}>Workouts</h4>
                        <p className="text-xs" style={{ color: paletteColors.gray }}>Create & manage</p>
                     </div>
                  </Link>


               </div>
            </div>

            {/* ========== TOP CLIENTS MINI SECTION ========== */}
            <div className="border rounded-2xl p-6" style={{ backgroundColor: paletteColors.white, borderColor: paletteColors.lightBlue }}>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                     <i className="fa-solid fa-star" style={{ color: paletteColors.softYellow }}></i>
                     Top Performing Clients
                  </h3>
                  <Link to="/trainer/members" className="text-xs font-bold" style={{ color: paletteColors.lime }}>
                     View All →
                  </Link>
               </div>
               {members.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {members.slice(0, 6).map((member, idx) => (
                        <Link key={idx} to={`/trainer/members`}>
                           <div className="p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg"
                              style={{
                                 backgroundColor: paletteColors.white,
                                 borderColor: '#F3F4F6'
                              }}
                              onMouseEnter={e => {
                                 e.currentTarget.style.borderColor = paletteColors.lime;
                                 e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={e => {
                                 e.currentTarget.style.borderColor = paletteColors.lightBlue;
                                 e.currentTarget.style.transform = 'translateY(0)';
                              }}
                           >
                              <div className="flex items-center gap-3 mb-3">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{ background: `linear-gradient(to right, ${paletteColors.lightBlue}, ${paletteColors.lime})` }}>
                                    {member.name?.charAt(0)}
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-sm font-bold" style={{ color: paletteColors.mattBlack }}>
                                       {member.name}
                                    </p>
                                    <p className="text-xs" style={{ color: paletteColors.gray }}>
                                       {member.plan}
                                    </p>
                                 </div>
                              </div>
                              <div className="space-y-1 text-xs">
                                 <div className="flex justify-between" style={{ color: paletteColors.gray }}>
                                    <span>Goal:</span>
                                    <span style={{ color: paletteColors.mattBlack }} className="font-semibold">{member.goal}</span>
                                 </div>
                                 <div className="flex justify-between" style={{ color: paletteColors.gray }}>
                                    <span>Status:</span>
                                    <span className={`font-semibold ${member.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                       {member.status}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-12" style={{ opacity: 0.5 }}>
                     <i className="fa-solid fa-inbox text-3xl mb-3" style={{ color: paletteColors.gray }}></i>
                     <p className="text-sm" style={{ color: paletteColors.gray }}>
                        No clients assigned yet
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Dashboard;