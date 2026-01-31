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
import toast from 'react-hot-toast'; // Updated Toast
import { useTheme } from "../../context/ThemeContext"; // Import Context

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
  const { colors, theme } = useTheme(); // Consume Theme

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
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        const profileRes = await fetch(`${BACKEND_URL}/api/members/profile`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        const progressRes = await fetch(`${BACKEND_URL}/api/workout-diet/my/plan`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const progressDataRaw = await progressRes.json();

        if (progressDataRaw) {
            const sortedWeightHistory = (progressDataRaw.weightHistory || []).sort((a, b) => new Date(a.date) - new Date(b.date));
            setWeightHistory(sortedWeightHistory);
            setProgressLog(progressDataRaw.progress || []);
        }

        if (profileData) {
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

  // --- CHARTS ---
  const getWeightChartData = () => {
      let labels = [];
      let data = [];

      if (memberStats.startWeight) {
          labels.push("Start");
          data.push(memberStats.startWeight);
      }
      weightHistory.forEach(log => {
          labels.push(new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          data.push(log.weight);
      });
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
        borderColor: colors.primary, 
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(217, 241, 127, 0.4)");
          gradient.addColorStop(1, "rgba(217, 241, 127, 0)");
          return gradient;
        },
        tension: 0.3,
        fill: true,
        pointBackgroundColor: colors.card,
        pointBorderColor: colors.primary,
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const filteredLogs = progressLog.filter(log => {
      const logDate = new Date(log.date);
      return log.workoutCompleted === true && 
             logDate.getMonth() === selectedMonth && 
             logDate.getFullYear() === selectedYear;
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const workoutCounts = new Array(7).fill(0); 

  filteredLogs.forEach(log => {
      const date = new Date(log.date);
      let dayIndex = date.getDay(); 
      let chartIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      workoutCounts[chartIndex]++;
  });

  const consistencyData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Workouts Completed",
        data: workoutCounts,
        backgroundColor: theme === 'dark' ? colors.secondary : '#1f2937', 
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };

  const dietTotal = progressLog.length;
  const dietSuccess = progressLog.filter(l => l.dietCompleted).length;
  const dietPercentage = dietTotal > 0 ? Math.round((dietSuccess / dietTotal) * 100) : 0;
  
  const dietChartData = {
    labels: ["Adherence", "Missed"],
    datasets: [
      {
        data: [dietPercentage, 100 - dietPercentage],
        backgroundColor: ["#4ade80", theme === 'dark' ? '#374151' : '#f3f4f6'],
        borderWidth: 0,
      },
    ],
  };

  const handleDownloadReport = () => toast("Report download coming soon!", { icon: '📄' });
  const handleRequestReview = () => toast.success("Request sent to trainer!");
  
  const getMonthName = (monthIndex) => new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });

  if (loading) return <div className="p-10 text-center" style={{ color: colors.textMuted }}>Loading Progress...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>Your Progress</h1>
          <p className="text-sm md:text-base mt-1" style={{ color: colors.textMuted }}>Track your fitness journey and milestones.</p>
        </div>
        <div className="flex flex-wrap gap-4 md:gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none text-left md:text-right p-3 md:p-0 rounded-xl md:rounded-none"
                 style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                <p className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Current Weight</p>
                <p className="text-xl md:text-2xl font-black" style={{ color: colors.text }}>{memberStats.currentWeight} <span className="text-sm font-bold" style={{ color: colors.textMuted }}>kg</span></p>
            </div>
            <div className="hidden md:block h-10 w-px" style={{ backgroundColor: colors.border }}></div>
            <div className="flex-1 md:flex-none text-left md:text-right p-3 md:p-0 rounded-xl md:rounded-none"
                 style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                <p className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Start Weight</p>
                <p className="text-xl md:text-2xl font-black" style={{ color: colors.text }}>{memberStats.startWeight} <span className="text-sm font-bold" style={{ color: colors.textMuted }}>kg</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COL: Weight Trend */}
         <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[2.5rem] p-6 md:p-8 border shadow-sm relative overflow-hidden"
                 style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>Weight Trend</h3>
                  <select className="border rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
                          style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}>
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
                            y: { ticks: { color: colors.textMuted }, grid: { color: colors.border } }, 
                            x: { ticks: { color: colors.textMuted }, grid: { display: false } } 
                        }
                    }} 
                  />
               </div>
            </div>

            {/* Consistency Bar Chart */}
            <div className="rounded-[2.5rem] p-6 md:p-8 border shadow-sm"
                 style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>Workout Consistency</h3>
                    
                    <div className="flex gap-2">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="border rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
                            style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{getMonthName(i)}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
                            style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
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
                          scales: { y: { display: false }, x: { ticks: { color: colors.textMuted }, grid: { display: false } } }
                      }}
                   />
                </div>
                <p className="text-xs text-center mt-2" style={{ color: colors.textMuted }}>Days worked out in {getMonthName(selectedMonth)} {selectedYear}</p>
            </div>
         </div>

         {/* RIGHT COL: Stats & Diet */}
         <div className="space-y-6">
            
            {/* Diet Adherence */}
            <div className="rounded-[2.5rem] p-6 md:p-8 border shadow-sm text-center relative"
                 style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>Diet Adherence</h3>
               <div className="w-40 h-40 mx-auto relative">
                  <Doughnut 
                     data={dietChartData} 
                     options={{ cutout: '75%', plugins: { legend: { display: false } }, borderJoinStyle: 'round' }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-3xl font-black" style={{ color: colors.text }}>{dietPercentage}%</span>
                     <span className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Success</span>
                  </div>
               </div>
               <p className="text-sm mt-6 px-4" style={{ color: colors.textMuted }}>
                  You've followed your diet plan for <b>{dietSuccess}</b> out of <b>{dietTotal}</b> tracked days.
               </p>
            </div>

            {/* Trainer Note */}
            <div className="rounded-[2.5rem] p-6 md:p-8 border relative overflow-hidden"
                 style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(6, 78, 59, 0.2)' : '#f0fdf4',
                    borderColor: theme === 'dark' ? '#064e3b' : '#dcfce7' 
                 }}>
               <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl"
                    style={{ backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : '#bbf7d0' }}></div>
               <h3 className="text-lg font-bold mb-3 flex items-center gap-2 relative z-10" style={{ color: theme === 'dark' ? '#86efac' : '#14532d' }}>
                  <i className="fa-solid fa-user-pen"></i> Trainer's Note
               </h3>
               <p className="italic leading-relaxed text-sm mb-4 relative z-10" style={{ color: theme === 'dark' ? '#bbf7d0' : '#166534' }}>
                  "Great progress on the weight lifting! Try to increase protein intake slightly next week."
               </p>
               <p className="text-xs font-medium text-right" style={{ color: theme === 'dark' ? '#4ade80' : '#16a34a' }}>Updated: {new Date().toLocaleDateString()}</p>
            </div>

         </div>
      </div>

      {/* --- ACTIONS FOOTER --- */}
      <div className="rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left"
           style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
         <div className="text-sm" style={{ color: colors.textMuted }}>
            Need detailed insights or advice?
         </div>
         <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
               onClick={handleRequestReview}
               className="flex-1 px-6 py-3 border rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
               style={{ 
                   backgroundColor: colors.card, 
                   borderColor: colors.border,
                   color: colors.textMuted 
               }}
            >
               <i className="fa-regular fa-paper-plane"></i> Ask Trainer
            </button>
            <button 
               onClick={handleDownloadReport}
               className="flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg hover:shadow-xl"
               style={{ backgroundColor: colors.primary, color: '#14532d' }}
            >
               Download Report
            </button>
         </div>
      </div>

    </div>
  );
};

export default Progress;