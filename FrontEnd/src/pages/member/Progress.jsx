import React, { useState, useEffect } from "react";
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
  Filler,
  ArcElement
);

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const Progress = () => {
  // --- STATE ---
  const [weightHistory, setWeightHistory] = useState([]);
  const [progressLog, setProgressLog] = useState([]);
  const [memberStats, setMemberStats] = useState({
      startWeight: 0,
      currentWeight: 0,
      goalWeight: 0,
      attendance: 0
  });
  const [loading, setLoading] = useState(true);
  
  // State for Month Selection (Workout Consistency)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        // 1. Fetch Member Profile for basic stats
        const profileRes = await fetch(`${BACKEND_URL}/api/members/profile`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        // 2. Fetch Plan/Progress Data
        const progressRes = await fetch(`${BACKEND_URL}/api/workout-diet/my/plan`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const progressDataRaw = await progressRes.json();

        // Set State
        if (progressDataRaw) {
            // Sort weight history chronologically
            const sortedWeightHistory = (progressDataRaw.weightHistory || []).sort((a, b) => new Date(a.date) - new Date(b.date));
            setWeightHistory(sortedWeightHistory);
            
            // Ensure progressLog is set. Backend returns 'progress' array
            setProgressLog(progressDataRaw.progress || []);
        }

        if (profileData) {
            // Infer start weight: prefer profile start weight, fallback to first log, then current
            const startWeight = profileData.startWeight || (progressDataRaw.weightHistory?.[0]?.weight) || profileData.currentWeight || 0;
            
            setMemberStats({
                startWeight: startWeight,
                currentWeight: profileData.currentWeight || 0,
                goalWeight: profileData.targetWeight || 0, 
                attendance: 0 
            });
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- DERIVED DATA FOR CHARTS ---
  
  // 1. Weight Chart Data
  const getWeightChartData = () => {
      let labels = [];
      let data = [];

      // Add Start Weight point if available
      if (memberStats.startWeight) {
          labels.push("Start");
          data.push(memberStats.startWeight);
      }

      // Add history points
      weightHistory.forEach(log => {
          labels.push(new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          data.push(log.weight);
      });

      // Add Current Weight as latest point if different from last history
      if (memberStats.currentWeight && (data.length === 0 || data[data.length - 1] !== memberStats.currentWeight)) {
           labels.push("Current");
           data.push(memberStats.currentWeight);
      }
      
      return { labels, data };
  };

  const weightChartInfo = getWeightChartData();

  const weightChartData = {
    labels: weightChartInfo.labels,
    datasets: [
      {
        label: "Weight (kg)",
        data: weightChartInfo.data,
        borderColor: "#D9F17F", 
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(217, 241, 127, 0.6)");
          gradient.addColorStop(1, "rgba(217, 241, 127, 0)");
          return gradient;
        },
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#D9F17F",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // 2. Consistency (Workout Completion - Monthly View)
  // Filter logs for selected Month & Year where workout was completed
  const filteredLogs = progressLog.filter(log => {
      const logDate = new Date(log.date);
      // Backend stores date as YYYY-MM-DD string, new Date parses it correctly in UTC usually, 
      // but simplistic local parsing is fine for daily granularity here.
      // Ensure strict comparison with workoutCompleted === true
      return log.workoutCompleted === true && 
             logDate.getMonth() === selectedMonth && 
             logDate.getFullYear() === selectedYear;
  });

  // Aggregate by Day of Week (0=Sun, 1=Mon, ..., 6=Sat)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const workoutCounts = new Array(7).fill(0); // [Mon, Tue, ... Sun]

  filteredLogs.forEach(log => {
      const date = new Date(log.date);
      let dayIndex = date.getDay(); // 0 is Sunday
      // Convert JS getDay() (0=Sun) to our array index (0=Mon, ..., 6=Sun)
      let chartIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      workoutCounts[chartIndex]++;
  });

  const consistencyData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Workouts Completed",
        data: workoutCounts,
        backgroundColor: "#1f2937", // Dark gray
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };

  // 3. Diet Adherence (Overall) - UNCHANGED
  const dietTotal = progressLog.length;
  const dietSuccess = progressLog.filter(l => l.dietCompleted).length;
  const dietPercentage = dietTotal > 0 ? Math.round((dietSuccess / dietTotal) * 100) : 0;
  
  const dietChartData = {
    labels: ["Adherence", "Missed"],
    datasets: [
      {
        data: [dietPercentage, 100 - dietPercentage],
        backgroundColor: ["#4ade80", "#f3f4f6"], // Green, Light Gray
        borderWidth: 0,
      },
    ],
  };

  // --- ACTIONS ---
  const handleDownloadReport = () => {
    toast.info("Downloading Report...");
  };

  const handleRequestReview = () => {
    toast.success("Request sent to trainer!");
  };
  
  // Helper for Month Name
  const getMonthName = (monthIndex) => {
      return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Progress...</div>;

  return (
    // Changed: Added padding (px-4 sm:px-0) for mobile spacing
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-0">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      {/* Changed: flex-col md:flex-row and items-start md:items-end for mobile title alignment */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Your Progress</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Track your fitness journey and milestones.</p>
        </div>
        {/* Changed: Added flex-wrap and w-full for mobile stats */}
        <div className="flex flex-wrap gap-4 md:gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none text-left md:text-right bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                <p className="text-xs text-gray-400 font-bold uppercase">Current Weight</p>
                <p className="text-xl md:text-2xl font-black text-gray-900">{memberStats.currentWeight} <span className="text-sm font-bold text-gray-400">kg</span></p>
            </div>
            <div className="hidden md:block h-10 w-px bg-gray-200"></div>
            <div className="flex-1 md:flex-none text-left md:text-right bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                <p className="text-xs text-gray-400 font-bold uppercase">Start Weight</p>
                <p className="text-xl md:text-2xl font-black text-gray-900">{memberStats.startWeight} <span className="text-sm font-bold text-gray-400">kg</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COL: Weight Trend */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Weight Trend</h3>
                  <select className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer">
                     <option>All Time</option>
                     <option>Last 6 Months</option>
                  </select>
               </div>
               <div className="h-64 w-full">
                  <Line 
                    data={weightChartData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { 
                            y: { grid: { color: '#f3f4f6' } }, 
                            x: { grid: { display: false } } 
                        }
                    }} 
                  />
               </div>
            </div>

            {/* Consistency Bar Chart (Monthly) */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                    <h3 className="text-lg font-bold text-gray-900">Workout Consistency</h3>
                    
                    {/* Month Selector */}
                    <div className="flex gap-2">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{getMonthName(i)}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                </div>

                <div className="h-48 w-full">
                   <Bar 
                      data={consistencyData} 
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { display: false }, x: { grid: { display: false } } }
                      }}
                   />
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">Days worked out in {getMonthName(selectedMonth)} {selectedYear}</p>
            </div>
         </div>

         {/* RIGHT COL: Stats & Diet */}
         <div className="space-y-6">
            
            {/* Diet Adherence */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm text-center relative">
               <h3 className="text-lg font-bold text-gray-900 mb-6">Diet Adherence</h3>
               <div className="w-40 h-40 mx-auto relative">
                  <Doughnut 
                     data={dietChartData} 
                     options={{ cutout: '75%', plugins: { legend: { display: false } } }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-3xl font-black text-gray-900">{dietPercentage}%</span>
                     <span className="text-xs text-gray-400 font-bold uppercase">Success</span>
                  </div>
               </div>
               <p className="text-sm text-gray-500 mt-6 px-4">
                  You've followed your diet plan for <b>{dietSuccess}</b> out of <b>{dietTotal}</b> tracked days.
               </p>
            </div>

            {/* Trainer Note */}
            <div className="bg-[#f0fdf4] rounded-[2.5rem] p-6 md:p-8 border border-green-100 shadow-sm relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200/50 rounded-full blur-3xl"></div>
               <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2 relative z-10">
                  <i className="fa-solid fa-user-pen"></i> Trainer's Note
               </h3>
               <p className="text-green-800 italic leading-relaxed text-sm mb-4 relative z-10">
                  "Great progress on the weight lifting! Try to increase protein intake slightly next week."
               </p>
               <p className="text-xs text-green-600 font-medium text-right">Updated: {new Date().toLocaleDateString()}</p>
            </div>

         </div>
      </div>

      {/* --- ACTIONS FOOTER --- */}
      {/* Changed: flex-col md:flex-row and gap adjustment for mobile */}
      <div className="bg-gray-50 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
         <div className="text-sm text-gray-500">
            Need detailed insights or advice?
         </div>
         <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
               onClick={handleRequestReview}
               className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-white hover:border-gray-300 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
               <i className="fa-regular fa-paper-plane"></i> Ask Trainer
            </button>
            <button 
               onClick={handleDownloadReport}
               className="flex-1 px-6 py-3 bg-[#D9F17F] text-green-900 rounded-xl text-sm font-bold hover:bg-green-300 transition-colors shadow-lg hover:shadow-xl"
            >
               Download Report
            </button>
         </div>
      </div>

    </div>
  );
};

export default Progress;