import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SessionReports = () => {
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
  const [sessions, setSessions] = useState([
    {
      id: 101,
      member: "Riya Patel",
      type: "Personal Training",
      date: "2024-10-26",
      time: "07:00 AM",
      status: "Scheduled",
      duration: "60 mins"
    },
    {
      id: 102,
      member: "Amit Sharma",
      type: "Group Class",
      date: "2024-10-25",
      time: "06:00 PM",
      status: "Completed",
      duration: "45 mins",
      report: {
        attendance: "Present",
        intensity: "High",
        calories: 450,
        rating: "Excellent",
        notes: "Great energy. Struggled a bit with lunges."
      }
    },
    {
      id: 103,
      member: "Priya Shah",
      type: "Yoga",
      date: "2024-10-24",
      time: "08:00 AM",
      status: "Pending Report",
      duration: "60 mins"
    }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("upcoming"); // 'upcoming', 'history'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    attendance: "Present",
    intensity: "Medium",
    calories: "",
    rating: "Good",
    notes: ""
  });

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Scheduled": return "bg-[#CDE7FE] text-blue-900 border-blue-200";
      case "Pending Report": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // --- ACTIONS ---
  const handleOpenReport = (session) => {
    setSelectedSession(session);
    setReportForm({
      attendance: "Present",
      intensity: "Medium",
      calories: "",
      rating: "Good",
      notes: ""
    });
    setShowReportModal(true);
  };

  const handleSaveReport = (e) => {
    e.preventDefault();
    if (!reportForm.notes) {
      toast.warn("Please add some session notes.");
      return;
    }

    const updatedSession = {
      ...selectedSession,
      status: "Completed",
      report: { ...reportForm }
    };

    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    toast.success("Session Report Saved & Synced.");
    setShowReportModal(false);
  };

  const handleDownloadPDF = (session) => {
    toast.info(`Downloading Report for ${session.member}...`);
  };

  // --- FILTERING ---
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.member.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || s.type === filterType;
    
    // View logic
    if (viewState === 'upcoming') return matchesSearch && matchesType && (s.status === 'Scheduled' || s.status === 'Pending Report');
    return matchesSearch && matchesType && s.status === 'Completed';
  });

  // --- CHART DATA (Weekly Stats) ---
  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Sessions Conducted",
      data: [3, 5, 4, 6, 5, 8, 2],
      backgroundColor: "#CDE7FE",
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { display: false } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
               <h1 className="text-3xl font-black text-gray-900">Session Reports</h1>
               <p className="text-sm text-gray-500 mt-1">Track attendance, outcomes, and performance metrics.</p>
            </div>
            
            <div className="flex gap-2 mt-6 bg-gray-50 p-1.5 rounded-2xl w-fit">
               <button 
                 onClick={() => setViewState("upcoming")}
                 className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${viewState === 'upcoming' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Active Sessions
               </button>
               <button 
                 onClick={() => setViewState("history")}
                 className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${viewState === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 History & Logs
               </button>
            </div>
         </div>

         {/* Mini Analytics */}
         <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Weekly Overview</h3>
            <div className="flex-1 min-h-[100px]">
               <Bar data={weeklyData} options={chartOptions} />
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
               <span>Total: 33 Sessions</span>
               <span className="text-green-600">95% Attendance</span>
            </div>
         </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 bg-white p-3 rounded-2xl border border-gray-100 items-center shadow-sm">
         <div className="relative flex-grow md:max-w-xs">
            <input
               type="text"
               placeholder="Search member..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
         </div>
         
         <div className="flex gap-2 overflow-x-auto">
            {['All', 'Personal Training', 'Group Class', 'Yoga'].map(type => (
               <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${filterType === type ? 'bg-[#CDE7FE] text-blue-900 border-blue-200' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}
               >
                  {type}
               </button>
            ))}
         </div>
      </div>

      {/* LIST VIEW */}
      <div className="grid grid-cols-1 gap-4">
         {filteredSessions.map(session => (
            <div key={session.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 justify-between items-center group">
               
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${session.status === 'Completed' ? 'bg-[#D9F17F] text-green-900' : 'bg-blue-50 text-blue-600'}`}>
                     {session.member[0]}
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900">{session.member}</h3>
                     <p className="text-xs text-gray-500 flex items-center gap-2">
                        {session.type} <span className="w-1 h-1 bg-gray-300 rounded-full"></span> {session.duration}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                     <p className="text-sm font-bold text-gray-800">{session.date}</p>
                     <p className="text-xs text-gray-400">{session.time}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(session.status)}`}>
                     {session.status}
                  </span>

                  {viewState === 'upcoming' ? (
                     <button 
                        onClick={() => handleOpenReport(session)}
                        className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-[#FEEF75] hover:text-yellow-900 transition-colors shadow-lg cursor-pointer"
                        title="Create Report"
                     >
                        <i className="fa-solid fa-pen-to-square"></i>
                     </button>
                  ) : (
                     <button 
                        onClick={() => handleDownloadPDF(session)}
                        className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                        title="Download PDF"
                     >
                        <i className="fa-solid fa-file-pdf"></i>
                     </button>
                  )}
               </div>

            </div>
         ))}
         {filteredSessions.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
               <p>No sessions found.</p>
            </div>
         )}
      </div>

      {/* --- REPORT MODAL --- */}
      {showReportModal && selectedSession && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                     <h3 className="font-bold text-gray-900">Session Report</h3>
                     <p className="text-xs text-gray-500">{selectedSession.member} • {selectedSession.date}</p>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSaveReport} className="p-6 space-y-5">
                  
                  {/* Attendance */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <span className="text-sm font-bold text-gray-700">Member Attendance</span>
                     <div className="flex gap-2">
                        {['Present', 'Absent', 'Late'].map(status => (
                           <button
                              key={status}
                              type="button"
                              onClick={() => setReportForm({...reportForm, attendance: status})}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reportForm.attendance === status ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-500 border border-gray-200'}`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Intensity</label>
                        <select 
                           value={reportForm.intensity}
                           onChange={(e) => setReportForm({...reportForm, intensity: e.target.value})}
                           className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
                        >
                           <option>Low</option>
                           <option>Medium</option>
                           <option>High</option>
                           <option>Extreme</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Calories Burned</label>
                        <input 
                           type="number" 
                           placeholder="e.g. 450"
                           value={reportForm.calories}
                           onChange={(e) => setReportForm({...reportForm, calories: e.target.value})}
                           className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
                        />
                     </div>
                  </div>

                  {/* Rating */}
                  <div>
                     <label className="block text-xs font-bold text-gray-400 mb-1">Performance Rating</label>
                     <div className="flex gap-2">
                        {['Poor', 'Average', 'Good', 'Excellent'].map(rate => (
                           <button
                              key={rate}
                              type="button"
                              onClick={() => setReportForm({...reportForm, rating: rate})}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${reportForm.rating === rate ? 'bg-[#FEEF75] text-yellow-900 border-yellow-300' : 'bg-white text-gray-500 border-gray-200'}`}
                           >
                              {rate}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Remarks */}
                  <div>
                     <label className="block text-xs font-bold text-gray-400 mb-1">Trainer Remarks</label>
                     <textarea 
                        rows="3"
                        placeholder="Session outcome, strengths, weaknesses..."
                        value={reportForm.notes}
                        onChange={(e) => setReportForm({...reportForm, notes: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] resize-none"
                     ></textarea>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold hover:bg-green-300 transition-colors shadow-lg shadow-green-100 cursor-pointer">
                     Submit Report
                  </button>

               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default SessionReports;