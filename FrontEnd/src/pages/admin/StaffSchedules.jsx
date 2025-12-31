import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const StaffSchedules = () => {
  // --- MOCK DATA ---
  const [trainers] = useState([
    { id: 1, name: "Raj Mehta", specialization: "Strength" },
    { id: 2, name: "Sneha Rathi", specialization: "Yoga" },
    { id: 3, name: "Vikram Singh", specialization: "CrossFit" },
  ]);

  const [schedules, setSchedules] = useState([
    { id: 101, trainerId: 1, trainerName: "Raj Mehta", day: "Monday", start: "06:00", end: "14:00", breakStart: "10:00", breakEnd: "10:30", type: "Personal Training", status: "Active" },
    { id: 102, trainerId: 1, trainerName: "Raj Mehta", day: "Tuesday", start: "06:00", end: "14:00", breakStart: "10:00", breakEnd: "10:30", type: "Personal Training", status: "Active" },
    { id: 103, trainerId: 2, trainerName: "Sneha Rathi", day: "Monday", start: "16:00", end: "20:00", breakStart: "18:00", breakEnd: "18:15", type: "Group Class", status: "Active" },
  ]);

  const [leaves, setLeaves] = useState([
    { id: 1, trainerId: 3, trainerName: "Vikram Singh", date: "2024-10-28", reason: "Personal", status: "Approved" }
  ]);

  const [history, setHistory] = useState([]);

  // --- STATE ---
  const [view, setView] = useState("schedules"); // 'schedules', 'leaves', 'history'
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, trainerId: "", day: "Monday", start: "", end: "", breakStart: "", breakEnd: "", type: "General Floor"
  });

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

  // --- HELPERS ---
  const checkConflict = (newSchedule) => {
    return schedules.some(s => 
      s.id !== newSchedule.id && // Ignore self if editing
      s.trainerId === parseInt(newSchedule.trainerId) &&
      s.day === newSchedule.day &&
      (
        (newSchedule.start >= s.start && newSchedule.start < s.end) || // Starts during existing
        (newSchedule.end > s.start && newSchedule.end <= s.end) ||     // Ends during existing
        (newSchedule.start <= s.start && newSchedule.end >= s.end)     // Encompasses existing
      )
    );
  };

  const getTrainerStatus = (schedule) => {
    // Mock logic: assumes 'today' matches the schedule day for demo purposes
    // In real app, check Date().getDay() vs schedule.day
    return "Available"; 
  };

  // --- ACTIONS ---
  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setFormData({ ...schedule });
      setIsEditing(true);
    } else {
      setFormData({ id: null, trainerId: "", day: "Monday", start: "", end: "", breakStart: "", breakEnd: "", type: "General Floor" });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    
    if (checkConflict(formData)) {
      toast.error("Conflict detected! This trainer already has a shift at this time.");
      return;
    }

    const trainer = trainers.find(t => t.id === parseInt(formData.trainerId));
    const newEntry = { ...formData, trainerName: trainer.name, status: "Active" };

    if (isEditing) {
      setSchedules(prev => prev.map(s => s.id === formData.id ? newEntry : s));
      setHistory([...history, { action: "Updated", details: `${trainer.name} on ${formData.day}`, time: new Date().toLocaleString() }]);
      toast.success("Schedule updated successfully.");
    } else {
      setSchedules([...schedules, { ...newEntry, id: Date.now() }]);
      setHistory([...history, { action: "Created", details: `${trainer.name} on ${formData.day}`, time: new Date().toLocaleString() }]);
      toast.success("New shift assigned.");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this schedule?")) {
      const schedule = schedules.find(s => s.id === id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      setHistory([...history, { action: "Deleted", details: `${schedule.trainerName} on ${schedule.day}`, time: new Date().toLocaleString() }]);
      toast.info("Schedule removed.");
    }
  };

  return (
    <div className="w-full bg-white  font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
           <button 
             onClick={() => setView("schedules")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${view === 'schedules' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Active Shifts
           </button>
           <button 
             onClick={() => setView("leaves")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${view === 'leaves' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Leaves
           </button>
           <button 
             onClick={() => setView("history")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${view === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             History
           </button>
        </div>
      </div>

      {/* --- VIEW: SCHEDULES --- */}
      {view === 'schedules' && (
        <>
          <div className="flex justify-end mb-6">
             <button 
               onClick={() => handleOpenModal()}
               className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
             >
               <i className="fa-solid fa-plus"></i> Add Schedule
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {schedules.map(schedule => (
               <div key={schedule.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Decorative Bar */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#CDE7FE]"></div>
                  
                  <div className="pl-4">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h3 className="font-bold text-gray-900 text-lg">{schedule.trainerName}</h3>
                           <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">{schedule.type}</span>
                        </div>
                        <div className="flex gap-1">
                           <button onClick={() => handleOpenModal(schedule)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                              <i className="fa-solid fa-pen text-xs"></i>
                           </button>
                           <button onClick={() => handleDelete(schedule.id)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                              <i className="fa-solid fa-trash text-xs"></i>
                           </button>
                        </div>
                     </div>

                     <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                           <div className="w-8 h-8 rounded-full bg-[#FEEF75]/30 flex items-center justify-center text-yellow-700">
                              <i className="fa-regular fa-calendar"></i>
                           </div>
                           <span className="font-semibold">{schedule.day}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                           <div className="w-8 h-8 rounded-full bg-[#D9F17F]/30 flex items-center justify-center text-green-700">
                              <i className="fa-regular fa-clock"></i>
                           </div>
                           <span>{schedule.start} - {schedule.end}</span>
                        </div>
                        {schedule.breakStart && (
                           <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                 <i className="fa-solid fa-mug-hot"></i>
                              </div>
                              <span className="text-xs text-gray-500">Break: {schedule.breakStart} - {schedule.breakEnd}</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
             ))}
             {schedules.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                   <p>No schedules active. Add a new shift to get started.</p>
                </div>
             )}
          </div>
        </>
      )}

      {/* --- VIEW: LEAVES --- */}
      {view === 'leaves' && (
         <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
               <thead className="bg-[#f8f9fa]">
                  <tr>
                     <th className="px-6 py-4 font-semibold text-gray-900">Trainer</th>
                     <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                     <th className="px-6 py-4 font-semibold text-gray-900">Reason</th>
                     <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {leaves.map(leave => (
                     <tr key={leave.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{leave.trainerName}</td>
                        <td className="px-6 py-4">{leave.date}</td>
                        <td className="px-6 py-4 italic">{leave.reason}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              {leave.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}

      {/* --- VIEW: HISTORY --- */}
      {view === 'history' && (
         <div className="space-y-4">
            {history.length > 0 ? history.map((log, idx) => (
               <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                     ${log.action === 'Created' ? 'bg-green-400' : log.action === 'Deleted' ? 'bg-red-400' : 'bg-blue-400'}`}>
                     <i className={`fa-solid ${log.action === 'Created' ? 'fa-plus' : log.action === 'Deleted' ? 'fa-trash' : 'fa-pen'}`}></i>
                  </div>
                  <div>
                     <p className="text-sm text-gray-900 font-semibold">{log.action} Schedule</p>
                     <p className="text-xs text-gray-500">{log.details}</p>
                  </div>
                  <div className="ml-auto text-xs text-gray-400">{log.time}</div>
               </div>
            )) : <p className="text-center text-gray-400 py-10">No history recorded yet.</p>}
         </div>
      )}

      {/* --- MODAL --- */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{isEditing ? "Edit Schedule" : "Assign Shift"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSaveSchedule} className="p-6">
                  
                  {/* Trainer & Day */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Trainer</label>
                        <select 
                           required 
                           value={formData.trainerId} 
                           onChange={e => setFormData({...formData, trainerId: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                           disabled={isEditing}
                        >
                           <option value="">Select Trainer</option>
                           {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Day</label>
                        <select 
                           required 
                           value={formData.day} 
                           onChange={e => setFormData({...formData, day: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                        >
                           {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                              <option key={d} value={d}>{d}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  {/* Timings */}
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-gray-500 mb-2">Shift Timing</label>
                     <div className="flex gap-4 items-center">
                        <input 
                           type="time" 
                           required 
                           value={formData.start} 
                           onChange={e => setFormData({...formData, start: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer" 
                        />
                        <span className="text-gray-400">to</span>
                        <input 
                           type="time" 
                           required 
                           value={formData.end} 
                           onChange={e => setFormData({...formData, end: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer" 
                        />
                     </div>
                  </div>

                  {/* Breaks */}
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-gray-500 mb-2">Break (Optional)</label>
                     <div className="flex gap-4 items-center">
                        <input 
                           type="time" 
                           value={formData.breakStart} 
                           onChange={e => setFormData({...formData, breakStart: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer" 
                        />
                        <span className="text-gray-400">to</span>
                        <input 
                           type="time" 
                           value={formData.breakEnd} 
                           onChange={e => setFormData({...formData, breakEnd: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer" 
                        />
                     </div>
                  </div>

                  {/* Type */}
                  <div className="mb-6">
                     <label className="block text-xs font-bold text-gray-500 mb-2">Shift Type</label>
                     <div className="flex gap-2">
                        {['General Floor', 'Personal Training', 'Group Class'].map(type => (
                           <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({...formData, type})}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${formData.type === type ? 'bg-[#CDE7FE] text-blue-900 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors cursor-pointer">
                     {isEditing ? "Update Schedule" : "Assign Schedule"}
                  </button>

               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default StaffSchedules;