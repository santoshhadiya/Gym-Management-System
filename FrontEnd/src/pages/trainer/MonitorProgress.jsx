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

const MonitorProgress = () => {
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
  const assignedMembers = [
    { 
      id: 1, 
      name: "Ravi Patel", 
      plan: "Yearly Elite", 
      goal: "Weight Loss", 
      image: "https://i.pravatar.cc/150?u=1",
      data: {
        currentWeight: 82,
        startWeight: 90,
        height: 175,
        bmi: 26.8,
        goalStatus: "On Track",
        attendance: 85, // %
        sessions: { total: 24, attended: 20, missed: 4 },
        history: {
            dates: ["Week 1", "Week 2", "Week 3", "Week 4"],
            weight: [90, 88, 85, 82],
            compliance: [70, 80, 85, 90]
        },
        remarks: "Doing great! Needs to improve water intake."
      }
    },
    { 
      id: 2, 
      name: "Priya Shah", 
      plan: "Quarterly Pro", 
      goal: "Muscle Gain",
      image: "https://i.pravatar.cc/150?u=2",
      data: {
        currentWeight: 55,
        startWeight: 52,
        height: 162,
        bmi: 21.0,
        goalStatus: "Needs Attention",
        attendance: 60, // %
        sessions: { total: 24, attended: 14, missed: 10 },
        history: {
            dates: ["Week 1", "Week 2", "Week 3", "Week 4"],
            weight: [52, 53, 54, 55],
            compliance: [90, 85, 60, 50]
        },
        remarks: "Missed several sessions this week."
      }
    }
  ];

  // --- STATE ---
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    weight: "",
    bodyFat: "",
    workoutCompliance: 50,
    dietCompliance: 50,
    remarks: ""
  });

  const selectedMember = assignedMembers.find(m => m.id === parseInt(selectedMemberId));

  // --- ACTIONS ---
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    
    // In real app, send update to backend
    toast.success(`Progress updated for ${selectedMember.name}`);
    setUpdateForm({ ...updateForm, weight: "", bodyFat: "", remarks: "" });
  };

  const handleAlert = () => {
    toast.warn("Low attendance alert sent to Admin.");
  };

  // --- CHART CONFIG ---
  const lineChartData = selectedMember ? {
    labels: selectedMember.data.history.dates,
    datasets: [{
      label: 'Weight (kg)',
      data: selectedMember.data.history.weight,
      borderColor: '#D9F17F',
      backgroundColor: 'rgba(217, 241, 127, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#D9F17F',
    }]
  } : null;

  const barChartData = selectedMember ? {
    labels: selectedMember.data.history.dates,
    datasets: [{
      label: 'Adherence (%)',
      data: selectedMember.data.history.compliance,
      backgroundColor: '#CDE7FE',
      borderRadius: 6,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [4, 4] } } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h1 className="text-3xl font-black text-gray-900">Monitor Progress</h1>
            <p className="text-gray-500 mt-1">Track and evaluate member performance.</p>
         </div>
         
         <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Select Member</label>
            <div className="relative">
               <select 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] font-bold text-gray-700 appearance-none cursor-pointer"
               >
                  <option value="">-- Choose Member --</option>
                  {assignedMembers.map(m => (
                     <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <i className="fa-solid fa-chevron-down"></i>
               </div>
            </div>
         </div>
      </div>

      {selectedMember ? (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: OVERVIEW & UPDATE FORM */}
            <div className="space-y-6">
               
               {/* Quick Profile Card */}
               <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                  <img src={selectedMember.image} alt={selectedMember.name} className="w-24 h-24 rounded-full border-4 border-[#CDE7FE] mb-4" />
                  <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{selectedMember.plan} • {selectedMember.goal}</p>
                  
                  <div className="grid grid-cols-3 gap-2 w-full">
                     <div className="p-2 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 font-bold uppercase">Weight</p>
                        <p className="font-black text-gray-800">{selectedMember.data.currentWeight}kg</p>
                     </div>
                     <div className="p-2 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 font-bold uppercase">BMI</p>
                        <p className="font-black text-gray-800">{selectedMember.data.bmi}</p>
                     </div>
                     <div className="p-2 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 font-bold uppercase">Goal</p>
                        <p className={`font-bold text-xs ${selectedMember.data.goalStatus === 'On Track' ? 'text-green-600' : 'text-red-500'}`}>{selectedMember.data.goalStatus}</p>
                     </div>
                  </div>
               </div>

               {/* Update Form */}
               <div className="bg-[#f8fbff] rounded-[2.5rem] p-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <i className="fa-solid fa-pen-to-square"></i> Update Metrics
                  </h3>
                  
                  <form onSubmit={handleUpdate} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-gray-400 block mb-1">Weight (kg)</label>
                           <input 
                              type="number" 
                              className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                              value={updateForm.weight}
                              onChange={(e) => setUpdateForm({...updateForm, weight: e.target.value})}
                              placeholder={selectedMember.data.currentWeight}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-400 block mb-1">Body Fat %</label>
                           <input 
                              type="number" 
                              className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                              value={updateForm.bodyFat}
                              onChange={(e) => setUpdateForm({...updateForm, bodyFat: e.target.value})}
                              placeholder="--"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Workout Adherence ({updateForm.workoutCompliance}%)</label>
                        <input 
                           type="range" 
                           min="0" max="100" 
                           value={updateForm.workoutCompliance} 
                           onChange={(e) => setUpdateForm({...updateForm, workoutCompliance: e.target.value})}
                           className="w-full accent-[#CDE7FE]"
                        />
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Trainer Remarks</label>
                        <textarea 
                           rows="2"
                           className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 resize-none text-sm"
                           placeholder="Enter observations..."
                           value={updateForm.remarks}
                           onChange={(e) => setUpdateForm({...updateForm, remarks: e.target.value})}
                        ></textarea>
                     </div>

                     <button type="submit" className="w-full py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold text-sm hover:bg-green-300 transition-colors shadow-sm">
                        Save Updates
                     </button>
                  </form>
               </div>

            </div>

            {/* CENTER/RIGHT: CHARTS & STATS */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* Charts Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                     <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-5 bg-[#D9F17F] rounded-full"></span> Weight Trend
                     </h3>
                     <div className="h-48 relative w-full">
                        <Line data={lineChartData} options={chartOptions} />
                     </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                     <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-5 bg-[#CDE7FE] rounded-full"></span> Adherence History
                     </h3>
                     <div className="h-48 relative w-full">
                        <Bar data={barChartData} options={chartOptions} />
                     </div>
                  </div>
               </div>

               {/* Session & Attendance Summary */}
               <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-bold text-gray-900">Session Summary</h3>
                     {selectedMember.data.attendance < 70 && (
                        <button onClick={handleAlert} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                           <i className="fa-solid fa-bell mr-1"></i> Flag Low Attendance
                        </button>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                     <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-2xl font-black text-gray-800">{selectedMember.data.sessions.total}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Assigned</p>
                     </div>
                     <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <p className="text-2xl font-black text-green-600">{selectedMember.data.sessions.attended}</p>
                        <p className="text-[10px] text-green-600 uppercase font-bold">Attended</p>
                     </div>
                     <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-2xl font-black text-red-500">{selectedMember.data.sessions.missed}</p>
                        <p className="text-[10px] text-red-500 uppercase font-bold">Missed</p>
                     </div>
                  </div>

                  <div className="mt-6">
                     <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                        <span>Overall Attendance</span>
                        <span>{selectedMember.data.attendance}%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                           className={`h-full rounded-full ${selectedMember.data.attendance >= 80 ? 'bg-[#D9F17F]' : selectedMember.data.attendance >= 60 ? 'bg-[#FEEF75]' : 'bg-red-400'}`} 
                           style={{ width: `${selectedMember.data.attendance}%` }}
                        ></div>
                     </div>
                  </div>
               </div>
               
               {/* Previous Remarks */}
               <div className="bg-[#fffbeb] rounded-[2.5rem] p-6 border border-[#FEEF75]">
                  <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                     <i className="fa-regular fa-clipboard"></i> Latest Note
                  </h3>
                  <p className="text-sm text-yellow-800 italic">"{selectedMember.data.remarks}"</p>
               </div>

            </div>
         </div>
      ) : (
         <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <i className="fa-solid fa-chart-line text-4xl text-gray-300 mb-3 block"></i>
            <p className="text-gray-400">Select a member to view their progress dashboard.</p>
         </div>
      )}

    </div>
  );
};

export default MonitorProgress;