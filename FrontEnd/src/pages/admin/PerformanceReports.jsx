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
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
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
  Filler
);

// --- REUSABLE STYLISH DROPDOWN ---
const StylishDropdown = ({ options, selected, onSelect, iconClass }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find label for selected value
  const selectedLabel = options.find(opt => opt.value === selected)?.label || selected;

  return (
    <div className="relative z-20">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border outline-none
          ${isOpen 
            ? 'bg-[#CDE7FE] border-blue-300 text-blue-900 shadow-sm ring-2 ring-blue-100' 
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        {iconClass && <i className={`${iconClass} text-gray-400 mr-1`}></i>}
        <span>{selectedLabel}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1.5 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between group
                    ${selected === option.value 
                      ? 'bg-[#FEEF75] text-yellow-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {selected === option.value && (
                    <i className="fa-solid fa-check text-yellow-800 text-[10px]"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PerformanceReport = () => {
  // --- MOCK DATA ---
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Santosh Hadiya",
      plan: "Yearly Elite",
      trainer: "Raj Mehta",
      joinedOn: "2024-01-15",
      goal: "Weight Loss",
      initialWeight: 90,
      currentWeight: 82,
      targetWeight: 75,
      height: 1.75, // meters
      sessionsAttended: 48,
      totalSessions: 60,
      rating: "Excellent", 
      alerts: [],
      history: {
        dates: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        weight: [90, 89, 88.5, 87, 85, 82],
        attendance: [3, 4, 5, 4, 5, 5], 
        completion: [80, 85, 90, 88, 95, 98], 
      },
      trainerComparison: {
        current: { name: "Raj Mehta", progress: "8kg lost in 2 months" },
        previous: { name: "Sneha Rathi", progress: "2kg lost in 3 months" }
      }
    },
    {
      id: 2,
      name: "Riya Patel",
      plan: "Quarterly Pro",
      trainer: "Vikram Singh",
      joinedOn: "2024-03-10",
      goal: "Muscle Gain",
      initialWeight: 55,
      currentWeight: 56,
      targetWeight: 60,
      height: 1.65,
      sessionsAttended: 12,
      totalSessions: 40,
      rating: "Average",
      alerts: ["Low Attendance", "Missed Goal Targets"],
      history: {
        dates: ["Week 1", "Week 2", "Week 3", "Week 4"],
        weight: [55, 55.2, 55.5, 56],
        attendance: [2, 1, 3, 1],
        completion: [60, 50, 70, 40],
      },
      trainerComparison: null
    }
  ]);

  // --- STATE ---
  const [selectedMemberId, setSelectedMemberId] = useState(1);
  const [dateRange, setDateRange] = useState("30 Days"); 
  const selectedMember = members.find(m => m.id === parseInt(selectedMemberId));

  // --- STYLE INJECTION ---
  useEffect(() => {
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);
    
    // Inject Font Awesome
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    if (selectedMember && selectedMember.alerts.length > 0) {
      toast.warn(`Alert: ${selectedMember.name} has ${selectedMember.alerts.length} performance warnings.`);
    }

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, [selectedMemberId]);

  // --- HELPER FUNCTIONS ---
  const calculateBMI = (weight, height) => (weight / (height * height)).toFixed(1);
  
  const getProgressPercentage = (initial, current, target) => {
    const totalChange = Math.abs(initial - target);
    const currentChange = Math.abs(initial - current);
    return Math.min(Math.round((currentChange / totalChange) * 100), 100);
  };

  // --- EXPORT FUNCTIONALITY ---
  const handleExport = () => {
    if (!selectedMember) return;

    // Define CSV content
    const csvRows = [];
    
    // Header Info
    csvRows.push(["Performance Report", selectedMember.name]);
    csvRows.push(["Date Generated", new Date().toLocaleDateString()]);
    csvRows.push([]); // Spacer
    
    // Profile Data
    csvRows.push(["Profile Details"]);
    csvRows.push(["Plan", selectedMember.plan]);
    csvRows.push(["Trainer", selectedMember.trainer]);
    csvRows.push(["Joined", selectedMember.joinedOn]);
    csvRows.push(["Goal", selectedMember.goal]);
    csvRows.push(["Rating", selectedMember.rating]);
    csvRows.push([]); 

    // Stats
    csvRows.push(["Current Statistics"]);
    csvRows.push(["Weight", `${selectedMember.currentWeight} kg`]);
    csvRows.push(["BMI", calculateBMI(selectedMember.currentWeight, selectedMember.height)]);
    csvRows.push(["Sessions", `${selectedMember.sessionsAttended}/${selectedMember.totalSessions}`]);
    csvRows.push([]);

    // History Data Table
    csvRows.push(["History Log"]);
    csvRows.push(["Period", "Weight (kg)", "Attendance (Days)", "Completion (%)"]);
    
    selectedMember.history.dates.forEach((date, index) => {
      csvRows.push([
        date,
        selectedMember.history.weight[index],
        selectedMember.history.attendance[index],
        selectedMember.history.completion[index]
      ]);
    });

    // Convert to CSV string
    const csvString = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger Download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedMember.name.replace(" ", "_")}_Performance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Report downloaded for ${selectedMember.name}`);
  };

  // --- CHART CONFIGURATIONS ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
    scales: { 
      x: { grid: { display: false } },
      y: { grid: { borderDash: [4, 4], color: '#f0f0f0' } }
    }
  };

  // 1. Weight Progress (Line)
  const weightData = {
    labels: selectedMember?.history.dates,
    datasets: [{
      label: 'Weight (kg)',
      data: selectedMember?.history.weight,
      borderColor: '#D9F17F', // Palette Lime
      backgroundColor: 'rgba(217, 241, 127, 0.4)', // Translucent Lime
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#D9F17F',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  // 2. Workout Completion (Bar)
  const completionData = {
    labels: selectedMember?.history.dates,
    datasets: [{
      label: 'Workout Completion (%)',
      data: selectedMember?.history.completion,
      backgroundColor: '#CDE7FE', // Palette Light Blue
      borderRadius: 8,
      hoverBackgroundColor: '#a8d4ff'
    }]
  };

  // 3. Attendance vs Progress Correlation
  const correlationData = {
    labels: selectedMember?.history.dates,
    datasets: [
      {
        type: 'line',
        label: 'Attendance (Days/Week)',
        data: selectedMember?.history.attendance,
        borderColor: '#70a6d6', // Darker Blue
        borderWidth: 2,
        yAxisID: 'y',
        tension: 0.3,
        pointBackgroundColor: '#70a6d6'
      },
      {
        type: 'bar',
        label: 'Progress Impact Factor', 
        // Logic: Calculate a "Change Factor" based on weight diff from prev week
        data: selectedMember?.history.weight.map((w, i) => i === 0 ? 0.5 : Math.abs(w - selectedMember.history.weight[i-1]) * 2), 
        backgroundColor: '#FEEF75', // Palette Yellow
        yAxisID: 'y1',
        borderRadius: 4
      }
    ]
  };

  const correlationOptions = {
    ...commonOptions,
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Attendance' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Impact Score' } },
    }
  };

  // Dropdown Options Map
  const memberOptions = members.map(m => ({ value: m.id, label: m.name }));
  const dateOptions = [
    { value: "7 Days", label: "Last 7 Days" },
    { value: "30 Days", label: "Last 30 Days" },
    { value: "All Time", label: "All Time" }
  ];

  return (
    <div className="w-full bg-white  font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
       
        
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200">
          
          {/* Custom Stylish Dropdowns */}
          <StylishDropdown 
            options={memberOptions} 
            selected={selectedMemberId} 
            onSelect={(val) => setSelectedMemberId(parseInt(val))}
            iconClass="fa-regular fa-user"
          />

          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

          <StylishDropdown 
            options={dateOptions} 
            selected={dateRange} 
            onSelect={setDateRange}
            iconClass="fa-regular fa-calendar"
          />

          <button 
            onClick={handleExport}
            className="ml-2 px-5 py-2.5 bg-[#FEEF75] text-yellow-900 rounded-full text-xs font-bold shadow-sm hover:bg-yellow-300 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      {selectedMember && (
        <>
          {/* SUMMARY CARD */}
          <div className="bg-gradient-to-r from-[#fcfdfd] to-[#f4fbf7] p-6 rounded-3xl mb-8 relative overflow-hidden">
            {/* Decorative BG Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <i className="fa-solid fa-chart-line text-8xl text-green-700"></i>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
              
              {/* Profile Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#CDE7FE] rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm">
                  {selectedMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500">
                        {selectedMember.plan}
                     </span>
                     <span className="text-xs text-gray-400">Since: {selectedMember.joinedOn}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Trainer: <span className="font-semibold text-gray-800">{selectedMember.trainer}</span></p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto text-center md:text-left bg-white/60 p-4 rounded-2xl border border-gray-100 backdrop-blur-sm">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Weight</p>
                  <p className="text-xl font-bold text-gray-900">{selectedMember.currentWeight} <span className="text-xs font-normal text-gray-400">kg</span></p>
                  <p className={`text-[10px] font-bold ${selectedMember.currentWeight < selectedMember.initialWeight ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedMember.currentWeight < selectedMember.initialWeight ? '▼' : '▲'} {Math.abs(selectedMember.currentWeight - selectedMember.initialWeight)} kg
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">BMI</p>
                  <p className="text-xl font-bold text-gray-900">{calculateBMI(selectedMember.currentWeight, selectedMember.height)}</p>
                  <p className="text-[10px] text-gray-400">Normal: 18-25</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Attendance</p>
                  <p className="text-xl font-bold text-gray-900">{Math.round((selectedMember.sessionsAttended/selectedMember.totalSessions)*100)}<span className="text-sm text-gray-400">%</span></p>
                  <p className="text-[10px] text-blue-500 font-medium">{selectedMember.sessionsAttended} Sessions</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Rating</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedMember.rating === 'Excellent' ? 'bg-[#D9F17F] text-white' :
                    selectedMember.rating === 'Good' ? 'bg-[#CDE7FE] text-blue-900' : 
                    'bg-[#FEEF75] text-white'
                  }`}>
                    {selectedMember.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Progress Bar */}
            <div className="mt-6 bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Goal: {selectedMember.goal}</span>
                  <div className="flex items-baseline gap-1">
                     <span className="text-lg font-bold text-gray-800">{selectedMember.currentWeight}kg</span>
                     <span className="text-xs text-gray-400">/ {selectedMember.targetWeight}kg Target</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#D9F17F]  px-2 py-1 rounded">
                   {getProgressPercentage(selectedMember.initialWeight, selectedMember.currentWeight, selectedMember.targetWeight)}% Achieved
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#D9F17F] h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${getProgressPercentage(selectedMember.initialWeight, selectedMember.currentWeight, selectedMember.targetWeight)}%` }}
                ></div>
              </div>
            </div>

            {/* Alerts Section */}
            {selectedMember.alerts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedMember.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRAPHS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* 1. Weight Trend */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-[#D9F17F]/30 flex items-center justify-center text-green-700">
                      <i className="fa-solid fa-scale-unbalanced text-sm"></i>
                   </div>
                   Weight Progress
                 </h3>
              </div>
              <div className="h-64">
                <Line data={weightData} options={commonOptions} />
              </div>
            </div>

            {/* 2. Workout Completion */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-700">
                   <i className="fa-solid fa-list-check text-sm"></i>
                </div>
                Workout Consistency
              </h3>
              <div className="h-64">
                <Bar data={completionData} options={commonOptions} />
              </div>
            </div>

            {/* 3. Attendance vs Results (Advanced) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-800">
                   <i className="fa-solid fa-chart-line text-sm"></i>
                </div>
                Attendance vs. Progress Correlation
              </h3>
              <div className="h-64">
                <Line data={correlationData} options={correlationOptions} />
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center italic">
                 <i className="fa-solid fa-circle-info mr-1"></i>
                 Correlation Analysis: Higher attendance weeks generally correlate with higher impact scores (weight change).
              </p>
            </div>
          </div>

          {/* TRAINER COMPARISON (Bonus) */}
          {selectedMember.trainerComparison && (
            <div className="bg-[#fcfdfd] border border-gray-200 rounded-3xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-user-group text-gray-400"></i> Trainer Effectiveness Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Current Trainer */}
                <div className="bg-white p-5 rounded-2xl border border-[#CDE7FE] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#CDE7FE] rounded-bl-full opacity-20"></div>
                  <p className="text-[10px] text-gray-400 uppercase mb-2 font-bold tracking-wider">Current Trainer</p>
                  <div className="flex justify-between items-end">
                     <p className="font-bold text-blue-900 text-lg">{selectedMember.trainerComparison.current.name}</p>
                     <div className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                       {selectedMember.trainerComparison.current.progress}
                     </div>
                  </div>
                </div>

                {/* Previous Trainer */}
                <div className="bg-white/50 p-5 rounded-2xl border border-gray-200 border-dashed">
                  <p className="text-[10px] text-gray-400 uppercase mb-2 font-bold tracking-wider">Previous Trainer</p>
                  <div className="flex justify-between items-end">
                     <p className="font-bold text-gray-600 text-lg">{selectedMember.trainerComparison.previous.name}</p>
                     <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                       {selectedMember.trainerComparison.previous.progress}
                     </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceReport;