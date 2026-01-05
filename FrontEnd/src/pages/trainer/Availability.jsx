import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const Availability = () => {
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
  // Initial schedule state
  const [schedule, setSchedule] = useState([
    { day: "Monday", status: "Available", slots: [{ start: "06:00", end: "10:00" }, { start: "17:00", end: "21:00" }] },
    { day: "Tuesday", status: "Available", slots: [{ start: "06:00", end: "10:00" }] },
    { day: "Wednesday", status: "Busy", slots: [], note: "Admin Blocked: Maintenance" },
    { day: "Thursday", status: "Available", slots: [{ start: "07:00", end: "11:00" }, { start: "18:00", end: "20:00" }] },
    { day: "Friday", status: "Available", slots: [{ start: "06:00", end: "10:00" }] },
    { day: "Saturday", status: "Available", slots: [{ start: "08:00", end: "12:00" }] },
    { day: "Sunday", status: "Off", slots: [] },
  ]);

  // --- ACTIONS ---

  const handleStatusChange = (index, newStatus) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].status = newStatus;
    
    // Clear slots if Off or Busy (optional logic depending on requirements)
    if (newStatus === 'Off') {
        updatedSchedule[index].slots = [];
    }
    
    setSchedule(updatedSchedule);
    toast.info(`${updatedSchedule[index].day} marked as ${newStatus}`);
  };

  const addSlot = (index) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].slots.push({ start: "09:00", end: "10:00" }); // Default new slot
    setSchedule(updatedSchedule);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(updatedSchedule);
  };

  const updateSlotTime = (dayIndex, slotIndex, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleSave = () => {
    // Validation: Check for empty slots or invalid ranges if needed
    toast.success("Availability schedule synced with Admin & Booking System!");
  };

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch(status) {
      case "Available": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Busy": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      case "Off": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Manage Availability</h1>
          <p className="text-sm text-gray-500 mt-1">Set your working hours for member bookings.</p>
        </div>
        <button 
           onClick={handleSave}
           className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
        >
           <i className="fa-solid fa-cloud-arrow-up"></i> Publish Schedule
        </button>
      </div>

      {/* --- SCHEDULE GRID --- */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
         
         <div className="space-y-6">
            {schedule.map((day, dayIndex) => (
               <div key={day.day} className={`p-6 rounded-2xl border transition-all ${day.status === 'Off' ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200 shadow-sm'}`}>
                  
                  {/* Day Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                     <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900 w-24">{day.day}</h3>
                        
                        {/* Status Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                           {['Available', 'Busy', 'Off'].map(status => (
                              <button
                                 key={status}
                                 onClick={() => handleStatusChange(dayIndex, status)}
                                 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${day.status === status ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                              >
                                 {status}
                              </button>
                           ))}
                        </div>
                     </div>
                     
                     <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(day.status)}`}>
                        {day.status}
                     </div>
                  </div>

                  {/* Slots Area */}
                  {day.status === 'Available' ? (
                     <div className="pl-0 md:pl-28">
                        <div className="flex flex-wrap gap-3">
                           {day.slots.map((slot, slotIndex) => (
                              <div key={slotIndex} className="flex items-center gap-2 bg-[#f8fbff] p-2 rounded-xl border border-blue-100">
                                 <input 
                                    type="time" 
                                    value={slot.start} 
                                    onChange={(e) => updateSlotTime(dayIndex, slotIndex, 'start', e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                 />
                                 <span className="text-gray-400 text-xs">-</span>
                                 <input 
                                    type="time" 
                                    value={slot.end} 
                                    onChange={(e) => updateSlotTime(dayIndex, slotIndex, 'end', e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                 />
                                 <button 
                                    onClick={() => removeSlot(dayIndex, slotIndex)}
                                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                                 >
                                    <i className="fa-solid fa-xmark text-xs"></i>
                                 </button>
                              </div>
                           ))}
                           
                           <button 
                              onClick={() => addSlot(dayIndex)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-[#CDE7FE] hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs font-bold"
                           >
                              <i className="fa-solid fa-plus"></i> Add Slot
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="pl-0 md:pl-28">
                        {day.note ? (
                           <p className="text-xs text-orange-500 font-medium bg-orange-50 px-3 py-2 rounded-lg inline-block border border-orange-100">
                              <i className="fa-solid fa-lock mr-1"></i> {day.note}
                           </p>
                        ) : (
                           <p className="text-xs text-gray-400 italic">No slots available for booking.</p>
                        )}
                     </div>
                  )}

               </div>
            ))}
         </div>

      </div>

      {/* --- TIPS SECTION --- */}
      <div className="bg-[#fffbeb] rounded-[2rem] p-6 border border-[#FEEF75] flex items-start gap-4">
         <div className="w-10 h-10 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-900 text-xl shrink-0">
            <i className="fa-regular fa-lightbulb"></i>
         </div>
         <div>
            <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wider mb-1">Pro Tip</h3>
            <p className="text-sm text-yellow-800 leading-relaxed">
               Keeping your availability updated helps Members book sessions efficiently and reduces rescheduling conflicts. 
               Remember to mark days off at least 24 hours in advance.
            </p>
         </div>
      </div>

    </div>
  );
};

export default Availability;