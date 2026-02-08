import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const ManageGymSchedule = () => {
  const { api } = useGlobalContext();
  const { colors } = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedDay, setSelectedDay] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data } = await api.get('/schedule');
      setSchedules(data);
    } catch (error) {
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDay) return toast.error("Please select a day");
    
    try {
      await api.put('/schedule', { 
        day: selectedDay, 
        hours: isClosed ? "Closed" : timeRange, 
        isClosed 
      });
      toast.success(`${selectedDay} schedule updated!`);
      // Reset Form
      setSelectedDay("");
      setTimeRange("");
      setIsClosed(false);
      fetchSchedules();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleEditClick = (item) => {
    setSelectedDay(item.day);
    setTimeRange(item.hours === "Closed" ? "" : item.hours);
    setIsClosed(item.isClosed);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* 1. Add/Edit Form Section */}
      <div className="p-8 rounded-3xl shadow-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <h2 className="text-2xl font-black mb-6" style={{ color: colors.text }}>
          {selectedDay ? `Edit ${selectedDay} Schedule` : "Add New Schedule"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Day Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase opacity-60" style={{ color: colors.text }}>Select Day</label>
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-3 rounded-xl border outline-none"
              style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
            >
              <option value="">-- Choose Day --</option>
              {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>

          {/* Time Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase opacity-60" style={{ color: colors.text }}>Timing (e.g. 6am - 10pm)</label>
            <input 
              disabled={isClosed}
              type="text" 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              placeholder="Enter timing"
              className="w-full p-3 rounded-xl border outline-none disabled:opacity-50"
              style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
            />
          </div>

          {/* Closed Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <input 
              type="checkbox" 
              id="isClosed"
              checked={isClosed} 
              onChange={(e) => setIsClosed(e.target.checked)}
              className="w-5 h-5 accent-lime-400"
            />
            <label htmlFor="isClosed" className="text-sm font-bold" style={{ color: colors.text }}>Set as Closed</label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            style={{ backgroundColor: colors.primary, color: '#111' }}
          >
            Save Schedule
          </button>
        </form>
      </div>

      {/* 2. Schedule Table */}
      <div className="p-8 rounded-3xl shadow-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <h2 className="text-xl font-black mb-6" style={{ color: colors.text }}>Current Gym Hours</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: colors.text }}>
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Timing</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item) => (
                <tr key={item.day} className="transition-all hover:scale-[1.01]" style={{ backgroundColor: colors.background }}>
                  <td className="px-4 py-4 rounded-l-xl font-bold" style={{ color: colors.text }}>{item.day}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isClosed ? 'bg-red-100 text-red-600' : 'bg-lime-100 text-lime-700'}`}>
                      {item.hours}
                    </span>
                  </td>
                  <td className="px-4 py-4 rounded-r-xl text-right">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="text-xs font-bold uppercase tracking-tighter hover:underline" 
                      style={{ color: colors.primary }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageGymSchedule;