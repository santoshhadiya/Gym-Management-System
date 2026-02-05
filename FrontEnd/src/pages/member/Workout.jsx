import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Updated to react-hot-toast
import { useTheme } from '../../context/ThemeContext'; // Import Context
import { useGlobalContext } from '../../context/GlobalContext';


const Workout = () => {
    const { BACKEND_URL , loadingIMG } = useGlobalContext();
    const { colors, theme } = useTheme(); // Theme Hook

    const [activeDay, setActiveDay] = useState("Monday");
    const [activeWeek, setActiveWeek] = useState(1);
    const [workoutWeeks, setWorkoutWeeks] = useState([]);
    const [dietWeeks, setDietWeeks] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [weightData, setWeightData] = useState([]);
    const [currentWeight, setCurrentWeight] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("workout");

    const user = JSON.parse(localStorage.getItem("userInfo"));

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
            toast.error("Please enter a valid weight");
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

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center h-screen" style={{ color: colors.textMuted }}>
                <img src={loadingIMG} className='h-20 w-25'/>
            </div>
        )
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>My Fitness Plan</h1>
                    <p className="mt-1" style={{ color: colors.textMuted }}>Last Updated: <span className="font-bold">{lastUpdated}</span></p>
                </div>

                <div className="flex flex-wrap justify-center p-1 rounded-xl" style={{ backgroundColor: theme === 'dark' ? colors.card : '#f3f4f6' }}>
                    {['workout', 'diet', 'weight'].map(tab => {
                        if (tab === 'weight' && activeWeek !== 4) return null;
                        const isActive = activeTab === tab;
                        let activeClass = isActive ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white shadow text-black') : 'text-gray-500';

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeClass}`}
                                style={isActive ? { color: colors.primary } : {}}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Week & Day Selector */}
            <div className="p-4 rounded-[2rem] border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="flex gap-4 items-center mb-4 border-b pb-4 overflow-x-auto" style={{ borderColor: colors.border }}>
                    <span className="text-xs font-bold uppercase whitespace-nowrap" style={{ color: colors.textMuted }}>Week</span>
                    {weeksList.map(wk => (
                        <button
                            key={wk}
                            onClick={() => { setActiveWeek(wk); if (wk !== 4 && activeTab === 'weight') setActiveTab('workout'); }}
                            className={`w-10 h-10 shrink-0 rounded-full text-sm font-bold transition-all`}
                            style={{
                                backgroundColor: activeWeek === wk ? colors.text : (theme === 'dark' ? '#374151' : '#f9fafb'),
                                color: activeWeek === wk ? colors.background : colors.textMuted
                            }}
                        >
                            {wk}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
                                className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center min-w-[80px] relative border`}
                                style={{
                                    backgroundColor: activeDay === day ? colors.text : 'transparent',
                                    color: activeDay === day ? colors.background : colors.textMuted,
                                    borderColor: activeDay === day ? colors.text : colors.border
                                }}
                            >
                                <span>{day.slice(0, 3)}</span>
                                <span className={`text-[10px] font-normal ${activeDay === day ? 'opacity-80' : 'opacity-60'}`}>{dateStr}</span>

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
                    <div
                        className={`rounded-[2.5rem] p-6 md:p-8 border shadow-sm min-h-[400px] transition-colors`}
                        style={{
                            backgroundColor: isCompleted() ? (theme === 'dark' ? 'rgba(6, 78, 59, 0.3)' : '#f0fdf4') : colors.card,
                            borderColor: isCompleted() ? 'green' : colors.border
                        }}
                    >

                        {activeTab === 'weight' ? (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: colors.text }}>
                                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-purple-50 text-purple-600">
                                            <i className="fa-solid fa-weight-scale"></i>
                                        </span>
                                        Weight Tracker
                                    </h2>
                                </div>

                                <div className="p-6 rounded-2xl mb-8 text-center border"
                                    style={{ backgroundColor: theme === 'dark' ? 'rgba(88, 28, 135, 0.2)' : '#faf5ff', borderColor: theme === 'dark' ? '#6b21a8' : '#f3e8ff' }}
                                >
                                    <p className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: theme === 'dark' ? '#d8b4fe' : '#6b21a8' }}>Log Weight for {getDisplayDate()}</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="0.0"
                                            className="text-4xl font-black text-center w-32 py-2 rounded-xl border focus:outline-none focus:ring-4"
                                            style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                                            value={currentWeight}
                                            onChange={(e) => setCurrentWeight(e.target.value)}
                                        />
                                        <span className="text-xl font-bold text-purple-400">kg</span>
                                    </div>
                                    <button onClick={handleWeightSubmit} className="mt-4 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200/50 hover:bg-purple-700 transition-all w-full sm:w-auto">
                                        Save Entry
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm mb-2" style={{ color: colors.text }}>History</h3>
                                    {weightData.map(log => (
                                        <div key={log._id} className="flex justify-between items-center p-3 rounded-xl border"
                                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                        >
                                            <span className="text-sm font-medium" style={{ color: colors.textMuted }}>{new Date(log.date).toLocaleDateString()} (Week {log.weekNumber})</span>
                                            <span className="text-sm font-bold" style={{ color: colors.text }}>{log.weight} kg</span>
                                        </div>
                                    ))}
                                    {weightData.length === 0 && <p className="text-sm text-center" style={{ color: colors.textMuted }}>No weight logs yet.</p>}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-0">
                                    <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: colors.text }}>
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
                                        {workoutDay.calorieTarget > 0 && (
                                            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">
                                                <i className="fa-solid fa-fire"></i> Target: {workoutDay.calorieTarget} kcal
                                            </div>
                                        )}

                                        <div className="prose max-w-none leading-relaxed whitespace-pre-wrap text-base md:text-lg" style={{ color: colors.textMuted }}>
                                            {workoutDay.plan}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Nutrition Stats */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                            {[
                                                { l: 'Cals', v: dietDay?.nutrition?.calories, c: 'orange' },
                                                { l: 'Prot', v: `${dietDay?.nutrition?.protein || 0}g`, c: 'blue' },
                                                { l: 'Carb', v: `${dietDay?.nutrition?.carbs || 0}g`, c: 'green' },
                                                { l: 'Fat', v: `${dietDay?.nutrition?.fat || 0}g`, c: 'yellow' },
                                            ].map((item, i) => (
                                                <div key={i} className={`text-center p-3 rounded-2xl bg-${item.c}-50 dark:bg-${item.c}-900/20`}>
                                                    <p className={`text-xs font-bold text-${item.c}-400 uppercase`}>{item.l}</p>
                                                    <p className={`font-black text-${item.c}-900 dark:text-${item.c}-300`}>{item.v || 0}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                                            <div key={meal} className="p-4 rounded-2xl border"
                                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                            >
                                                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>{meal}</h4>
                                                <p className="text-sm font-medium" style={{ color: colors.text }}>{dietDay?.meals?.[meal] || "-"}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Progress Actions */}
                                <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row gap-4" style={{ borderColor: colors.border }}>
                                    <button
                                        onClick={() => handleMarkProgress(true)}
                                        className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${isCompleted() === true ? 'bg-green-600 shadow-green-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200/50'}`}
                                    >
                                        <i className="fa-solid fa-check mr-2"></i> {isCompleted() === true ? "Done" : "Mark as Done"}
                                    </button>
                                    <button
                                        onClick={() => handleMarkProgress(false)}
                                        className={`flex-1 py-3 border rounded-xl font-bold transition-all ${isCompleted() === false ? 'bg-red-50 text-red-600 border-red-200' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                                        style={isCompleted() !== false ? { backgroundColor: colors.background } : {}}
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
                    <div className="rounded-[2rem] p-6 border shadow-sm"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(254, 240, 138, 0.1)' : '#fffbeb',
                            borderColor: theme === 'dark' ? 'rgba(254, 240, 138, 0.2)' : '#fef9c3'
                        }}
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: theme === 'dark' ? '#fde047' : '#713f12' }}>
                            <i className="fa-regular fa-lightbulb"></i> Daily Tips
                        </h3>
                        <ul className="space-y-3 text-sm" style={{ color: theme === 'dark' ? '#fef08a' : '#854d0e' }}>
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