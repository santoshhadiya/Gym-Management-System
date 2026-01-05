import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const ManageWorkoutDiet = () => {
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
    { id: 1, name: "Ravi Patel", goal: "Weight Loss", plan: "Yearly Elite", expiry: "2025-01-15", status: "Active" },
    { id: 2, name: "Priya Shah", goal: "Muscle Gain", plan: "Quarterly Pro", expiry: "2024-11-20", status: "Active" },
    { id: 3, name: "Amit Joshi", goal: "General Fitness", plan: "Monthly Basic", expiry: "2024-09-01", status: "Expired" },
  ];

  // --- STATE ---
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [activeTab, setActiveTab] = useState("workout"); // 'workout' or 'diet'
  const [activeDay, setActiveDay] = useState("Monday");
  
  // Workout Form State
  const [workoutPlan, setWorkoutPlan] = useState({
    name: "",
    goal: "Weight Loss",
    duration: "4", // weeks
    difficulty: "Beginner",
    schedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    }
  });

  // Diet Form State
  const [dietPlan, setDietPlan] = useState({
    name: "",
    goal: "Weight Loss",
    calories: "2000",
    schedule: {
      Monday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
      Tuesday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
      // ... assume other days populated for brevity in mock
      Wednesday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
      Thursday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
      Friday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
      Saturday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
      Sunday: { Breakfast: "", Lunch: "", Dinner: "", Snacks: "" },
    }
  });

  const selectedMember = assignedMembers.find(m => m.id === parseInt(selectedMemberId));

  // --- ACTIONS ---

  const handleAddExercise = () => {
    const newExercise = { name: "", sets: "", reps: "", note: "" };
    setWorkoutPlan(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [activeDay]: [...prev.schedule[activeDay], newExercise]
      }
    }));
  };

  const handleUpdateExercise = (index, field, value) => {
    const updatedExercises = workoutPlan.schedule[activeDay].map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
    setWorkoutPlan(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [activeDay]: updatedExercises }
    }));
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = workoutPlan.schedule[activeDay].filter((_, i) => i !== index);
    setWorkoutPlan(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [activeDay]: updatedExercises }
    }));
  };

  const handleDietChange = (meal, value) => {
    setDietPlan(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [activeDay]: { ...prev.schedule[activeDay], [meal]: value }
      }
    }));
  };

  const handleSave = () => {
    if (!selectedMember) {
      toast.error("Please select a member first.");
      return;
    }
    if (selectedMember.status === 'Expired') {
      toast.error("Cannot assign plan. Membership expired.");
      return;
    }

    if (activeTab === 'workout') {
      if (!workoutPlan.name) return toast.warn("Please name the workout plan.");
      console.log("Saving Workout:", workoutPlan);
      toast.success(`Workout Plan assigned to ${selectedMember.name}`);
    } else {
      if (!dietPlan.name) return toast.warn("Please name the diet plan.");
      console.log("Saving Diet:", dietPlan);
      toast.success(`Diet Plan assigned to ${selectedMember.name}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER & MEMBER SELECTOR --- */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Plan Management</h1>
            <p className="text-gray-500 mt-1">Create customized routines for your clients.</p>
          </div>
          
          {/* Member Dropdown */}
          <div className="w-full md:w-80">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Select Client</label>
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

        {/* Selected Member Context */}
        {selectedMember && (
          <div className="mt-8 p-6 bg-[#f8fbff] rounded-2xl border border-blue-100 flex flex-wrap gap-6 items-center animate-fade-in">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-900 font-bold text-xl">
                   {selectedMember.name[0]}
                </div>
                <div>
                   <h3 className="font-bold text-gray-900">{selectedMember.name}</h3>
                   <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedMember.status}
                   </span>
                </div>
             </div>
             
             <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
             
             <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Goal</p>
                <p className="text-sm font-bold text-gray-700">{selectedMember.goal}</p>
             </div>

             <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

             <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Current Plan</p>
                <p className="text-sm font-bold text-gray-700">{selectedMember.plan}</p>
             </div>

             <div className="ml-auto">
                <span className="text-xs text-red-400 font-medium">Expires: {selectedMember.expiry}</span>
             </div>
          </div>
        )}
      </div>

      {/* --- PLAN BUILDER --- */}
      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: SETTINGS & TABS */}
          <div className="lg:col-span-1 space-y-6">
             
             {/* Type Toggle */}
             <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-1">
                <button 
                  onClick={() => setActiveTab('workout')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'workout' ? 'bg-[#D9F17F] text-green-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <i className="fa-solid fa-dumbbell mr-2"></i> Workout
                </button>
                <button 
                  onClick={() => setActiveTab('diet')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'diet' ? 'bg-[#FEEF75] text-yellow-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <i className="fa-solid fa-carrot mr-2"></i> Diet
                </button>
             </div>

             {/* Plan Details Form */}
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Plan Settings</h3>
                
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Plan Name</label>
                      <input 
                         type="text" 
                         className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 text-sm font-medium"
                         placeholder={activeTab === 'workout' ? "e.g. Hypertrophy Phase 1" : "e.g. Keto Start"}
                         value={activeTab === 'workout' ? workoutPlan.name : dietPlan.name}
                         onChange={(e) => activeTab === 'workout' ? setWorkoutPlan({...workoutPlan, name: e.target.value}) : setDietPlan({...dietPlan, name: e.target.value})}
                      />
                   </div>

                   {activeTab === 'workout' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1">Duration (Weeks)</label>
                          <input 
                             type="number" 
                             className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 text-sm font-medium"
                             value={workoutPlan.duration}
                             onChange={(e) => setWorkoutPlan({...workoutPlan, duration: e.target.value})}
                          />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-400 mb-1">Difficulty</label>
                           <select 
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 text-sm font-medium"
                              value={workoutPlan.difficulty}
                              onChange={(e) => setWorkoutPlan({...workoutPlan, difficulty: e.target.value})}
                           >
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                           </select>
                        </div>
                      </>
                   ) : (
                      <>
                         <div>
                           <label className="block text-xs font-bold text-gray-400 mb-1">Daily Calories</label>
                           <input 
                              type="number" 
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 text-sm font-medium"
                              value={dietPlan.calories}
                              onChange={(e) => setDietPlan({...dietPlan, calories: e.target.value})}
                           />
                         </div>
                      </>
                   )}
                </div>
             </div>

             {/* Day Selector */}
             <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider ml-2">Schedule</h3>
                <div className="flex flex-col gap-1">
                   {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button 
                         key={day}
                         onClick={() => setActiveDay(day)}
                         className={`px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all flex justify-between items-center ${activeDay === day ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                         {day}
                         <i className="fa-solid fa-chevron-right text-xs opacity-50"></i>
                      </button>
                   ))}
                </div>
             </div>

             <button 
                onClick={handleSave}
                className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transform hover:-translate-y-1 transition-all ${activeTab === 'workout' ? 'bg-[#D9F17F] text-green-900 hover:bg-green-300' : 'bg-[#FEEF75] text-yellow-900 hover:bg-yellow-300'}`}
             >
                Save & Assign Plan
             </button>

          </div>

          {/* RIGHT: EDITOR */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 min-h-[600px]">
             
             <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                   <span className={`w-3 h-8 rounded-full ${activeTab === 'workout' ? 'bg-[#D9F17F]' : 'bg-[#FEEF75]'}`}></span>
                   {activeDay} {activeTab === 'workout' ? 'Routine' : 'Meals'}
                </h2>
                {activeTab === 'workout' && (
                   <button 
                      onClick={handleAddExercise}
                      className="px-4 py-2 bg-[#CDE7FE] text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-200 transition-colors"
                   >
                      + Add Exercise
                   </button>
                )}
             </div>

             {/* WORKOUT EDITOR */}
             {activeTab === 'workout' && (
                <div className="space-y-4">
                   {workoutPlan.schedule[activeDay].length === 0 ? (
                      <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                         <i className="fa-solid fa-dumbbell text-4xl mb-3 opacity-30"></i>
                         <p>No exercises added for {activeDay}.</p>
                      </div>
                   ) : (
                      workoutPlan.schedule[activeDay].map((ex, idx) => (
                         <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#CDE7FE] transition-colors relative">
                            <div className="flex-1">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Exercise Name</label>
                               <input 
                                  type="text" 
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-300"
                                  placeholder="e.g. Bench Press"
                                  value={ex.name}
                                  onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                               />
                            </div>
                            <div className="w-24">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Sets</label>
                               <input 
                                  type="text" 
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-center"
                                  placeholder="3"
                                  value={ex.sets}
                                  onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                               />
                            </div>
                            <div className="w-24">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Reps</label>
                               <input 
                                  type="text" 
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-center"
                                  placeholder="12"
                                  value={ex.reps}
                                  onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                               />
                            </div>
                            <div className="flex-1">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Note</label>
                               <input 
                                  type="text" 
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600"
                                  placeholder="e.g. Drop set on last"
                                  value={ex.note}
                                  onChange={(e) => handleUpdateExercise(idx, 'note', e.target.value)}
                               />
                            </div>
                            <button 
                               onClick={() => handleRemoveExercise(idx)}
                               className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                         </div>
                      ))
                   )}
                </div>
             )}

             {/* DIET EDITOR */}
             {activeTab === 'diet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                      <div key={meal} className="bg-[#fffbeb] p-6 rounded-[2rem] border border-[#FEEF75]/50 relative">
                         <div className="absolute top-4 right-4 text-[#FEEF75] opacity-50 text-3xl">
                            <i className={`fa-solid ${meal === 'Breakfast' ? 'fa-mug-hot' : meal === 'Lunch' ? 'fa-bowl-food' : meal === 'Snacks' ? 'fa-cookie-bite' : 'fa-utensils'}`}></i>
                         </div>
                         <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wider mb-3">{meal}</h3>
                         <textarea 
                            rows="4"
                            className="w-full bg-white/80 border border-yellow-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#FEEF75]"
                            placeholder={`Enter ${meal} items...`}
                            value={dietPlan.schedule[activeDay][meal]}
                            onChange={(e) => handleDietChange(meal, e.target.value)}
                         ></textarea>
                      </div>
                   ))}
                </div>
             )}

          </div>

        </div>
      )}

      {!selectedMember && (
         <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 mt-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-3xl">
               <i className="fa-solid fa-user-plus"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-400">Select a client to start planning</h2>
         </div>
      )}

    </div>
  );
};

export default ManageWorkoutDiet;