import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const DietPlans = () => {
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
  const [feedbackText, setFeedbackText] = useState("");

  const planDetails = {
    name: "High Protein Fat Loss",
    goal: "Weight Loss",
    duration: "12 Weeks",
    currentWeek: 4,
    trainer: "Sneha Desai",
    lastUpdated: "2024-01-20",
    progress: 33, // %
    dailyTargets: { calories: 2200, protein: 180, carbs: 200, fats: 70 }
  };

  const [dietSchedule, setDietSchedule] = useState([
    {
      day: 'Monday',
      meals: [
        { id: 1, type: 'Breakfast', time: '08:00 AM', items: ['Oats (50g) with Skim Milk', '4 Egg Whites + 1 Whole Egg', '5 Almonds'], macros: { cal: 450, p: 25, c: 40, f: 12 }, status: 'Followed' },
        { id: 2, type: 'Mid-Morning', time: '11:00 AM', items: ['1 Apple', 'Green Tea'], macros: { cal: 100, p: 1, c: 20, f: 0 }, status: 'Pending' },
        { id: 3, type: 'Lunch', time: '02:00 PM', items: ['Grilled Chicken Breast (150g)', 'Brown Rice (1 cup)', 'Mixed Salad'], macros: { cal: 600, p: 40, c: 50, f: 10 }, status: 'Pending' },
        { id: 4, type: 'Evening Snack', time: '05:00 PM', items: ['Whey Protein Shake', '1 Banana'], macros: { cal: 250, p: 25, c: 30, f: 2 }, status: 'Pending' },
        { id: 5, type: 'Dinner', time: '08:30 PM', items: ['Paneer Tikka (100g)', 'Steamed Veggies', '1 Roti'], macros: { cal: 400, p: 20, c: 30, f: 15 }, status: 'Pending' },
      ]
    },
    {
      day: 'Tuesday',
      meals: [
        { id: 6, type: 'Breakfast', time: '08:00 AM', items: ['Multigrain Toast (2)', 'Peanut Butter', 'Black Coffee'], macros: { cal: 400, p: 12, c: 45, f: 15 }, status: 'Pending' },
        { id: 7, type: 'Mid-Morning', time: '11:00 AM', items: ['Greek Yogurt', 'Berries'], macros: { cal: 150, p: 10, c: 15, f: 2 }, status: 'Pending' },
        { id: 8, type: 'Lunch', time: '02:00 PM', items: ['Fish Curry (Low Oil)', 'Quinoa (1 cup)'], macros: { cal: 550, p: 35, c: 40, f: 12 }, status: 'Pending' },
        { id: 9, type: 'Evening Snack', time: '05:00 PM', items: ['Boiled Eggs (3 whites)', 'Cucumber Slices'], macros: { cal: 100, p: 12, c: 5, f: 0 }, status: 'Pending' },
        { id: 10, type: 'Dinner', time: '08:30 PM', items: ['Lentil Soup (Dal)', 'Green Salad'], macros: { cal: 300, p: 15, c: 30, f: 5 }, status: 'Pending' },
      ]
    },
    // ... Add other days similarly if needed, keeping it concise for demo
    { day: 'Wednesday', meals: [] }, { day: 'Thursday', meals: [] }, { day: 'Friday', meals: [] }, { day: 'Saturday', meals: [] }, { day: 'Sunday', meals: [] }
  ]);

  // --- HELPERS ---
  const currentDayDiet = dietSchedule.find(d => d.day === activeDay);
  
  // Calculate daily totals based on 'Followed' or planned meals
  const dailyTotals = currentDayDiet?.meals.reduce((acc, meal) => ({
    cal: acc.cal + meal.macros.cal,
    p: acc.p + meal.macros.p,
    c: acc.c + meal.macros.c,
    f: acc.f + meal.macros.f
  }), { cal: 0, p: 0, c: 0, f: 0 }) || { cal: 0, p: 0, c: 0, f: 0 };

  const handleStatusChange = (mealId, status) => {
    setDietSchedule(prev => prev.map(day => 
      day.day === activeDay 
        ? { ...day, meals: day.meals.map(m => m.id === mealId ? { ...m, status } : m) }
        : day
    ));
    const msg = status === 'Followed' ? "Meal marked as consumed." : "Meal marked as skipped.";
    toast.success(msg);
  };

  const submitFeedback = () => {
    toast.info("Diet feedback sent to trainer.");
    setShowFeedback(false);
    setFeedbackText("");
  };

  return (
    // Changed: Added padding (px-4 sm:px-6) for mobile
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 font-sans px-4 sm:px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- PLAN OVERVIEW --- */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[80px] opacity-20"></div>
        
        {/* Changed: Added flex-col md:flex-row to stack on mobile */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-green-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                   {planDetails.goal}
                </span>
                <span className="text-gray-500 text-sm"><i className="fa-regular fa-calendar mr-1"></i> Week {planDetails.currentWeek} / {planDetails.duration.split(' ')[0]}</span>
             </div>
             <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{planDetails.name}</h1>
             {/* Changed: Adjusted text size and wrapping for mobile */}
             <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600">
                <span><i className="fa-solid fa-user-doctor text-blue-500 mr-1"></i> Nutritionist: <strong>{planDetails.trainer}</strong></span>
                <span className="hidden md:inline text-gray-300">|</span>
                <span><i className="fa-solid fa-rotate text-green-500 mr-1"></i> Updated: {planDetails.lastUpdated}</span>
             </div>
          </div>

          {/* Changed: Adjusted width to full on mobile */}
          <div className="w-full md:w-1/3 flex flex-col justify-center">
             <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-500">Plan Adherence</span>
                <span className="text-xl font-black text-green-600">{planDetails.progress}%</span>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                   className="h-full bg-[#D9F17F] rounded-full transition-all duration-1000 relative" 
                   style={{ width: `${planDetails.progress}%` }}
                >
                   <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-r from-transparent to-[#84cc16]/20"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- WEEKLY SCHEDULE TABS --- */}
      {/* Changed: Ensuring proper overflow behavior on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {dietSchedule.map((day) => (
            <button
               key={day.day}
               onClick={() => setActiveDay(day.day)}
               className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-200 flex flex-col items-center min-w-[100px] ${
                  activeDay === day.day 
                  ? 'bg-[#CDE7FE] border-[#CDE7FE] text-blue-900 shadow-md transform scale-105' 
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
               }`}
            >
               <span className="text-xs font-bold uppercase mb-1">{day.day.substring(0,3)}</span>
               <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-medium">
                  {day.meals.length > 0 ? `${day.meals.length} Meals` : 'Cheat Day'}
               </span>
            </button>
         ))}
      </div>

      {/* --- ACTIVE DAY VIEW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* LEFT: Meal List */}
         <div className="lg:col-span-2 space-y-4">
            
            {currentDayDiet?.meals.length === 0 ? (
               <div className="bg-[#fcfdfd] rounded-3xl p-10 border border-dashed border-[#FEEF75] text-center">
                  <div className="w-16 h-16 bg-[#FEEF75] rounded-full flex items-center justify-center text-yellow-800 text-2xl mx-auto mb-4">
                     <i className="fa-solid fa-pizza-slice"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible / Cheat Day</h3>
                  <p className="text-gray-500">Enjoy your meals responsibly! Remember portion control.</p>
               </div>
            ) : (
               currentDayDiet?.meals.map((meal) => (
                  <div key={meal.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                     {/* Status Strip */}
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${meal.status === 'Followed' ? 'bg-green-500' : meal.status === 'Skipped' ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                     
                     {/* Changed: flex-col md:flex-row for better mobile stacking */}
                     <div className="flex flex-col md:flex-row justify-between gap-4 pl-3">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{meal.type}</span>
                              <span className="text-xs text-gray-400"><i className="fa-regular fa-clock mr-1"></i> {meal.time}</span>
                           </div>
                           <ul className="space-y-1 mb-3">
                              {meal.items.map((item, i) => (
                                 <li key={i} className="text-sm text-gray-800 font-medium flex items-start gap-2">
                                    <i className="fa-solid fa-angle-right text-[#D9F17F] mt-1 shrink-0"></i> 
                                    <span>{item}</span>
                                 </li>
                              ))}
                           </ul>
                           
                           {/* Macros Mini */}
                           {/* Changed: flex-wrap so macros don't overflow */}
                           <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                              <span className="bg-gray-50 px-2 py-1 rounded">Cal: {meal.macros.cal}</span>
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">P: {meal.macros.p}g</span>
                              <span className="bg-green-50 text-green-700 px-2 py-1 rounded">C: {meal.macros.c}g</span>
                              <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">F: {meal.macros.f}g</span>
                           </div>
                        </div>

                        {/* Actions */}
                        {/* Changed: row on mobile, col on desktop, or just keep it simple */}
                        <div className="flex md:flex-col justify-end gap-2 shrink-0 mt-2 md:mt-0">
                           <button 
                              onClick={() => handleStatusChange(meal.id, 'Followed')}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${meal.status === 'Followed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                              title="Mark as Eaten"
                           >
                              <i className="fa-solid fa-check"></i>
                           </button>
                           <button 
                              onClick={() => handleStatusChange(meal.id, 'Skipped')}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${meal.status === 'Skipped' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                              title="Mark as Skipped"
                           >
                              <i className="fa-solid fa-xmark"></i>
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            )}

         </div>

         {/* RIGHT: Nutrition Summary & Info */}
         <div className="space-y-6">
            
            {/* Nutrition Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Daily Nutrition</h3>
               
               <div className="space-y-4">
                  {/* Calories */}
                  <div>
                     <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-gray-700">Calories</span>
                        <span className="text-gray-500">{dailyTotals.cal} / {planDetails.dailyTargets.calories} kcal</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${Math.min((dailyTotals.cal / planDetails.dailyTargets.calories)*100, 100)}%` }}></div>
                     </div>
                  </div>

                  {/* Protein */}
                  <div>
                     <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-blue-700">Protein</span>
                        <span className="text-gray-500">{dailyTotals.p} / {planDetails.dailyTargets.protein} g</span>
                     </div>
                     <div className="w-full bg-blue-50 rounded-full h-2">
                        <div className="bg-[#CDE7FE] h-2 rounded-full" style={{ width: `${Math.min((dailyTotals.p / planDetails.dailyTargets.protein)*100, 100)}%` }}></div>
                     </div>
                  </div>

                  {/* Carbs */}
                  <div>
                     <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-green-700">Carbs</span>
                        <span className="text-gray-500">{dailyTotals.c} / {planDetails.dailyTargets.carbs} g</span>
                     </div>
                     <div className="w-full bg-green-50 rounded-full h-2">
                        <div className="bg-[#D9F17F] h-2 rounded-full" style={{ width: `${Math.min((dailyTotals.c / planDetails.dailyTargets.carbs)*100, 100)}%` }}></div>
                     </div>
                  </div>

                  {/* Fats */}
                  <div>
                     <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-yellow-700">Fats</span>
                        <span className="text-gray-500">{dailyTotals.f} / {planDetails.dailyTargets.fats} g</span>
                     </div>
                     <div className="w-full bg-yellow-50 rounded-full h-2">
                        <div className="bg-[#FEEF75] h-2 rounded-full" style={{ width: `${Math.min((dailyTotals.f / planDetails.dailyTargets.fats)*100, 100)}%` }}></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Feedback & Actions */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Actions</h3>
               
               <button 
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="w-full py-3 bg-[#FEEF75] text-yellow-900 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 mb-3"
               >
                  <i className="fa-regular fa-comment-dots"></i> Report Issue / Feedback
               </button>

               {showFeedback && (
                  <div className="mt-3 animate-fade-in">
                     <textarea 
                        rows="3"
                        placeholder="e.g. Too full, allergic to nuts..."
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-yellow-200 resize-none mb-2"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                     ></textarea>
                     <button onClick={submitFeedback} className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-700">Submit to Trainer</button>
                  </div>
               )}
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
               <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-glass-water"></i> Daily Guidelines
               </h3>
               <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                     <i className="fa-solid fa-droplet mt-1 text-blue-500 text-xs"></i> Drink at least 3-4 liters of water.
                  </li>
                  <li className="flex items-start gap-2">
                     <i className="fa-solid fa-scale-balanced mt-1 text-blue-500 text-xs"></i> Use a kitchen scale for accuracy.
                  </li>
                  <li className="flex items-start gap-2">
                     <i className="fa-solid fa-ban mt-1 text-red-500 text-xs"></i> Avoid sugar & processed foods.
                  </li>
               </ul>
            </div>

         </div>
      </div>
    </div>
  );
};

export default DietPlans;