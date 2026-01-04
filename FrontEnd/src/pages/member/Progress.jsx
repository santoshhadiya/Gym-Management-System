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

const Progress = () => {
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

  // --- DYNAMIC STATE ---
  const [dateRange, setDateRange] = useState("30 Days");
  
  // Simulating dynamic data fetching
  const [progressData, setProgressData] = useState({
    currentWeight: 82,
    startingWeight: 86.5,
    goalWeight: 75,
    height: 1.75, // meters
    bmi: 26.8,
    bmiStatus: "Overweight",
    goalStatus: "On Track",
    sessions: { total: 24, attended: 20, missed: 4 },
    compliance: { workout: 85, diet: 78 },
    trainerNote: "Excellent consistency this month. Focus more on protein intake post-workout.",
    lastReview: "2024-02-01",
    history: {
        dates: ["Week 1", "Week 2", "Week 3", "Week 4"],
        weight: [86.5, 85.2, 83.8, 82],
        bodyFat: [28, 27.5, 27, 26.5],
        bmi: [28.2, 27.8, 27.3, 26.8],
        attendance: [3, 4, 2, 5]
    }
  });

  const weightChange = (progressData.currentWeight - progressData.startingWeight).toFixed(1);

  // --- CHART DATA GENERATORS ---
  
  // 1. Weight Trend (Line)
  const weightChartData = {
    labels: progressData.history.dates,
    datasets: [
      {
        label: "Weight (kg)",
        data: progressData.history.weight,
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

  // 2. BMI History (Line - New)
  const bmiChartData = {
    labels: progressData.history.dates,
    datasets: [
      {
        label: "BMI Score",
        data: progressData.history.bmi,
        borderColor: "#CDE7FE",
        backgroundColor: "rgba(205, 231, 254, 0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#CDE7FE",
        pointRadius: 6,
      }
    ]
  };

  // 3. Body Fat % (Line - New)
  const bodyFatChartData = {
    labels: progressData.history.dates,
    datasets: [
      {
        label: "Body Fat %",
        data: progressData.history.bodyFat,
        borderColor: "#FEEF75",
        backgroundColor: "rgba(254, 239, 117, 0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#FEEF75",
        pointRadius: 6,
      }
    ]
  };

  // 4. Attendance (Bar)
  const attendanceChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Sessions Attended",
        data: progressData.history.attendance,
        backgroundColor: "#CDE7FE",
        borderRadius: 6,
        hoverBackgroundColor: "#9ecaff"
      }
    ]
  };

  // 5. Completion (Doughnut)
  const completionChartData = {
    labels: ["Completed", "Missed"],
    datasets: [
      {
        data: [progressData.compliance.workout, 100 - progressData.compliance.workout],
        backgroundColor: ["#D9F17F", "#f3f4f6"],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: true, grid: {display: false} }, y: { display: true, grid: { borderDash: [4, 4], color: "#f3f4f6" } } }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '75%'
  };

  // --- ACTIONS ---
  const handleDownloadReport = () => {
    // Generate CSV content
    const headers = ["Metric,Current Value,Status"];
    const rows = [
        `Weight,${progressData.currentWeight}kg,${weightChange}kg change`,
        `BMI,${progressData.bmi},${progressData.bmiStatus}`,
        `Body Fat,${progressData.history.bodyFat[progressData.history.bodyFat.length-1]}%,Trending Down`,
        `Attendance,${progressData.sessions.attended}/${progressData.sessions.total},${Math.round((progressData.sessions.attended/progressData.sessions.total)*100)}%`,
        `Workout Compliance,${progressData.compliance.workout}%,-`,
        `Diet Compliance,${progressData.compliance.diet}%,-`
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Progress_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Progress Report downloaded successfully!");
  };

  const handleRequestReview = () => {
    toast.info("Request sent to Trainer for performance review.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 font-sans px-4 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER & FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Progress</h1>
          <p className="text-gray-500 mt-2 text-lg">Detailed analysis of your fitness journey.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
           {['7 Days', '30 Days', '3 Months', 'All Time'].map(range => (
              <button
                 key={range}
                 onClick={() => setDateRange(range)}
                 className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${dateRange === range ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                 {range}
              </button>
           ))}
        </div>
      </div>

      {/* --- SUMMARY METRICS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Weight Card */}
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-green-50 rounded-2xl text-green-700 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-weight-scale text-xl"></i>
               </div>
               <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${weightChange < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {weightChange < 0 ? <i className="fa-solid fa-arrow-trend-down"></i> : <i className="fa-solid fa-arrow-trend-up"></i>}
                  {Math.abs(weightChange)} kg
               </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Weight</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{progressData.currentWeight} <span className="text-sm font-medium text-gray-400">kg</span></h3>
         </div>

         {/* BMI Card */}
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-50 rounded-2xl text-blue-700 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-person text-xl"></i>
               </div>
               <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                  {progressData.bmiStatus}
               </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">BMI Score</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{progressData.bmi}</h3>
         </div>

         {/* Body Fat Card (Mocked visual) */}
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-700 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-droplet text-xl"></i>
               </div>
               <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">
                  <i className="fa-solid fa-arrow-trend-down"></i> 1.5%
               </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Body Fat</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">26.5 <span className="text-sm font-medium text-gray-400">%</span></h3>
         </div>

         {/* Goal Status */}
         <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
               <i className="fa-solid fa-bullseye text-8xl text-white"></i>
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Goal Status</p>
                  <h3 className="text-2xl font-black text-[#D9F17F]">{progressData.goalStatus}</h3>
               </div>
               <p className="text-sm text-gray-300 font-medium mt-4">Target: {progressData.goalWeight} kg</p>
            </div>
         </div>
      </div>

      {/* --- DETAILED CHARTS SECTION --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         
         {/* Main Chart Area (2/3 width) */}
         <div className="xl:col-span-2 space-y-8">
            
            {/* Weight & BMI Trend */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-3 h-8 bg-[#D9F17F] rounded-full"></span> Weight Analysis
                     </h3>
                     <p className="text-sm text-gray-500 ml-5">Tracking weight reduction over time</p>
                  </div>
               </div>
               <div className="h-80 w-full">
                  <Line data={weightChartData} options={chartOptions} />
               </div>
            </div>

            {/* Split Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Body Fat Chart */}
               <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <span className="w-2 h-6 bg-[#FEEF75] rounded-full"></span> Body Fat % Trend
                  </h3>
                  <div className="h-48 w-full">
                     <Line data={bodyFatChartData} options={chartOptions} />
                  </div>
               </div>

               {/* Attendance Chart */}
               <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <span className="w-2 h-6 bg-[#CDE7FE] rounded-full"></span> Weekly Sessions
                  </h3>
                  <div className="h-48 w-full">
                     <Bar data={attendanceChartData} options={chartOptions} />
                  </div>
               </div>
            </div>

         </div>

         {/* Sidebar Stats Area (1/3 width) */}
         <div className="space-y-8">
            
            {/* Compliance / Adherence */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center justify-center">
               <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-center">Workout Consistency</h3>
               <div className="h-64 w-64 relative">
                  <Doughnut data={completionChartData} options={donutOptions} />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-4xl font-black text-gray-900">{progressData.compliance.workout}%</span>
                     <span className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Completed</span>
                  </div>
               </div>
               <div className="flex gap-8 mt-8">
                  <div className="text-center">
                     <p className="text-2xl font-bold text-[#D9F17F]">{progressData.compliance.workout}%</p>
                     <p className="text-[10px] text-gray-400 uppercase font-bold">Workout</p>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="text-center">
                     <p className="text-2xl font-bold text-[#FEEF75]">{progressData.compliance.diet}%</p>
                     <p className="text-[10px] text-gray-400 uppercase font-bold">Diet</p>
                  </div>
               </div>
            </div>

            {/* Detailed Session Stats */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-100 pb-4">Session Breakdown</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-gray-500 font-medium">Total Assigned</span>
                     <span className="text-lg font-bold text-gray-900">{progressData.sessions.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-500 font-medium">Attended</span>
                     <span className="text-lg font-bold text-green-600">{progressData.sessions.attended}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-500 font-medium">Missed</span>
                     <span className="text-lg font-bold text-red-500">{progressData.sessions.missed}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                     <div className="bg-[#CDE7FE] h-2 rounded-full" style={{ width: `${(progressData.sessions.attended/progressData.sessions.total)*100}%` }}></div>
                  </div>
               </div>
            </div>

            {/* Trainer Note */}
            <div className="bg-[#fcfdfd] border border-[#CDE7FE] rounded-[2.5rem] p-8 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#CDE7FE] rounded-full opacity-20"></div>
               <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2 relative z-10">
                  <i className="fa-solid fa-user-pen"></i> Trainer's Note
               </h3>
               <p className="text-gray-600 italic leading-relaxed text-sm mb-4 relative z-10">"{progressData.trainerNote}"</p>
               <p className="text-xs text-gray-400 font-medium text-right">Updated: {progressData.lastReview}</p>
            </div>

         </div>
      </div>

      {/* --- ACTIONS FOOTER --- */}
      <div className="bg-gray-50 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="text-sm text-gray-500">
            Need detailed insights or advice?
         </div>
         <div className="flex gap-4">
            <button 
               onClick={handleRequestReview}
               className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-white hover:border-gray-300 transition-colors shadow-sm flex items-center gap-2"
            >
               <i className="fa-regular fa-paper-plane"></i> Ask Trainer
            </button>
            <button 
               onClick={handleDownloadReport}
               className="px-6 py-3 bg-[#D9F17F] text-green-900 rounded-xl text-sm font-bold hover:bg-green-300 transition-colors shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
            >
               <i className="fa-solid fa-download"></i> Download Report
            </button>
         </div>
      </div>

    </div>
  );
};

export default Progress;