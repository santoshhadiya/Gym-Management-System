import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
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
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

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
  Filler
);

const PerformanceReports = () => {
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
  const members = [
    {
      id: 1,
      name: "Ravi Patel",
      plan: "Yearly Elite",
      expiry: "2025-01-15",
      goal: "Weight Loss",
      startWeight: 90,
      currentWeight: 82,
      height: 1.75, // meters
      bmi: 26.8,
      goalStatus: "On Track",
      alerts: [],
      history: {
        dates: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        weight: [90, 89, 87.5, 86, 84, 82],
        bodyFat: [28, 27.5, 27, 26, 25, 24],
        attendance: [3, 4, 5, 4, 5, 5],
        completion: [80, 85, 90, 85, 95, 98]
      },
      lastReview: {
        date: "2024-10-20",
        rating: "Excellent",
        remarks: "Great consistency. Strength has increased on compound lifts."
      }
    },
    {
      id: 2,
      name: "Priya Shah",
      plan: "Quarterly Pro",
      expiry: "2024-11-20",
      goal: "Muscle Gain",
      startWeight: 52,
      currentWeight: 53,
      height: 1.62,
      bmi: 20.2,
      goalStatus: "Needs Attention",
      alerts: ["Low Attendance", "Stalled Progress"],
      history: {
        dates: ["Week 1", "Week 2", "Week 3", "Week 4"],
        weight: [52, 52.2, 52.5, 53],
        bodyFat: [22, 21.8, 21.5, 21.5],
        attendance: [4, 3, 1, 2],
        completion: [90, 80, 40, 50]
      },
      lastReview: {
        date: "2024-10-15",
        rating: "Needs Improvement",
        remarks: "Missed several sessions. Needs to focus on diet adherence."
      }
    }
  ];

  // --- STATE ---
  const [selectedMemberId, setSelectedMemberId] = useState(members[0].id);
  const [metricForm, setMetricForm] = useState({
    weight: "",
    bodyFat: "",
    rating: "Good",
    remarks: ""
  });

  const selectedMember = members.find(m => m.id === parseInt(selectedMemberId));

  // --- ACTIONS ---
  const handleUpdateMetrics = (e) => {
    e.preventDefault();
    if (!metricForm.weight) {
      toast.warn("Please enter current weight.");
      return;
    }
    toast.success("Performance metrics updated & synced with member profile.");
    setMetricForm({ weight: "", bodyFat: "", rating: "Good", remarks: "" });
  };

  const handleExport = () => {
    toast.info(`Exporting Performance Report for ${selectedMember.name}...`);
  };

  // --- CHART CONFIG ---
  const weightChartData = selectedMember ? {
    labels: selectedMember.history.dates,
    datasets: [
      {
        label: 'Weight (kg)',
        data: selectedMember.history.weight,
        borderColor: '#D9F17F',
        backgroundColor: 'rgba(217, 241, 127, 0.5)',
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'Body Fat %',
        data: selectedMember.history.bodyFat,
        borderColor: '#FEEF75',
        backgroundColor: 'rgba(254, 239, 117, 0.5)',
        yAxisID: 'y1',
        tension: 0.4
      }
    ]
  } : null;

  const activityChartData = selectedMember ? {
    labels: selectedMember.history.dates,
    datasets: [
      {
        label: 'Attendance (Days)',
        data: selectedMember.history.attendance,
        backgroundColor: '#CDE7FE',
        yAxisID: 'y',
        borderRadius: 6
      },
      {
        label: 'Completion (%)',
        data: selectedMember.history.completion,
        type: 'line',
        borderColor: '#70a6d6',
        yAxisID: 'y1',
        tension: 0.3
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { grid: { display: false } },
      y: { type: 'linear', display: true, position: 'left', grid: { borderDash: [4, 4] } },
      y1: { type: 'linear', display: true, position: 'right', grid: { display: false } },
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER & SELECTOR */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h1 className="text-3xl font-black text-gray-900">Performance Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">Deep dive into member progress and trends.</p>
         </div>
         
         <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Select Assigned Member</label>
            <div className="relative">
               <select 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] font-bold text-gray-700 appearance-none cursor-pointer"
               >
                  {members.map(m => (
                     <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <i className="fa-solid fa-chevron-down"></i>
               </div>
            </div>
         </div>
      </div>

      {selectedMember && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: SUMMARY & UPDATE FORM */}
            <div className="space-y-6">
               
               {/* Quick Info Card */}
               <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#CDE7FE] rounded-bl-full opacity-20"></div>
                  
                  <div className="relative z-10">
                     <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedMember.name}</h2>
                     <p className="text-sm text-gray-500 mb-4">{selectedMember.plan} • Ends {selectedMember.expiry}</p>
                     
                     <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                           <p className="text-xs text-green-700 font-bold uppercase">Weight Change</p>
                           <p className="text-lg font-black text-gray-900">
                              {selectedMember.currentWeight - selectedMember.startWeight > 0 ? '+' : ''}
                              {(selectedMember.currentWeight - selectedMember.startWeight).toFixed(1)} kg
                           </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                           <p className="text-xs text-blue-700 font-bold uppercase">BMI Score</p>
                           <p className="text-lg font-black text-gray-900">{selectedMember.bmi}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-sm font-bold text-gray-700">Goal Status</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedMember.goalStatus === 'On Track' ? 'bg-[#D9F17F] text-green-900' : 'bg-red-100 text-red-700'}`}>
                           {selectedMember.goalStatus}
                        </span>
                     </div>

                     {/* Alerts */}
                     {selectedMember.alerts.length > 0 && (
                        <div className="mt-4 space-y-2">
                           {selectedMember.alerts.map((alert, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                 <i className="fa-solid fa-triangle-exclamation"></i> {alert}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               {/* Update Metrics Form */}
               <div className="bg-[#f8fbff] rounded-[2.5rem] p-6 border border-blue-100 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <i className="fa-solid fa-pen-to-square"></i> Update Performance
                  </h3>
                  
                  <form onSubmit={handleUpdateMetrics} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-gray-400 block mb-1">New Weight (kg)</label>
                           <input 
                              type="number" 
                              className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                              value={metricForm.weight}
                              onChange={(e) => setMetricForm({...metricForm, weight: e.target.value})}
                              placeholder={selectedMember.currentWeight}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-400 block mb-1">Body Fat %</label>
                           <input 
                              type="number" 
                              className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                              value={metricForm.bodyFat}
                              onChange={(e) => setMetricForm({...metricForm, bodyFat: e.target.value})}
                              placeholder="--"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Performance Rating</label>
                        <div className="flex gap-2">
                           {['Poor', 'Average', 'Good', 'Excellent'].map(rate => (
                              <button
                                 key={rate}
                                 type="button"
                                 onClick={() => setMetricForm({...metricForm, rating: rate})}
                                 className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${metricForm.rating === rate ? 'bg-[#FEEF75] text-yellow-900 border-yellow-300' : 'bg-white text-gray-500 border-gray-200'}`}
                              >
                                 {rate}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Trainer Remarks</label>
                        <textarea 
                           rows="3"
                           className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 resize-none text-sm"
                           placeholder="Strengths, weaknesses, next goals..."
                           value={metricForm.remarks}
                           onChange={(e) => setMetricForm({...metricForm, remarks: e.target.value})}
                        ></textarea>
                     </div>

                     <button type="submit" className="w-full py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold text-sm hover:bg-green-300 transition-colors shadow-sm">
                        Save & Sync
                     </button>
                  </form>
               </div>

            </div>

            {/* CENTER/RIGHT: GRAPHS & HISTORY */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* Progress Charts */}
               <div className="grid grid-cols-1 gap-6">
                  
                  {/* Weight Trend */}
                  <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                           <span className="w-2 h-5 bg-[#D9F17F] rounded-full"></span> Physical Progress
                        </h3>
                     </div>
                     <div className="h-56 relative w-full">
                        <Line data={weightChartData} options={chartOptions} />
                     </div>
                  </div>

                  {/* Attendance & Compliance */}
                  <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                     <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-5 bg-[#CDE7FE] rounded-full"></span> Consistency Analysis
                     </h3>
                     <div className="h-56 relative w-full">
                        <Bar data={activityChartData} options={chartOptions} />
                     </div>
                     <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 italic text-center">
                        * Comparison of Attendance (Days) vs Plan Completion % shows commitment levels.
                     </div>
                  </div>

               </div>

               {/* History & Export */}
               <div className="flex flex-col md:flex-row gap-6">
                  
                  <div className="flex-1 bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                     <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Previous Review</h3>
                     <div className="p-4 bg-[#fffbeb] rounded-2xl border border-[#FEEF75]">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-gray-500">{selectedMember.lastReview.date}</span>
                           <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-yellow-200 text-yellow-800">
                              {selectedMember.lastReview.rating}
                           </span>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{selectedMember.lastReview.remarks}"</p>
                     </div>
                  </div>

                  <div className="flex-none flex items-end">
                     <button 
                        onClick={handleExport}
                        className="w-full md:w-auto px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                     >
                        <i className="fa-solid fa-file-pdf"></i> Export Report
                     </button>
                  </div>

               </div>

            </div>

         </div>
      )}
    </div>
  );
};

export default PerformanceReports;