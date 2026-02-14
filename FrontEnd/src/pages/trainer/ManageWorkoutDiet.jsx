import React, { useState, useEffect } from 'react';
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useGlobalContext } from '../../context/GlobalContext';

const ManageWorkoutDiet = () => {
   const { BACKEND_URL } = useGlobalContext();
   const [assignedMembers, setAssignedMembers] = useState([]);
   const [selectedMember, setSelectedMember] = useState(null);
   const [loading, setLoading] = useState(true);
   const [view, setView] = useState("workout");
   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

   // Libraries
   const [exerciseLibrary, setExerciseLibrary] = useState([]);
   const [foodLibrary, setFoodLibrary] = useState([]);

   // Current Plan Data
   const [selectedExercises, setSelectedExercises] = useState([]);
   const [calorieTarget, setCalorieTarget] = useState(0);
   const [workoutNotes, setWorkoutNotes] = useState("");

   const [selectedFoods, setSelectedFoods] = useState({
      Breakfast: [],
      Lunch: [],
      Snacks: [],
      Dinner: []
   });
   const [nutrition, setNutrition] = useState({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
   });
   const [dietNotes, setDietNotes] = useState("");

   // Custom Entry States
   const [showCustomExercise, setShowCustomExercise] = useState(false);
   const [customExercise, setCustomExercise] = useState({ name: '', sets: 3, reps: '' });

   const [showCustomFood, setShowCustomFood] = useState(false);
   const [customFood, setCustomFood] = useState({ name: '', quantity: '' });
   const [customFoodMeal, setCustomFoodMeal] = useState('Breakfast');

   // Calendar View
   const [calendarDates, setCalendarDates] = useState([]);
   const [existingPlans, setExistingPlans] = useState({ workout: [], diet: [] });

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

   // Fetch Libraries
   useEffect(() => {
      const fetchLibraries = async () => {
         try {
            const res = await fetch(`${BACKEND_URL}/api/workout-diet/libraries`, {
               headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setExerciseLibrary(data.exercises || []);
            setFoodLibrary(data.foods || []);
         } catch (err) {
            console.error("Failed to load libraries", err);
         }
      };
      if (user) fetchLibraries();
   }, []);

   // Fetch Members
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

   // Fetch Plans when member is selected
   useEffect(() => {
      if (selectedMember) {
         fetchPlansForMember();
         generateCalendarDates();
      }
   }, [selectedMember]);

   // Load plan for selected date
   useEffect(() => {
      if (selectedMember && selectedDate) {
         loadPlanForDate();
      }
   }, [selectedDate, existingPlans]);

   const fetchPlansForMember = async () => {
      try {
         const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
         });

         const data = await res.json();
         setExistingPlans({
            workout: data.workout?.plans || [],
            diet: data.diet?.plans || []
         });
      } catch (err) {
         console.error(err);
         toast.error("Failed to load plans");
      }
   };

   const generateCalendarDates = () => {
      const dates = [];
      const today = new Date();

      // Generate next 30 days
      for (let i = 0; i < 30; i++) {
         const date = new Date(today);
         date.setDate(today.getDate() + i);
         dates.push({
            date: date.toISOString().split('T')[0],
            display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
         });
      }
      setCalendarDates(dates);
   };

   const loadPlanForDate = () => {
      // Load workout plan for selected date
      const workoutPlan = existingPlans.workout.find(p => p.date === selectedDate);
      if (workoutPlan) {
         setSelectedExercises(workoutPlan.exercises || []);
         setCalorieTarget(workoutPlan.calorieTarget || 0);
         setWorkoutNotes(workoutPlan.notes || "");
      } else {
         setSelectedExercises([]);
         setCalorieTarget(0);
         setWorkoutNotes("");
      }

      // Load diet plan for selected date
      const dietPlan = existingPlans.diet.find(p => p.date === selectedDate);
      if (dietPlan) {
         setSelectedFoods(dietPlan.meals || {
            Breakfast: [],
            Lunch: [],
            Snacks: [],
            Dinner: []
         });
         setNutrition(dietPlan.nutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
         });
         setDietNotes(dietPlan.notes || "");
      } else {
         setSelectedFoods({
            Breakfast: [],
            Lunch: [],
            Snacks: [],
            Dinner: []
         });
         setNutrition({
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
         });
         setDietNotes("");
      }
   };

   // Exercise Selection
   const toggleExercise = (exercise) => {
      const exists = selectedExercises.find(e => e.name === exercise.name);
      if (exists) {
         setSelectedExercises(selectedExercises.filter(e => e.name !== exercise.name));
      } else {
         setSelectedExercises([...selectedExercises, {
            name: exercise.name,
            sets: exercise.defaultSets,
            reps: exercise.defaultReps,
            imageUrl: exercise.imageUrl,
            isCustom: false
         }]);
      }
   };

   const addCustomExercise = () => {
      if (!customExercise.name) {
         toast.error("Exercise name is required");
         return;
      }
      setSelectedExercises([...selectedExercises, {
         ...customExercise,
         isCustom: true,
         imageUrl: 'https://img.icons8.com/color/1200/personal-trainer.jpg'
      }]);
      setCustomExercise({ name: '', sets: 3, reps: '' });
      setShowCustomExercise(false);
   };

   // Food Selection
   const toggleFood = (food, meal) => {
      const exists = selectedFoods[meal].find(f => f.name === food.name);
      if (exists) {
         setSelectedFoods({
            ...selectedFoods,
            [meal]: selectedFoods[meal].filter(f => f.name !== food.name)
         });
      } else {
         setSelectedFoods({
            ...selectedFoods,
            [meal]: [...selectedFoods[meal], {
               name: food.name,
               quantity: food.defaultQuantity,
               imageUrl: food.imageUrl,
               isCustom: false
            }]
         });
      }
   };

   const addCustomFood = () => {
      if (!customFood.name) {
         toast.error("Food name is required");
         return;
      }
      setSelectedFoods({
         ...selectedFoods,
         [customFoodMeal]: [...selectedFoods[customFoodMeal], {
            ...customFood,
            isCustom: true,
            imageUrl: 'https://png.pngtree.com/png-vector/20230801/ourmid/pngtree-fresh-food-icon-with-bread-and-produce-vector-png-image_6829151.png'
         }]
      });
      setCustomFood({ name: '', quantity: '' });
      setShowCustomFood(false);
   };

   // Save Handlers
   const handleSaveWorkout = async () => {
      try {
         const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}/workout`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
               date: selectedDate,
               exercises: selectedExercises,
               calorieTarget,
               notes: workoutNotes
            })
         });

         if (!res.ok) throw new Error("Save failed");
         toast.success(`Workout plan saved for ${selectedDate}!`);
         fetchPlansForMember(); // Refresh
      } catch (err) {
         toast.error("Failed to save workout");
      }
   };

   const handleSaveDiet = async () => {
      try {
         const res = await fetch(`${BACKEND_URL}/api/workout-diet/${selectedMember._id}/diet`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
               date: selectedDate,
               meals: selectedFoods,
               nutrition,
               notes: dietNotes
            })
         });

         if (!res.ok) throw new Error("Save failed");
         toast.success(`Diet plan saved for ${selectedDate}!`);
         fetchPlansForMember(); // Refresh
      } catch (err) {
         toast.error("Failed to save diet");
      }
   };

   const hasPlanForDate = (date) => {
      const hasWorkout = existingPlans.workout.some(p => p.date === date);
      const hasDiet = existingPlans.diet.some(p => p.date === date);
      return { hasWorkout, hasDiet };
   };

   return (
      <div className="w-full max-w-[1800px] mx-auto space-y-6 pb-10 font-sans px-4">

         <div className="lg:flex-row gap-6">
            {/* Members Sidebar */}
            <div className="w-full flex flex-col mb-4">

               <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Clients
               </h2>

               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {loading ? (
                     <p className="text-gray-400">Loading...</p>
                  ) : (
                     assignedMembers.map((m) => (
                        <div
                           key={m._id}
                           onClick={() => setSelectedMember(m)}
                           className={`min-w-[220px] p-4 rounded-2xl cursor-pointer transition-all border flex-shrink-0 ${selectedMember?._id === m._id
                                 ? "bg-[#D9F17F] border-[#D9F17F] shadow-md"
                                 : "bg-gray-50 border-gray-100 hover:border-gray-300 hover:shadow-sm"
                              }`}
                        >
                           <h3
                              className={`font-bold text-sm ${selectedMember?._id === m._id
                                    ? "text-green-900"
                                    : "text-gray-800"
                                 }`}
                           >
                              {m.name}
                           </h3>

                           <p
                              className={`text-xs ${selectedMember?._id === m._id
                                    ? "text-green-800"
                                    : "text-gray-500"
                                 }`}
                           >
                              {m.plan}
                           </p>
                        </div>
                     ))
                  )}
               </div>
            </div>


            {/* Main Content */}
            <div className="flex-1  p-6 lg:p-8  ">
               {selectedMember ? (
                  <>
                     {/* Header */}
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                        <div>
                           <h2 className="text-3xl font-black text-gray-900">{selectedMember.name}</h2>
                           <p className="text-gray-500 mt-1">
                              Goal: <span className="font-bold text-gray-800">{selectedMember.goal || "General Fitness"}</span>
                           </p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                           <button
                              onClick={() => setView('workout')}
                              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'workout'
                                    ? 'bg-[#CDE7FE] text-[#1C398E] '
                                    : 'text-gray-500'
                                 }`}
                           >
                              Workout
                           </button>
                           <button
                              onClick={() => setView('diet')}
                              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'diet'
                                    ? 'bg-[#CDE7FE] text-[#1C398E] '
                                    : 'text-gray-500'
                                 }`}
                           >
                              Diet
                           </button>
                        </div>
                     </div>

                     {/* Calendar Date Selector */}
                     <div className="mb-6">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                           Select Date
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-3">
                           {calendarDates.map(dateObj => {
                              const planStatus = hasPlanForDate(dateObj.date);
                              return (
                                 <button
                                    key={dateObj.date}
                                    onClick={() => setSelectedDate(dateObj.date)}
                                    className={`min-w-[90px] px-3 py-3 rounded-2xl text-xs font-bold transition-all relative ${selectedDate === dateObj.date
                                          ? 'bg-gray-900 text-white shadow-lg'
                                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                       }`}
                                 >
                                    <div className="flex flex-col items-center gap-1">
                                       <span className="text-[10px] opacity-70">{dateObj.dayName}</span>
                                       <span>{dateObj.display}</span>
                                    </div>
                                    {(planStatus.hasWorkout || planStatus.hasDiet) && (
                                       <div className="absolute top-1 right-1 flex gap-0.5">
                                          {planStatus.hasWorkout && (
                                             <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                          )}
                                          {planStatus.hasDiet && (
                                             <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                          )}
                                       </div>
                                    )}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Workout View */}
                     {view === 'workout' ? (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                 <i className="fa-solid fa-dumbbell text-blue-500"></i>
                                 Workout Plan for {selectedDate}
                              </h3>
                           </div>

                           {/* Calorie Target */}
                           <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                              <label className="text-xs font-bold text-orange-600 uppercase block mb-2">
                                 Target Calorie Burn
                              </label>
                              <div className="flex items-center gap-2">
                                 <input
                                    type="number"
                                    className="bg-white rounded-lg p-2 text-lg font-bold border border-orange-200 focus:ring-2 focus:ring-orange-300 w-32"
                                    placeholder="500"
                                    value={calorieTarget || ''}
                                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                                 />
                                 <span className="text-sm text-gray-600">kcal</span>
                              </div>
                           </div>

                           {/* Exercise Library */}
                           <div>
                              <div className="flex justify-between items-center mb-3">
                                 <h4 className="font-bold text-gray-700">Select Exercises</h4>
                                 <button
                                    onClick={() => setShowCustomExercise(!showCustomExercise)}
                                    className="text-xs bg-[#CDE7FE] text-[#1C398E]  px-3 py-1.5 rounded-lg  cursor-pointer"
                                 >
                                    + Add Custom
                                 </button>
                              </div>

                              {/* Custom Exercise Form */}
                              {showCustomExercise && (
                                 <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-200">
                                    <h5 className="font-bold text-sm text-blue-900 mb-3">Add Custom Exercise</h5>
                                    <div className="grid grid-cols-3 gap-3">
                                       <input
                                          type="text"
                                          placeholder="Exercise name"
                                          className="col-span-3 sm:col-span-1 bg-white rounded-lg p-2 text-sm border border-blue-200"
                                          value={customExercise.name}
                                          onChange={(e) => setCustomExercise({ ...customExercise, name: e.target.value })}
                                       />
                                       <input
                                          type="number"
                                          placeholder="Sets"
                                          className="bg-white rounded-lg p-2 text-sm border border-blue-200"
                                          value={customExercise.sets}
                                          onChange={(e) => setCustomExercise({ ...customExercise, sets: Number(e.target.value) })}
                                       />
                                       <input
                                          type="text"
                                          placeholder="Reps (e.g., 10-12)"
                                          className="bg-white rounded-lg p-2 text-sm border border-blue-200"
                                          value={customExercise.reps}
                                          onChange={(e) => setCustomExercise({ ...customExercise, reps: e.target.value })}
                                       />
                                    </div>
                                    <button
                                       onClick={addCustomExercise}
                                       className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                                    >
                                       Add Exercise
                                    </button>
                                 </div>
                              )}

                              {/* Exercise Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                 {exerciseLibrary.map(exercise => {
                                    const isSelected = selectedExercises.some(e => e.name === exercise.name);
                                    return (
                                       <div
                                          key={exercise.id}
                                          onClick={() => toggleExercise(exercise)}
                                          className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected
                                                ? 'border-blue-500 shadow-lg'
                                                : 'border-gray-200 hover:border-blue-300'
                                             }`}
                                       >
                                          <img
                                             src={exercise.imageUrl}
                                             alt={exercise.name}
                                             className="w-full h-40 object-cover"
                                          />
                                          <div className="p-2 bg-white">
                                             <p className="text-xs font-bold text-gray-800 truncate">{exercise.name}</p>
                                             <p className="text-[10px] text-gray-500">{exercise.category}</p>
                                          </div>
                                          {isSelected && (
                                             <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <i className="fa-solid fa-check text-white text-xs"></i>
                                             </div>
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>

                              {/* Selected Exercises */}
                              {selectedExercises.length > 0 && (
                                 <div className="bg-gray-50 p-4 rounded-xl">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">
                                       Selected Exercises ({selectedExercises.length})
                                    </h5>
                                    <div className="space-y-2">
                                       {selectedExercises.map((ex, idx) => (
                                          <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                             <img src={ex.imageUrl} alt={ex.name} className="w-12 h-12 object-cover rounded-lg" />
                                             <div className="flex-1">
                                                <p className="font-bold text-sm text-gray-800">{ex.name}</p>
                                                <p className="text-xs text-gray-500">
                                                   {ex.sets} sets × {ex.reps} reps
                                                   {ex.isCustom && <span className="ml-2 text-blue-600">(Custom)</span>}
                                                </p>
                                             </div>
                                             <button
                                                onClick={() => setSelectedExercises(selectedExercises.filter((_, i) => i !== idx))}
                                                className="text-red-500 hover:text-red-700"
                                             >
                                                <i className="fa-solid fa-trash text-sm"></i>
                                             </button>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>

                           {/* Notes */}
                           <div>
                              <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Notes</label>
                              <textarea
                                 className="w-full bg-gray-50 rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-200 resize-none"
                                 rows="3"
                                 placeholder="Add any additional instructions..."
                                 value={workoutNotes}
                                 onChange={(e) => setWorkoutNotes(e.target.value)}
                              ></textarea>
                           </div>

                           <button
                              onClick={handleSaveWorkout}
                              className="w-full py-3 bg-[#FEEF75] text-black rounded-xl font-bold cursor-pointer"
                           >
                              Save Workout Plan
                           </button>
                        </div>
                     ) : (
                        /* Diet View */
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                 <i className="fa-solid fa-carrot text-green-500"></i>
                                 Diet Plan for {selectedDate}
                              </h3>
                           </div>

                          

                           {/* Meals */}
                           {/* Meals Section */}
{['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
  <div key={meal} className="space-y-4 mb-10">
    <div className="flex justify-between items-center border-b pb-2">
      <h4 className="font-bold text-xl text-gray-800 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <i className={`fa-solid ${meal === 'Breakfast' ? 'fa-mug-hot' :
            meal === 'Lunch' ? 'fa-bowl-food' :
            meal === 'Snacks' ? 'fa-cookie-bite' : 'fa-utensils'
            }`}></i>
        </span>
        {meal}
      </h4>
      <button
        onClick={() => {
          setCustomFoodMeal(meal); // Set which meal we are adding to
          setShowCustomFood(!showCustomFood); // Toggle form
        }}
        className="text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 shadow-sm transition-all"
      >
        {showCustomFood && customFoodMeal === meal ? 'Cancel' : '+ Add Custom'}
      </button>
    </div>

    {/* --- ADDED THIS SECTION: Custom Food Form --- */}
    {showCustomFood && customFoodMeal === meal && (
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-inner">
        <h5 className="font-bold text-sm text-green-900 mb-3">Add Custom Item to {meal}</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Food name (e.g. Scrambled Eggs)"
            className="sm:col-span-1 bg-white rounded-lg p-2 text-sm border border-green-200"
            value={customFood.name}
            onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Quantity (e.g. 2 eggs)"
            className="bg-white rounded-lg p-2 text-sm border border-green-200"
            value={customFood.quantity}
            onChange={(e) => setCustomFood({ ...customFood, quantity: e.target.value })}
          />
          <select 
            className="bg-white rounded-lg p-2 text-sm border border-green-200"
            value={customFood.type || 'Veg'}
            onChange={(e) => setCustomFood({ ...customFood, type: e.target.value })}
          >
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>
        </div>
        <button
          onClick={addCustomFood}
          className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-all"
        >
          Confirm Add to {meal}
        </button>
      </div>
    )}
    {/* --- END OF ADDED SECTION --- */}

    {/* Food Library Grid */}
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {foodLibrary.map(food => {
        const isSelected = selectedFoods[meal].some(f => f.id === food.id || f.name === food.name);
        return (
          <div
            key={`${meal}-${food.id}`}
            onClick={() => toggleFood(food, meal)}
            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${isSelected ? 'border-green-500 scale-95 shadow-inner' : 'border-transparent hover:border-green-200 bg-white shadow-sm'
              }`}
          >
            <img src={food.imageUrl} alt={food.name} className="w-full h-24 object-cover" />
            <div className="absolute top-1 left-1 bg-white/80 backdrop-blur-sm p-1 rounded shadow-sm">
              <div className={`w-3 h-3 border flex items-center justify-center ${food.type === 'Veg' ? 'border-green-600' : 'border-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${food.type === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
              </div>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-black text-gray-700 truncate uppercase tracking-tighter">
                {food.name}
              </p>
            </div>
            {isSelected && (
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                <div className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-check text-xs"></i>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Selected Items for this Meal */}
    {selectedFoods[meal].length > 0 && (
      <div className="bg-white p-4 rounded-2xl border border-dashed border-green-300">
        <p className="text-[10px] font-bold text-green-600 mb-2 uppercase">Selected for {meal}:</p>
        <div className="flex flex-wrap gap-2">
          {selectedFoods[meal].map((food, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className={`w-2 h-2 rounded-full ${food.type === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs font-bold text-gray-700">{food.name}</span>
              <button
                onClick={() => setSelectedFoods({
                  ...selectedFoods,
                  [meal]: selectedFoods[meal].filter((_, i) => i !== idx)
                })}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
))}

                           {/* Notes */}
                           <div>
                              <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Notes</label>
                              <textarea
                                 className="w-full bg-gray-50 rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-green-200 resize-none"
                                 rows="3"
                                 placeholder="Add dietary notes or restrictions..."
                                 value={dietNotes}
                                 onChange={(e) => setDietNotes(e.target.value)}
                              ></textarea>
                           </div>

                           <button
                              onClick={handleSaveDiet}
                              className="w-full py-3 bg-[#D9F17F] text-black rounded-xl font-bold cursor-pointer "
                           >
                              Save Diet Plan
                           </button>
                        </div>
                     )}
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