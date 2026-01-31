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
import { useGlobalContext } from '../../context/GlobalContext';

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
    const {BACKEND_URL}=useGlobalContext();
  // --- STATE ---
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberData, setMemberData] = useState(null); // Stores detailed progress
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

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

  // --- FETCH MEMBERS LIST ---
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/trainers/${user._id}/members/all`, {
             headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (!res.ok) throw new Error("Failed to load members");
        
        const data = await res.json();
        setAssignedMembers(data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load assigned members");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchMembers();
  }, []);

  // --- FETCH MEMBER PROGRESS DETAILS ---
  useEffect(() => {
      if (selectedMember) {
          const fetchProgress = async () => {
              try {
                  setDataLoading(true);
                  const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}`, {
                      headers: { Authorization: `Bearer ${user.token}` }
                  });
                  
                  if (!res.ok) throw new Error("Failed to load progress");
                  
                  const data = await res.json();
                  setMemberData(data); // { workout, diet, progress, weightHistory }
              } catch (err) {
                  console.error(err);
                  toast.error("Failed to load member progress");
              } finally {
                  setDataLoading(false);
              }
          };
          fetchProgress();
      }
  }, [selectedMember]);

  // --- DERIVED DATA FOR CHARTS ---
  const getWeightChartData = () => {
      if (!memberData?.weightHistory) return { labels: [], data: [] };
      
      const history = [...memberData.weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
      const labels = history.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const data = history.map(h => h.weight);
      
      return { labels, data };
  };

  const getAdherenceData = () => {
      if (!memberData?.progress) return { workout: 0, diet: 0 };
      
      const total = memberData.progress.length || 1;
      const workoutCount = memberData.progress.filter(p => p.workoutCompleted).length;
      const dietCount = memberData.progress.filter(p => p.dietCompleted).length;
      
      return {
          workout: Math.round((workoutCount / total) * 100),
          diet: Math.round((dietCount / total) * 100)
      };
  };

  const weightInfo = getWeightChartData();
  const adherence = getAdherenceData();

  const weightChartData = {
    labels: weightInfo.labels.length > 0 ? weightInfo.labels : ["Start", "Current"],
    datasets: [
      {
        label: "Weight (kg)",
        data: weightInfo.data.length > 0 ? weightInfo.data : [0, 0],
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

  const adherenceChartData = {
    labels: ["Workout", "Diet"],
    datasets: [
      {
        label: "Adherence %",
        data: [adherence.workout, adherence.diet],
        backgroundColor: ["#1f2937", "#4ade80"], // Dark Gray, Green
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  // Filter members
  const filteredMembers = assignedMembers.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col md:flex-row gap-8">
         
         {/* Sidebar: Member List */}
         <div className="w-full md:w-1/4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-[85vh] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking List</h2>
            
            <div className="relative mb-4">
               <input 
                 type="text" 
                 placeholder="Search member..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#CDE7FE] transition-all"
               />
               <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {loading ? <p className="text-center text-gray-400 text-sm">Loading...</p> : filteredMembers.map(m => (
                  <div 
                     key={m._id} 
                     onClick={() => setSelectedMember(m)}
                     className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${selectedMember?._id === m._id ? 'bg-[#D9F17F] border-[#D9F17F] shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                     <div>
                        <h3 className={`font-bold text-sm ${selectedMember?._id === m._id ? 'text-green-900' : 'text-gray-800'}`}>{m.name}</h3>
                        <p className={`text-xs ${selectedMember?._id === m._id ? 'text-green-800' : 'text-gray-400'}`}>{m.plan}</p>
                     </div>
                     <i className={`fa-solid fa-chevron-right text-xs ${selectedMember?._id === m._id ? 'text-green-800' : 'text-gray-300'}`}></i>
                  </div>
               ))}
               {filteredMembers.length === 0 && !loading && (
                   <p className="text-center text-gray-400 text-xs mt-4">No members found.</p>
               )}
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[85vh]">
            
            {selectedMember ? (
               dataLoading ? (
                   <div className="flex h-full items-center justify-center text-gray-400">
                       <i className="fa-solid fa-circle-notch fa-spin text-3xl mr-3"></i> Loading data...
                   </div>
               ) : (
               <>
                  <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                     <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedMember.name}</h2>
                        <div className="flex gap-3 text-sm text-gray-500">
                           <span className="flex items-center gap-1"><i className="fa-solid fa-bullseye text-red-500"></i> {selectedMember.goal || "General Fitness"}</span>
                           <span className="flex items-center gap-1"><i className="fa-regular fa-clock text-blue-500"></i> Joined: {selectedMember.assignedDate}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {selectedMember.status}
                        </span>
                     </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Current Weight</p>
                          <p className="text-xl font-black text-gray-900">{weightInfo.data.length > 0 ? weightInfo.data[weightInfo.data.length-1] : "-"} <span className="text-sm font-bold text-gray-400">kg</span></p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Sessions Done</p>
                          <p className="text-xl font-black text-gray-900">{memberData?.progress?.filter(p => p.workoutCompleted).length || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Avg Adherence</p>
                          <p className={`text-xl font-black ${adherence.workout >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {Math.round((adherence.workout + adherence.diet) / 2)}%
                          </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Last Activity</p>
                          <p className="text-sm font-bold text-gray-800 pt-1">
                              {memberData?.progress?.[memberData.progress.length-1]?.date || "None"}
                          </p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Weight Chart */}
                      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Weight Progression</h3>
                          <div className="h-48 w-full">
                              <Line 
                                  data={weightChartData} 
                                  options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: { legend: { display: false } },
                                      scales: { y: { grid: { display: false } }, x: { grid: { display: false } } }
                                  }} 
                              />
                          </div>
                      </div>

                      {/* Adherence Chart */}
                      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Adherence</h3>
                          <div className="h-48 w-full">
                              <Bar 
                                  data={adherenceChartData} 
                                  options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: { legend: { display: false } },
                                      scales: { y: { beginAtZero: true, max: 100 }, x: { grid: { display: false } } }
                                  }} 
                              />
                          </div>
                      </div>
                  </div>
               </>
               )
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <i className="fa-solid fa-chart-pie text-4xl text-gray-200"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Select a Member</h3>
                  <p className="text-sm text-gray-400 max-w-xs text-center">
                      Choose a client from the list to view their detailed progress, weight history, and adherence stats.
                  </p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default MonitorProgress;