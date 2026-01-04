import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Workout = () => {
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
  const [activeDay, setActiveDay] = useState("Monday");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ difficulty: "Moderate", pain: "No", comment: "" });

  const planDetails = {
    name: "Hypertrophy Phase 1",
    goal: "Muscle Gain",
    duration: "8 Weeks",
    currentWeek: 3,
    trainer: "Raj Mehta",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    lastUpdated: "2024-01-10",
    progress: 35 // %
  };

  const [schedule, setSchedule] = useState([
    {
      day: 'Monday',
      focus: 'Chest + Triceps',
      status: 'Completed',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', note: 'Focus on eccentric control.' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', note: 'Keep elbows at 45 degrees.' },
        { name: 'Cable Flys', sets: 3, reps: '15', rest: '45s', note: 'Squeeze at the top.' },
        { name: 'Tricep Dips', sets: 3, reps: 'Failure', rest: '60s', note: 'Bodyweight or weighted.' },
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Back + Biceps',
      status: 'Pending',
      exercises: [
        { name: 'Deadlifts', sets: 3, reps: '5-8', rest: '120s', note: 'Keep back straight.' },
        { name: 'Lat Pulldowns', sets: 4, reps: '10-12', rest: '60s', note: 'Full range of motion.' },
        { name: 'Barbell Rows', sets: 3, reps: '10', rest: '90s', note: 'Pull to lower chest.' },
        { name: 'Hammer Curls', sets: 3, reps: '12', rest: '45s', note: 'Control the swing.' },
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Rest & Recovery',
      status: 'Pending',
      exercises: [],
      isRest: true
    },
    {
      day: 'Thursday',
      focus: 'Legs (Quad Focus)',
      status: 'Pending',
      exercises: [
        { name: 'Barbell Squats', sets: 4, reps: '6-8', rest: '120s', note: 'Hit depth.' },
        { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s', note: 'Do not lock knees.' },
        { name: 'Walking Lunges', sets: 3, reps: '10/leg', rest: '60s', note: 'Keep torso upright.' },
      ],
    },
    {
      day: 'Friday',
      focus: 'Shoulders + Abs',
      status: 'Pending',
      exercises: [
        { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s', note: 'Core tight.' },
        { name: 'Lateral Raises', sets: 3, reps: '15', rest: '45s', note: 'Lead with elbows.' },
        { name: 'Face Pulls', sets: 3, reps: '15', rest: '45s', note: 'For rear delts.' },
        { name: 'Plank', sets: 3, reps: '60s', rest: '30s', note: 'Maintain straight line.' },
      ],
    },
    {
      day: 'Saturday',
      focus: 'Active Recovery / Cardio',
      status: 'Pending',
      exercises: [
        { name: 'Light Jog / Treadmill', sets: 1, reps: '30 mins', rest: '-', note: 'Zone 2 heart rate.' },
        { name: 'Foam Rolling', sets: 1, reps: '15 mins', rest: '-', note: 'Full body.' },
      ],
    },
    {
      day: 'Sunday',
      focus: 'Rest',
      status: 'Pending',
      exercises: [],
      isRest: true
    },
  ]);

  // --- HELPERS ---
  const currentWorkout = schedule.find(d => d.day === activeDay);

  const handleStatusChange = (status) => {
    setSchedule(prev => prev.map(day => 
      day.day === activeDay ? { ...day, status: status } : day
    ));
    const msg = status === 'Completed' ? "Great job! Workout marked complete." : "Workout marked as skipped.";
    toast.success(msg);
  };

  const submitFeedback = () => {
    toast.info("Feedback sent to your trainer.");
    setShowFeedback(false);
    setFeedbackData({ difficulty: "Moderate", pain: "No", comment: "" });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- PLAN OVERVIEW --- */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[80px] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                   {planDetails.goal}
                </span>
                <span className="text-gray-500 text-sm"><i className="fa-regular fa-calendar mr-1"></i> Week {planDetails.currentWeek} / {planDetails.duration.split(' ')[0]}</span>
             </div>
             <h1 className="text-3xl font-black text-gray-900 mb-2">{planDetails.name}</h1>
             <div className="flex items-center gap-4 text-sm text-gray-600">
                <span><i className="fa-solid fa-user-ninja text-blue-500 mr-1"></i> Trainer: <strong>{planDetails.trainer}</strong></span>
                <span className="hidden md:inline text-gray-300">|</span>
                <span><i className="fa-solid fa-flag-checkered text-green-500 mr-1"></i> Ends: {planDetails.endDate}</span>
             </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col justify-center">
             <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-500">Plan Progress</span>
                <span className="text-xl font-black text-blue-600">{planDetails.progress}%</span>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                   className="h-full bg-[#CDE7FE] rounded-full transition-all duration-1000 relative" 
                   style={{ width: `${planDetails.progress}%` }}
                >
                   <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-r from-transparent to-[#2563eb]/20"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- WEEKLY SCHEDULE TABS --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
         {schedule.map((day) => (
            <button
               key={day.day}
               onClick={() => setActiveDay(day.day)}
               className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-200 flex flex-col items-center min-w-[100px] ${
                  activeDay === day.day 
                  ? 'bg-[#D9F17F] border-[#D9F17F] text-green-900 shadow-md transform scale-105' 
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
               }`}
            >
               <span className="text-xs font-bold uppercase mb-1">{day.day.substring(0,3)}</span>
               <span className={`text-[10px] px-2 py-0.5 rounded-full ${day.status === 'Completed' ? 'bg-white/50 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                  {day.status === 'Completed' ? <i className="fa-solid fa-check"></i> : day.isRest ? 'Rest' : 'Run'}
               </span>
            </button>
         ))}
      </div>

      {/* --- ACTIVE DAY VIEW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* LEFT: Exercises List */}
         <div className="lg:col-span-2 space-y-4">
            
            {/* Day Header */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-black text-gray-900">{activeDay} Workout</h2>
                  <p className="text-sm text-blue-600 font-bold mt-1">{currentWorkout.focus}</p>
               </div>
               {currentWorkout.status === 'Completed' ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
                     <i className="fa-solid fa-circle-check"></i> Completed
                  </span>
               ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold">
                     {currentWorkout.status}
                  </span>
               )}
            </div>

            {/* Exercises */}
            {currentWorkout.isRest ? (
               <div className="bg-[#f8fbff] rounded-3xl p-10 border border-dashed border-[#CDE7FE] text-center">
                  <div className="w-16 h-16 bg-[#CDE7FE] rounded-full flex items-center justify-center text-blue-600 text-2xl mx-auto mb-4">
                     <i className="fa-solid fa-bed"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Rest Day</h3>
                  <p className="text-gray-500">Take it easy today. Focus on hydration, stretching, and good sleep.</p>
               </div>
            ) : (
               currentWorkout.exercises.map((ex, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                     <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{ex.name}</h3>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors" title="View Demo">
                           <i className="fa-regular fa-circle-play text-xl"></i>
                        </button>
                     </div>
                     <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-xl p-3 mb-3">
                        <div>
                           <p className="text-[10px] text-gray-400 uppercase font-bold">Sets</p>
                           <p className="font-black text-gray-800">{ex.sets}</p>
                        </div>
                        <div className="border-l border-gray-200">
                           <p className="text-[10px] text-gray-400 uppercase font-bold">Reps</p>
                           <p className="font-black text-gray-800">{ex.reps}</p>
                        </div>
                        <div className="border-l border-gray-200">
                           <p className="text-[10px] text-gray-400 uppercase font-bold">Rest</p>
                           <p className="font-black text-gray-800">{ex.rest}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-2 text-xs text-gray-500 bg-[#FEEF75]/20 p-2 rounded-lg border border-[#FEEF75]/50">
                        <i className="fa-solid fa-circle-info text-yellow-600 mt-0.5"></i>
                        <span>{ex.note}</span>
                     </div>
                  </div>
               ))
            )}

         </div>

         {/* RIGHT: Actions & Info */}
         <div className="space-y-6">
            
            {/* Status Actions */}
            {!currentWorkout.isRest && (
               <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Track Progress</h3>
                  <div className="space-y-3">
                     <button 
                        onClick={() => handleStatusChange('Completed')}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                           currentWorkout.status === 'Completed' 
                           ? 'bg-green-100 text-green-800 cursor-default' 
                           : 'bg-[#D9F17F] text-green-900 hover:bg-green-400 shadow-sm active:scale-95'
                        }`}
                        disabled={currentWorkout.status === 'Completed'}
                     >
                        {currentWorkout.status === 'Completed' ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-square-check"></i>}
                        Mark as Completed
                     </button>
                     
                     <button 
                        onClick={() => setShowFeedback(!showFeedback)}
                        className="w-full py-3 bg-[#CDE7FE] text-blue-900 rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                     >
                        <i className="fa-regular fa-comment-dots"></i> Feedback to Trainer
                     </button>

                     <button 
                        onClick={() => handleStatusChange('Skipped')}
                        className="w-full py-3 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                     >
                        Skip Workout
                     </button>
                  </div>

                  {/* Feedback Form (Collapsible) */}
                  {showFeedback && (
                     <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                        <div className="mb-3">
                           <label className="text-xs font-bold text-gray-500 block mb-1">Difficulty</label>
                           <select 
                              className="w-full p-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-200"
                              value={feedbackData.difficulty}
                              onChange={(e) => setFeedbackData({...feedbackData, difficulty: e.target.value})}
                           >
                              <option>Easy</option>
                              <option>Moderate</option>
                              <option>Hard</option>
                              <option>Extreme</option>
                           </select>
                        </div>
                        <div className="mb-3">
                           <label className="text-xs font-bold text-gray-500 block mb-1">Pain / Discomfort?</label>
                           <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="radio" name="pain" value="No" onChange={() => setFeedbackData({...feedbackData, pain: "No"})} defaultChecked /> No</label>
                              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="radio" name="pain" value="Yes" onChange={() => setFeedbackData({...feedbackData, pain: "Yes"})} /> Yes</label>
                           </div>
                        </div>
                        <textarea 
                           rows="2"
                           placeholder="Any comments?"
                           className="w-full p-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-200 resize-none mb-3"
                           value={feedbackData.comment}
                           onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                        ></textarea>
                        <button onClick={submitFeedback} className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-700">Submit</button>
                     </div>
                  )}
               </div>
            )}

            {/* Safety Guidelines */}
            <div className="bg-[#FEEF75]/20 rounded-3xl p-6 border border-[#FEEF75]">
               <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved"></i> Safety First
               </h3>
               <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                     <i className="fa-solid fa-angle-right mt-1 text-yellow-600"></i> Warm up for 5-10 mins before lifting.
                  </li>
                  <li className="flex items-start gap-2">
                     <i className="fa-solid fa-angle-right mt-1 text-yellow-600"></i> Keep hydrated throughout the session.
                  </li>
                  <li className="flex items-start gap-2">
                     <i className="fa-solid fa-angle-right mt-1 text-yellow-600"></i> Stop immediately if you feel sharp pain.
                  </li>
               </ul>
            </div>

            {/* Plan Info Footer */}
            <div className="text-center text-xs text-gray-400">
               <p>Plan updated on: {planDetails.lastUpdated}</p>
               <p>By {planDetails.trainer}</p>
            </div>

         </div>
      </div>
    </div>
  );
};

export default Workout;