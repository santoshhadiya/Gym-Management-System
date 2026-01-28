import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const ManageWorkoutDiet = () => {
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("workout"); // workout | diet
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeWeek, setActiveWeek] = useState(1); 
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); 
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeksList = [1, 2, 3, 4]; 

  const [workoutWeeks, setWorkoutWeeks] = useState([]);
  const [dietWeeks, setDietWeeks] = useState([]);

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

  // --- FETCH MEMBERS ---
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
     if(user) fetchMembers();
  }, []);

  // --- FETCH PLANS ---
  useEffect(() => {
     if(selectedMember) {
        const fetchPlans = async () => {
           try {
              const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}`, {
                 headers: { Authorization: `Bearer ${user.token}` }
              });
              
              const data = await res.json();
              setWorkoutWeeks(data.workout?.weeks || []);
              setDietWeeks(data.diet?.weeks || []);
           } catch(err) {
              console.error(err);
              toast.error("Failed to load plans");
           }
        };
        fetchPlans();
     }
  }, [selectedMember]);

  // --- SAVE HANDLERS ---
  const handleSaveWorkout = async () => {
     try {
        const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}/workout`, {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
           body: JSON.stringify({ weeks: workoutWeeks })
        });
        if(!res.ok) throw new Error("Save failed");
        toast.success("Workout Plan Saved!");
     } catch(err) {
        toast.error("Failed to save workout");
     }
  };

  const handleSaveDiet = async () => {
     try {
        const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}/diet`, {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
           body: JSON.stringify({ weeks: dietWeeks })
        });
        if(!res.ok) throw new Error("Save failed");
        toast.success("Diet Plan Saved!");
     } catch(err) {
        toast.error("Failed to save diet");
     }
  };

  // --- INPUT HANDLERS ---
  const updateWeeks = (prevWeeks, val, type, subField = null) => {
     const newWeeks = [...prevWeeks];
     let weekIdx = newWeeks.findIndex(w => w.weekNumber === activeWeek);
     
     if (weekIdx === -1) {
         newWeeks.push({ weekNumber: activeWeek, days: [] });
         weekIdx = newWeeks.length - 1;
     }
     
     const week = newWeeks[weekIdx];
     let dayIdx = week.days.findIndex(d => d.day === activeDay);
     
     if (dayIdx === -1) {
         week.days.push({ 
             day: activeDay, 
             plan: "",
             calorieTarget: 0,
             meals: { Breakfast: "", Lunch: "", Snacks: "", Dinner: "" },
             nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
         });
         dayIdx = week.days.length - 1;
     }

     if (type === 'workout') {
         week.days[dayIdx].plan = val;
     } else if (type === 'calorieTarget') {
         week.days[dayIdx].calorieTarget = Number(val);
     } else if (type === 'diet_meal') {
         week.days[dayIdx].meals[subField] = val;
     } else if (type === 'nutrition') {
         if (!week.days[dayIdx].nutrition) {
             week.days[dayIdx].nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
         }
         week.days[dayIdx].nutrition[subField] = Number(val);
     }
     
     return newWeeks;
  };

  const handleWorkoutChange = (val) => {
     setWorkoutWeeks(prev => updateWeeks(prev, val, 'workout'));
  };

  const handleCalorieTargetChange = (val) => {
      setWorkoutWeeks(prev => updateWeeks(prev, val, 'calorieTarget'));
  }

  const handleDietMealChange = (meal, val) => {
     setDietWeeks(prev => updateWeeks(prev, val, 'diet_meal', meal));
  };

  const handleNutritionChange = (field, val) => {
     setDietWeeks(prev => updateWeeks(prev, val, 'nutrition', field));
  };

  const getCurrentWorkout = () => {
      const week = workoutWeeks.find(w => w.weekNumber === activeWeek);
      const day = week?.days.find(d => d.day === activeDay);
      return { plan: day?.plan || "", calorieTarget: day?.calorieTarget || 0 };
  };

  const getCurrentDietDay = () => {
      const week = dietWeeks.find(w => w.weekNumber === activeWeek);
      const day = week?.days.find(d => d.day === activeDay);
      return day || { meals: {}, nutrition: {} };
  };

  const currentWorkoutData = getCurrentWorkout();
  const currentDietDay = getCurrentDietDay();

  const getDateForDay = (dayName, weekNum) => {
      const today = new Date();
      const currentDayOfWeek = today.getDay(); 
      const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      const currentWeekMonday = new Date(today);
      currentWeekMonday.setDate(today.getDate() + diffToMonday);
      
      const dayIndex = days.indexOf(dayName);
      const weekOffsetDays = (weekNum - 1) * 7;
      
      const targetDate = new Date(currentWeekMonday);
      targetDate.setDate(currentWeekMonday.getDate() + dayIndex + weekOffsetDays);
      
      return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col md:flex-row gap-8">
         <div className="w-full md:w-1/4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Clients</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
               {loading ? <p className="text-gray-400 text-center">Loading...</p> : assignedMembers.map(m => (
                  <div 
                     key={m._id} 
                     onClick={() => setSelectedMember(m)}
                     className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedMember?._id === m._id ? 'bg-[#D9F17F] border-[#D9F17F] shadow-md' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}
                  >
                     <h3 className={`font-bold text-sm ${selectedMember?._id === m._id ? 'text-green-900' : 'text-gray-800'}`}>{m.name}</h3>
                     <p className={`text-xs ${selectedMember?._id === m._id ? 'text-green-800' : 'text-gray-500'}`}>{m.plan}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[80vh]">
            {selectedMember ? (
               <>
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                     <div>
                        <h2 className="text-3xl font-black text-gray-900">{selectedMember.name}</h2>
                        <p className="text-gray-500 mt-1">Goal: <span className="font-bold text-gray-800">{selectedMember.goal || "General Fitness"}</span></p>
                     </div>
                     <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button onClick={() => setView('workout')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'workout' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Workout</button>
                        <button onClick={() => setView('diet')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'diet' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Diet</button>
                     </div>
                  </div>

                  <div className="mb-6 space-y-4">
                      <div className="flex gap-2 items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase">Week:</span>
                          {weeksList.map(wk => (
                              <button key={wk} onClick={() => setActiveWeek(wk)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${activeWeek === wk ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>{wk}</button>
                          ))}
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {days.map(day => (
                            <button key={day} onClick={() => setActiveDay(day)} className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex flex-col items-center min-w-[80px] ${activeDay === day ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                <span>{day.slice(0,3)}</span>
                                <span className={`text-[10px] font-normal ${activeDay === day ? 'text-gray-400' : 'text-gray-400'}`}>{getDateForDay(day, activeWeek)}</span>
                            </button>
                        ))}
                      </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 relative min-h-[400px]">
                     <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        {view === 'workout' ? <><i className="fa-solid fa-dumbbell text-blue-500"></i> {activeDay}'s Routine</> : <><i className="fa-solid fa-carrot text-green-500"></i> {activeDay}'s Meal Plan</>}
                     </h3>

                     {view === 'workout' ? (
                        <div className="h-full flex flex-col gap-4">
                           {/* Calorie Target Input */}
                           <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                              <label className="text-xs font-bold text-orange-500 uppercase">Target Burn:</label>
                              <input 
                                 type="number" 
                                 className="bg-gray-50 rounded-lg p-1.5 text-sm font-bold border-none focus:ring-1 focus:ring-orange-200 w-24"
                                 placeholder="e.g 500"
                                 value={currentWorkoutData.calorieTarget || 0}
                                 onChange={(e) => handleCalorieTargetChange(e.target.value)}
                              />
                              <span className="text-xs text-gray-400">kcal</span>
                           </div>

                           <textarea 
                              className="flex-1 min-h-[200px] w-full bg-white rounded-xl border border-gray-200 p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                              placeholder="List exercises, sets, and reps..."
                              value={currentWorkoutData.plan}
                              onChange={(e) => handleWorkoutChange(e.target.value)}
                           ></textarea>
                           <button onClick={handleSaveWorkout} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                              Save Routine
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="grid grid-cols-4 gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-100">
                                {['calories', 'protein', 'carbs', 'fat'].map(nut => (
                                    <div key={nut}>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{nut}</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-gray-50 rounded-lg p-1.5 text-xs font-bold border-none focus:ring-1 focus:ring-green-200"
                                            value={currentDietDay.nutrition?.[nut] || 0}
                                            onChange={(e) => handleNutritionChange(nut, e.target.value)}
                                        />
                                    </div>
                                ))}
                           </div>

                           {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                              <div key={meal} className="bg-white p-4 rounded-xl border border-gray-100">
                                 <p className="text-xs font-bold text-green-600 uppercase mb-2">{meal}</p>
                                 <input 
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 p-0"
                                    placeholder={`Add ${meal.toLowerCase()} items...`}
                                    value={currentDietDay.meals?.[meal] || ""}
                                    onChange={(e) => handleDietMealChange(meal, e.target.value)}
                                 />
                              </div>
                           ))}
                           <button onClick={handleSaveDiet} className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                              Save Diet Plan
                           </button>
                        </div>
                     )}
                  </div>
               </>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <i className="fa-solid fa-user-check text-6xl mb-4"></i>
                  <p className="text-xl font-bold">Select a client to manage their plan</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ManageWorkoutDiet;