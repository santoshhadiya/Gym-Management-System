import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalContext } from '../../context/GlobalContext';

const Workout = () => {
    const { BACKEND_URL, loadingIMG } = useGlobalContext();
    const { colors, theme } = useTheme();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [dietPlan, setDietPlan] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [weightData, setWeightData] = useState([]);
    const [currentWeight, setCurrentWeight] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("workout");
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    
    // Calendar
    const [calendarDates, setCalendarDates] = useState([]);

    const user = JSON.parse(localStorage.getItem("userInfo"));
    const today = new Date().toISOString().split('T')[0];

    // Fetch Plan
    const fetchPlan = async () => {
        try {
            setLoading(true);
            const token = user?.token;

            const res = await fetch(`${BACKEND_URL}/api/workout-diet/my/plan`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to load plan");

            const data = await res.json();
            
            // Find plan for selected date
            const workout = data.workout?.plans?.find(p => p.date === selectedDate);
            const diet = data.diet?.plans?.find(p => p.date === selectedDate);
            
            setWorkoutPlan(workout || null);
            setDietPlan(diet || null);
            setProgressData(data.progress || []);
            setWeightData(data.weightHistory || []);

        } catch (err) {
            console.error(err);
            toast.error("Could not load your plan");
        } finally {
            setLoading(false);
        }
    };

    // Fetch History
    const fetchHistory = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/workout-diet/history`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (!res.ok) throw new Error("Failed to load history");
            
            const data = await res.json();
            setHistory(data.history || []);
        } catch (err) {
            console.error(err);
            toast.error("Could not load history");
        }
    };

    useEffect(() => {
        fetchPlan();
        fetchHistory();
        generateCalendarDates();
    }, []);

    useEffect(() => {
        fetchPlan();
    }, [selectedDate]);

    const generateCalendarDates = () => {
        const dates = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Show last 7 days
        
        // Generate 21 days (7 past + today + 13 future)
        for (let i = 0; i < 21; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push({
                date: date.toISOString().split('T')[0],
                display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isToday: date.toISOString().split('T')[0] === today,
                isPast: date.toISOString().split('T')[0] < today
            });
        }
        setCalendarDates(dates);
    };

    // Get progress for selected date
    const getProgressForDate = () => {
        return progressData.find(p => p.date === selectedDate);
    };

    const isCompleted = () => {
        const progress = getProgressForDate();
        if (!progress) return null;
        return activeTab === 'workout' ? progress.workoutCompleted : progress.dietCompleted;
    };

    // STRICT DATE VALIDATION
    const canMarkComplete = () => {
        return selectedDate === today;
    };

    const handleMarkProgress = async (status) => {
        if (!canMarkComplete()) {
            toast.error(`You can only mark plans as complete on their scheduled date (${selectedDate}). Today is ${today}.`);
            return;
        }

        try {
            const payload = {
                date: selectedDate,
                type: activeTab,
                status: status
            };

            const res = await fetch(`${BACKEND_URL}/api/workout-diet/progress`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.canComplete === false) {
                    toast.error(data.message);
                    return;
                }
                throw new Error("Update failed");
            }

            toast.success(`${activeTab === 'workout' ? 'Workout' : 'Diet'} marked for ${selectedDate}`);
            fetchPlan();
            fetchHistory();

        } catch (err) {
            toast.error("Failed to update progress");
        }
    };

    const handleWeightSubmit = async () => {
        if (!currentWeight || isNaN(currentWeight)) {
            toast.error("Please enter a valid weight");
            return;
        }

        try {
            const payload = {
                date: today,
                weight: parseFloat(currentWeight)
            };

            const res = await fetch(`${BACKEND_URL}/api/workout-diet/weight`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save weight");

            toast.success("Weight logged successfully!");
            setCurrentWeight("");
            fetchPlan();

        } catch (err) {
            toast.error("Failed to log weight");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <img src={loadingIMG} alt="Loading..." className="w-16 h-16" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-black mb-2" style={{ color: colors.text }}>
                    My Fitness Plan
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowHistory(false)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            !showHistory 
                                ? 'bg-[#D9F17F] text-black shadow-lg' 
                                : 'bg-gray-100 text-black'
                        }`}
                    >
                        Daily Plan
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            showHistory 
                                ? 'bg-[#FEF18A] text-black shadow-lg' 
                                : 'bg-gray-100 text-black'
                        }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {showHistory ? (
                /* History View */
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-black mb-6" style={{ color: colors.text }}>
                        <i className="fa-solid fa-clock-rotate-left mr-2 text-[#FEF18A]"></i>
                        Complete History
                    </h2>

                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <i className="fa-solid fa-calendar-xmark text-5xl mb-4"></i>
                            <p className="font-medium">No history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item, idx) => {
                                const dateObj = new Date(item.date);
                                const isPast = item.date < today;
                                const isFuture = item.date > today;
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className="border rounded-2xl p-5 hover:shadow-md transition-shadow"
                                        style={{ 
                                            borderColor: colors.border,
                                            backgroundColor: colors.background 
                                        }}
                                    >
                                        {/* Date Header */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                                                    {dateObj.toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        month: 'long', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {item.date === today ? '🔵 Today' : 
                                                     isPast ? '⚪ Past' : 
                                                     '🟢 Upcoming'}
                                                </p>
                                            </div>
                                            
                                            {/* Status Badges */}
                                            <div className="flex gap-2">
                                                {item.exercises && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        item.isCompleted 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : isPast 
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-black'
                                                    }`}>
                                                        <i className="fa-solid fa-dumbbell mr-1"></i>
                                                        {item.isCompleted ? 'Done' : isPast ? 'Missed' : 'Pending'}
                                                    </span>
                                                )}
                                                {item.dietMeals && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        item.dietCompleted 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : isPast 
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-black'
                                                    }`}>
                                                        <i className="fa-solid fa-carrot mr-1"></i>
                                                        {item.dietCompleted ? 'Done' : isPast ? 'Missed' : 'Pending'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Workout Details */}
                                        {item.exercises && item.exercises.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="font-bold text-sm text-[#D9F17F] mb-2 flex items-center gap-2">
                                                    <i className="fa-solid fa-dumbbell"></i>
                                                    Workout ({item.exercises.length} exercises)
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {item.exercises.map((ex, i) => (
                                                        <div key={i} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                                                            <img 
                                                                src={ex.imageUrl} 
                                                                alt={ex.name}
                                                                className="w-10 h-10 object-cover rounded-lg"
                                                            />
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-800">{ex.name}</p>
                                                                <p className="text-[10px] text-gray-500">
                                                                    {ex.sets}×{ex.reps}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Diet Details */}
                                        {item.dietMeals && (
                                            <div>
                                                <h4 className="font-bold text-sm text-[#D9F17F] mb-2 flex items-center gap-2">
                                                    <i className="fa-solid fa-carrot"></i>
                                                    Diet Plan
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => {
                                                        const foods = item.dietMeals[meal] || [];
                                                        if (foods.length === 0) return null;
                                                        
                                                        return (
                                                            <div key={meal} className="bg-green-50 p-2 rounded-lg">
                                                                <p className="text-[10px] font-bold text-green-700 uppercase mb-1">
                                                                    {meal}
                                                                </p>
                                                                <div className="space-y-1">
                                                                    {foods.map((food, i) => (
                                                                        <div key={i} className="flex items-center gap-1">
                                                                            <img 
                                                                                src={food.imageUrl} 
                                                                                alt={food.name}
                                                                                className="w-6 h-6 object-cover rounded"
                                                                            />
                                                                            <p className="text-[10px] text-gray-700 truncate">
                                                                                {food.name}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Daily Plan View */
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Selector */}
                        <div className="bg-white rounded-xl ">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Select Date</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {calendarDates.map(dateObj => (
                                    <button
                                        key={dateObj.date}
                                        onClick={() => setSelectedDate(dateObj.date)}
                                        className={`min-w-[80px] px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                                            selectedDate === dateObj.date
                                                ? 'bg-[#D9F17F] text-black shadow-lg'
                                                : dateObj.isToday
                                                    ? 'bg-blue-50 text-[#D9F17F] border-2 border-blue-200'
                                                    : dateObj.isPast
                                                        ? 'bg-gray-100 text-gray-400'
                                                        : 'bg-gray-50 text-black hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] opacity-70">{dateObj.dayName}</span>
                                            <span>{dateObj.display}</span>
                                            {dateObj.isToday && <span className="text-[8px]">Today</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                                <button
                                    onClick={() => setActiveTab('workout')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                        activeTab === 'workout'
                                            ? 'bg-white shadow text-[#D9F17F]'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <i className="fa-solid fa-dumbbell mr-2"></i>
                                    Workout
                                </button>
                                <button
                                    onClick={() => setActiveTab('diet')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                        activeTab === 'diet'
                                            ? 'bg-white shadow text-[#D9F17F]'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <i className="fa-solid fa-carrot mr-2"></i>
                                    Diet
                                </button>
                            </div>

                            {/* Content */}
                            {activeTab === 'workout' ? (
                                workoutPlan ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                                                Workout for {new Date(selectedDate).toLocaleDateString('en-US', { 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </h2>
                                            {isCompleted() !== null && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    isCompleted() 
                                                        ? 'bg-green-200 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {isCompleted() ? "✓ Completed" : "✗ Missed"}
                                                </span>
                                            )}
                                        </div>

                                        {workoutPlan.calorieTarget > 0 && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100">
                                                <i className="fa-solid fa-fire"></i>
                                                Target: {workoutPlan.calorieTarget} kcal
                                            </div>
                                        )}

                                        {/* Exercises */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {workoutPlan.exercises.map((ex, idx) => (
                                                <div key={idx} className="flex gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <img 
                                                        src={ex.imageUrl} 
                                                        alt={ex.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-800">{ex.name}</h4>
                                                        <p className="text-sm text-black mt-1">
                                                            {ex.sets} sets × {ex.reps} reps
                                                        </p>
                                                        {ex.isCustom && (
                                                            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {workoutPlan.notes && (
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                                <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Notes</p>
                                                <p className="text-sm text-gray-700">{workoutPlan.notes}</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {!canMarkComplete() && (
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                                                <p className="text-sm text-black">
                                                    <i className="fa-solid fa-lock mr-2"></i>
                                                    You can only mark this plan as complete on <strong>{selectedDate}</strong>
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                                            <button
                                                onClick={() => handleMarkProgress(true)}
                                                disabled={!canMarkComplete()}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                                    !canMarkComplete()
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isCompleted() === true
                                                            ? 'bg-[#D9F17F] text-black shadow-lg'
                                                            : 'bg-green-500 hover:bg-[#D9F17F] text-black shadow-lg'
                                                }`}
                                            >
                                                <i className="fa-solid fa-check mr-2"></i>
                                                {isCompleted() === true ? "Completed" : "Mark as Done"}
                                            </button>
                                            <button
                                                onClick={() => handleMarkProgress(false)}
                                                disabled={!canMarkComplete()}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                                                    !canMarkComplete()
                                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isCompleted() === false
                                                            ? 'bg-red-50 text-red-600 border-red-300'
                                                            : 'border-red-200 text-red-500 hover:bg-red-50'
                                                }`}
                                            >
                                                <i className="fa-solid fa-xmark mr-2"></i>
                                                {isCompleted() === false ? "Marked Missed" : "Not Done"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <i className="fa-solid fa-calendar-xmark text-5xl mb-4"></i>
                                        <p className="font-medium">No workout plan for this date</p>
                                    </div>
                                )
                            ) : (
                                dietPlan ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                                                Diet for {new Date(selectedDate).toLocaleDateString('en-US', { 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </h2>
                                            {isCompleted() !== null && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    isCompleted() 
                                                        ? 'bg-green-200 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {isCompleted() ? "✓ Completed" : "✗ Missed"}
                                                </span>
                                            )}
                                        </div>

                                        {/* Nutrition Stats */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { l: 'Calories', v: dietPlan.nutrition?.calories || 0, c: 'orange' },
                                                { l: 'Protein', v: `${dietPlan.nutrition?.protein || 0}g`, c: 'blue' },
                                                { l: 'Carbs', v: `${dietPlan.nutrition?.carbs || 0}g`, c: 'green' },
                                                { l: 'Fat', v: `${dietPlan.nutrition?.fat || 0}g`, c: 'yellow' },
                                            ].map((item, i) => (
                                                <div key={i} className={`text-center p-3 rounded-2xl bg-${item.c}-50`}>
                                                    <p className={`text-xs font-bold text-${item.c}-600 uppercase`}>{item.l}</p>
                                                    <p className={`text-xl font-black text-${item.c}-900 mt-1`}>{item.v}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Meals */}
                                        <div className="space-y-4">
                                            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => {
                                                const foods = dietPlan.meals[meal] || [];
                                                if (foods.length === 0) return null;

                                                return (
                                                    <div key={meal} className="bg-green-50 p-4 rounded-xl border border-green-100">
                                                        <h4 className="text-sm font-bold text-green-700 uppercase mb-3 flex items-center gap-2">
                                                            <i className={`fa-solid ${
                                                                meal === 'Breakfast' ? 'fa-mug-hot' :
                                                                meal === 'Lunch' ? 'fa-bowl-food' :
                                                                meal === 'Snacks' ? 'fa-cookie-bite' :
                                                                'fa-utensils'
                                                            }`}></i>
                                                            {meal}
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {foods.map((food, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                                    <img 
                                                                        src={food.imageUrl} 
                                                                        alt={food.name}
                                                                        className="w-12 h-12 object-cover rounded-lg"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-bold text-gray-800">{food.name}</p>
                                                                        <p className="text-[10px] text-gray-500">{food.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {dietPlan.notes && (
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                                <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Notes</p>
                                                <p className="text-sm text-gray-700">{dietPlan.notes}</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {!canMarkComplete() && (
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                                                <p className="text-sm text-black">
                                                    <i className="fa-solid fa-lock mr-2"></i>
                                                    You can only mark this plan as complete on <strong>{selectedDate}</strong>
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                                            <button
                                                onClick={() => handleMarkProgress(true)}
                                                disabled={!canMarkComplete()}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                                    !canMarkComplete()
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isCompleted() === true
                                                            ? 'bg-[#D9F17F] text-black shadow-lg'
                                                            : 'bg-green-500 hover:bg-[#D9F17F] text-black shadow-lg'
                                                }`}
                                            >
                                                <i className="fa-solid fa-check mr-2"></i>
                                                {isCompleted() === true ? "Completed" : "Mark as Done"}
                                            </button>
                                            <button
                                                onClick={() => handleMarkProgress(false)}
                                                disabled={!canMarkComplete()}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                                                    !canMarkComplete()
                                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isCompleted() === false
                                                            ? 'bg-red-50 text-red-600 border-red-300'
                                                            : 'border-red-200 text-red-500 hover:bg-red-50'
                                                }`}
                                            >
                                                <i className="fa-solid fa-xmark mr-2"></i>
                                                {isCompleted() === false ? "Marked Missed" : "Not Done"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <i className="fa-solid fa-calendar-xmark text-5xl mb-4"></i>
                                        <p className="font-medium">No diet plan for this date</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 md:flex gap-6 ">
                        {/* Weight Tracker */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm w-full">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                                <i className="fa-solid fa-weight-scale text-[#FEF18A]"></i>
                                Weight Tracker
                            </h2>

                            <div className=" p-4 rounded-2xl mb-4 text-center border border-[#FEF18A] ">
                                <p className="text-xs font-bold text-black uppercase mb-2">Log Today's Weight</p>
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        className="text-3xl font-black text-center w-28 py-2 rounded-xl border-2 border-[#FEF18A] focus:outline-none focus:ring-4 focus:ring-[#FEF18A]"
                                        value={currentWeight}
                                        onChange={(e) => setCurrentWeight(e.target.value)}
                                    />
                                    <span className="text-lg font-bold text-[#FEF18A]">kg</span>
                                </div>
                                <button 
                                    onClick={handleWeightSubmit} 
                                    className="mt-3 w-full px-6 py-2 bg-[#FEF18A] text-black rounded-xl font-bold shadow-lg hover:bg-[#FEF18A] transition-all"
                                >
                                    Save Entry
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-xs text-gray-400 uppercase">Recent Logs</h3>
                                {weightData.slice(0, 5).map(log => (
                                    <div key={log._id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                                        <span className="text-xs text-black">
                                            {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800">{log.weight} kg</span>
                                    </div>
                                ))}
                                {weightData.length === 0 && (
                                    <p className="text-xs text-center text-gray-400 py-2">No weight logs yet</p>
                                )}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 shadow-sm w-full">
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-yellow-900">
                                <i className="fa-regular fa-lightbulb"></i>
                                Daily Tips
                            </h3>
                            <ul className="space-y-2 text-sm text-yellow-800">
                                <li className="flex gap-2 items-start">
                                    <i className="fa-solid fa-check mt-0.5 text-yellow-600"></i>
                                    Consistency beats intensity
                                </li>
                                <li className="flex gap-2 items-start">
                                    <i className="fa-solid fa-check mt-0.5 text-yellow-600"></i>
                                    Track your macros daily
                                </li>
                                <li className="flex gap-2 items-start">
                                    <i className="fa-solid fa-check mt-0.5 text-yellow-600"></i>
                                    Sleep is when muscles grow
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workout;