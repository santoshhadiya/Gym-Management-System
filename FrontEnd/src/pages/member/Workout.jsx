import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const Workout = () => {
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeWeek, setActiveWeek] = useState(1);
  const [workoutWeeks, setWorkoutWeeks] = useState([]);
  const [dietWeeks, setDietWeeks] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [weightData, setWeightData] = useState([]); // Weight History
  const [currentWeight, setCurrentWeight] = useState(""); // Input for new weight
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("workout"); // 'workout', 'diet', 'weight'
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // Style Injection
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

  // Fetch Data
  const fetchPlan = async () => {
    try {
      setLoading(true);
      const token = user?.token;

      const res = await fetch(`${BACKEND_URL}/api/workout-diet/my/plan`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load plan");
      
      const data = await res.json();
      setWorkoutWeeks(data.workout?.weeks || []);
      setDietWeeks(data.diet?.weeks || []);
      setProgressData(data.progress || []);
      setWeightData(data.weightHistory || []);
      
      const updatedDate = data.workout?.lastUpdated || data.diet?.lastUpdated;
      setLastUpdated(updatedDate ? new Date(updatedDate).toLocaleDateString() : "Never");

    } catch (err) {
      console.error(err);
      toast.error("Could not load your plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  // --- DATE & PROGRESS LOGIC ---
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeksList = [1, 2, 3, 4];

  const getSelectedDate = () => {
      const today = new Date();
      const currentDayOfWeek = today.getDay(); 
      const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      const currentWeekMonday = new Date(today);
      currentWeekMonday.setDate(today.getDate() + diffToMonday);
      
      const dayIndex = days.indexOf(activeDay); 
      const weekOffsetDays = (activeWeek - 1) * 7;
      
      const targetDate = new Date(currentWeekMonday);
      targetDate.setDate(currentWeekMonday.getDate() + dayIndex + weekOffsetDays);
      
      return targetDate.toISOString().split('T')[0];
  };

  const getDisplayDate = () => {
      const dateStr = getSelectedDate();
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Actions
  const handleMarkProgress = async (status) => { 
      try {
          const selectedDate = getSelectedDate();
          
          const payload = {
              date: selectedDate, 
              weekNumber: activeWeek,
              day: activeDay,
              type: activeTab,
              status: status
          };

          // Optimistic Update
          const updatedProgress = [...progressData];
          const existingIndex = updatedProgress.findIndex(p => p.date === selectedDate);
          
          if (existingIndex > -1) {
              if (activeTab === 'workout') updatedProgress[existingIndex].workoutCompleted = status;
              if (activeTab === 'diet') updatedProgress[existingIndex].dietCompleted = status;
          } else {
              updatedProgress.push({
                  date: selectedDate,
                  weekNumber: activeWeek,
                  day: activeDay,
                  workoutCompleted: activeTab === 'workout' ? status : false,
                  dietCompleted: activeTab === 'diet' ? status : false
              });
          }
          setProgressData(updatedProgress);

          const res = await fetch(`${BACKEND_URL}/api/workout-diet/progress`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
              body: JSON.stringify(payload)
          });
          
          if (!res.ok) throw new Error("Update failed");
          
          toast.success(`${activeTab === 'workout' ? 'Workout' : 'Diet'} marked for ${getDisplayDate()}`);

      } catch (err) {
          toast.error("Failed to update progress");
          fetchPlan(); 
      }
  };

  const handleWeightSubmit = async () => {
      if (!currentWeight || isNaN(currentWeight)) {
          toast.warn("Please enter a valid weight");
          return;
      }

      try {
          const selectedDate = getSelectedDate();
          const payload = {
              date: selectedDate,
              weekNumber: activeWeek,
              weight: Number(currentWeight)
          };

          const res = await fetch(`${BACKEND_URL}/api/workout-diet/weight`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
              body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error("Weight update failed");

          toast.success("Weight recorded successfully!");
          setCurrentWeight("");
          fetchPlan(); // Refresh weight history

      } catch (err) {
          toast.error("Failed to save weight");
      }
  };

  const isCompleted = () => {
      const selectedDate = getSelectedDate();
      const entry = progressData.find(p => p.date === selectedDate);
      
      if (!entry) return null; 
      
      if (activeTab === 'workout') return entry.workoutCompleted;
      if (activeTab === 'diet') return entry.dietCompleted;
      return null;
  };

  // Helpers
  const getCurrentWorkout = () => {
      const week = workoutWeeks.find(w => w.weekNumber === activeWeek);
      const day = week?.days.find(d => d.day === activeDay);
      return { 
          plan: day?.plan || "Rest Day / No Workout Assigned",
          calorieTarget: day?.calorieTarget || 0
      };
  };

  const getCurrentDiet = () => {
      const week = dietWeeks.find(w => w.weekNumber === activeWeek);
      const day = week?.days.find(d => d.day === activeDay);
      return day || null;
  };

  const dietDay = getCurrentDiet();
  const workoutDay = getCurrentWorkout();

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Plan...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h1 className="text-3xl font-black text-gray-900">My Fitness Plan</h1>
            <p className="text-gray-500 mt-1">Last Updated: <span className="font-bold">{lastUpdated}</span></p>
         </div>
         
         <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
               onClick={() => setActiveTab('workout')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'workout' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
               Workout
            </button>
            <button 
               onClick={() => setActiveTab('diet')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'diet' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
            >
               Diet
            </button>
            {activeWeek === 4 && (
                <button 
                onClick={() => setActiveTab('weight')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'weight' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
                >
                Tracker
                </button>
            )}
         </div>
      </div>

      {/* Week & Day Selector */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex gap-4 items-center mb-4 border-b border-gray-50 pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase">Week</span>
              {weeksList.map(wk => (
                  <button
                    key={wk}
                    onClick={() => { setActiveWeek(wk); if(wk!==4 && activeTab==='weight') setActiveTab('workout'); }}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${activeWeek === wk ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                      {wk}
                  </button>
              ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
             {days.map(day => {
                const today = new Date();
                const currentDayOfWeek = today.getDay(); 
                const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
                const currentWeekMonday = new Date(today);
                currentWeekMonday.setDate(today.getDate() + diffToMonday);
                
                const dayIndex = days.indexOf(day);
                const weekOffsetDays = (activeWeek - 1) * 7;
                const targetDate = new Date(currentWeekMonday);
                targetDate.setDate(currentWeekMonday.getDate() + dayIndex + weekOffsetDays);
                const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const dateKey = targetDate.toISOString().split('T')[0];

                const entry = progressData.find(p => p.date === dateKey);
                let dayStatus = null;
                if (entry) {
                    if (activeTab === 'workout') dayStatus = entry.workoutCompleted;
                    if (activeTab === 'diet') dayStatus = entry.dietCompleted;
                }

                return (
                    <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center min-w-[80px] relative ${activeDay === day ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span>{day.slice(0,3)}</span>
                        <span className={`text-[10px] font-normal ${activeDay === day ? 'text-gray-400' : 'text-gray-400'}`}>{dateStr}</span>
                        
                        {(activeTab === 'workout' || activeTab === 'diet') && (
                            <>
                                {dayStatus === true && <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>}
                                {dayStatus === false && <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></div>}
                            </>
                        )}
                    </button>
                );
             })}
          </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Main Panel */}
         <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-[2.5rem] p-8 border shadow-sm min-h-[400px] transition-colors ${isCompleted() === true ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
               
               {activeTab === 'weight' ? (
                   <div>
                       <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-purple-50 text-purple-600">
                                    <i className="fa-solid fa-weight-scale"></i>
                                </span>
                                Weight Tracker
                            </h2>
                       </div>
                       
                       <div className="bg-purple-50 p-6 rounded-2xl mb-8 text-center border border-purple-100">
                           <p className="text-sm text-purple-800 font-bold mb-3 uppercase tracking-wider">Log Weight for {getDisplayDate()}</p>
                           <div className="flex items-center justify-center gap-2">
                               <input 
                                   type="number" 
                                   placeholder="0.0" 
                                   className="text-4xl font-black text-center bg-white w-32 py-2 rounded-xl border border-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-200 text-purple-900 placeholder-purple-200"
                                   value={currentWeight}
                                   onChange={(e) => setCurrentWeight(e.target.value)}
                               />
                               <span className="text-xl font-bold text-purple-400">kg</span>
                           </div>
                           <button onClick={handleWeightSubmit} className="mt-4 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                               Save Entry
                           </button>
                       </div>

                       <div className="space-y-3">
                           <h3 className="font-bold text-gray-900 text-sm mb-2">History</h3>
                           {weightData.map(log => (
                               <div key={log._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                   <span className="text-sm font-medium text-gray-600">{new Date(log.date).toLocaleDateString()} (Week {log.weekNumber})</span>
                                   <span className="text-sm font-bold text-gray-900">{log.weight} kg</span>
                               </div>
                           ))}
                           {weightData.length === 0 && <p className="text-gray-400 text-sm text-center">No weight logs yet.</p>}
                       </div>
                   </div>
               ) : (
                   <>
                       <div className="flex justify-between items-start mb-6">
                           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                              <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${activeTab === 'workout' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                 <i className={`fa-solid ${activeTab === 'workout' ? 'fa-dumbbell' : 'fa-carrot'}`}></i>
                              </span>
                              {activeDay}'s Plan
                           </h2>
                           {isCompleted() !== null && (
                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted() ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                   {isCompleted() ? "Completed" : "Missed"}
                               </span>
                           )}
                       </div>

                       {activeTab === 'workout' ? (
                          <>
                              {/* Calorie Target Display */}
                              {workoutDay.calorieTarget > 0 && (
                                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">
                                      <i className="fa-solid fa-fire"></i> Target: {workoutDay.calorieTarget} kcal
                                  </div>
                              )}
                              
                              <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                 {workoutDay.plan}
                              </div>
                          </>
                       ) : (
                          <div className="space-y-6">
                             {/* Nutrition Stats */}
                             <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-orange-50 rounded-2xl">
                                    <p className="text-xs font-bold text-orange-400 uppercase">Cals</p>
                                    <p className="font-black text-orange-900">{dietDay?.nutrition?.calories || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-2xl">
                                    <p className="text-xs font-bold text-blue-400 uppercase">Prot</p>
                                    <p className="font-black text-blue-900">{dietDay?.nutrition?.protein || 0}g</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-2xl">
                                    <p className="text-xs font-bold text-green-400 uppercase">Carb</p>
                                    <p className="font-black text-green-900">{dietDay?.nutrition?.carbs || 0}g</p>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 rounded-2xl">
                                    <p className="text-xs font-bold text-yellow-400 uppercase">Fat</p>
                                    <p className="font-black text-yellow-900">{dietDay?.nutrition?.fat || 0}g</p>
                                </div>
                             </div>

                             {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                                <div key={meal} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{meal}</h4>
                                   <p className="text-sm text-gray-800 font-medium">{dietDay?.meals?.[meal] || "-"}</p>
                                </div>
                             ))}
                          </div>
                       )}

                       {/* Progress Actions */}
                       <div className="mt-10 pt-6 border-t border-gray-200/50 flex gap-4">
                          <button 
                            onClick={() => handleMarkProgress(true)}
                            className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${isCompleted() === true ? 'bg-green-600 shadow-green-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}`}
                          >
                             <i className="fa-solid fa-check mr-2"></i> {isCompleted() === true ? "Done" : "Mark as Done"}
                          </button>
                          <button 
                            onClick={() => handleMarkProgress(false)}
                            className={`flex-1 py-3 border rounded-xl font-bold transition-all ${isCompleted() === false ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-red-200 text-red-500 hover:bg-red-50'}`}
                          >
                             <i className="fa-solid fa-xmark mr-2"></i> {isCompleted() === false ? "Missed" : "Not Done"}
                          </button>
                       </div>
                   </>
               )}
            </div>
         </div>

         {/* Sidebar: Tips */}
         <div className="space-y-6">
            <div className="bg-[#fffbeb] rounded-[2rem] p-6 border border-yellow-100 shadow-sm">
               <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
                  <i className="fa-regular fa-lightbulb"></i> Daily Tips
               </h3>
               <ul className="space-y-3 text-sm text-yellow-800">
                  <li className="flex gap-2 items-start"><i className="fa-solid fa-check mt-1 opacity-50"></i> Consistency {'>'} Intensity.</li>
                  <li className="flex gap-2 items-start"><i className="fa-solid fa-check mt-1 opacity-50"></i> Track your macros.</li>
                  <li className="flex gap-2 items-start"><i className="fa-solid fa-check mt-1 opacity-50"></i> Sleep is when muscles grow.</li>
               </ul>
            </div>
         </div>

      </div>

    </div>
  );
};

export default Workout;