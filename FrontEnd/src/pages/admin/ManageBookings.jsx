import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const ManageBooking = () => {
  // --- MOCK DATA ---
  const [trainers] = useState([
    { id: 1, name: "Raj Mehta", type: "Strength" },
    { id: 2, name: "Sneha Rathi", type: "Yoga" },
    { id: 3, name: "Vikram Singh", type: "CrossFit" },
  ]);

  const [members] = useState([
    { id: 101, name: "Riya Patel", plan: "Yearly Elite" },
    { id: 102, name: "Amit Sharma", plan: "Monthly Basic" },
    { id: 103, name: "Arjun Singh", plan: "Quarterly Pro" },
  ]);

  const [bookings, setBookings] = useState([
    { id: 1, memberId: 101, memberName: "Riya Patel", trainerId: 1, trainerName: "Raj Mehta", type: "Personal Training", date: "2025-08-02", time: "07:00", status: "Confirmed", attendance: "Pending" },
    { id: 2, memberId: 102, memberName: "Amit Sharma", trainerId: 3, trainerName: "Vikram Singh", type: "Group Class", date: "2025-08-03", time: "18:00", status: "Pending", attendance: "Pending" },
    { id: 3, memberId: 103, memberName: "Arjun Singh", trainerId: 2, trainerName: "Sneha Rathi", type: "Yoga Session", date: "2025-08-01", time: "06:00", status: "Completed", attendance: "Present" },
  ]);

  // --- STATE ---
  const [view, setView] = useState("upcoming"); // 'upcoming', 'history'
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, memberId: "", trainerId: "", type: "Personal Training", date: "", time: "", status: "Pending"
  });
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(null); // stores booking ID to cancel

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
  const checkConflict = (newBooking) => {
    return bookings.some(b => 
      b.id !== newBooking.id && 
      b.trainerId === parseInt(newBooking.trainerId) &&
      b.date === newBooking.date &&
      b.time === newBooking.time &&
      b.status !== "Cancelled"
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Confirmed": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Pending": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      case "Completed": return "bg-[#CDE7FE] text-blue-900 border-blue-200";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  // --- ACTIONS ---
  const handleOpenModal = (booking = null) => {
    if (booking) {
      setFormData({ ...booking });
      setIsEditing(true);
    } else {
      setFormData({ id: null, memberId: "", trainerId: "", type: "Personal Training", date: "", time: "", status: "Pending" });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();
    
    // 1. Conflict Check
    if (checkConflict(formData)) {
      toast.error("Booking Conflict! This trainer is already booked at this time.");
      return;
    }

    const member = members.find(m => m.id === parseInt(formData.memberId));
    const trainer = trainers.find(t => t.id === parseInt(formData.trainerId));

    const newEntry = { 
      ...formData, 
      memberId: parseInt(formData.memberId),
      trainerId: parseInt(formData.trainerId),
      memberName: member.name, 
      trainerName: trainer.name,
      attendance: isEditing ? formData.attendance : "Pending"
    };

    if (isEditing) {
      setBookings(prev => prev.map(b => b.id === formData.id ? newEntry : b));
      toast.success("Booking rescheduled successfully.");
    } else {
      setBookings([...bookings, { ...newEntry, id: Date.now() }]);
      toast.success(`Session booked for ${member.name}.`);
    }
    setShowModal(false);
  };

  const updateStatus = (id, newStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    
    const msg = newStatus === 'Confirmed' ? "Booking Confirmed & Slot Locked." : `Booking marked as ${newStatus}.`;
    toast.info(msg);
  };

  const handleCancelBooking = () => {
    if (!cancelReason) {
      toast.warn("Please provide a reason for cancellation.");
      return;
    }
    setBookings(prev => prev.map(b => b.id === showCancelModal ? { ...b, status: "Cancelled", cancelReason } : b));
    toast.error("Booking Cancelled.");
    setShowCancelModal(null);
    setCancelReason("");
  };

  const toggleAttendance = (id, currentVal) => {
    const newVal = currentVal === "Present" ? "Absent" : "Present";
    setBookings(prev => prev.map(b => b.id === id ? { ...b, attendance: newVal, status: "Completed" } : b));
    toast.success(`Attendance marked: ${newVal}`);
  };

  // --- FILTERING ---
  const filteredBookings = bookings.filter(b => {
    if (view === 'upcoming') return b.status !== "Cancelled" && b.status !== "Completed";
    if (view === 'history') return b.status === "Cancelled" || b.status === "Completed";
    return true;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule PT sessions, classes, and track attendance.</p>
        </div>
        
        <div className="flex gap-3">
           <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setView("upcoming")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${view === 'upcoming' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setView("history")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${view === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                History
              </button>
           </div>
           
           <button 
             onClick={() => handleOpenModal()}
             className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
           >
             <i className="fa-solid fa-plus"></i> New Booking
           </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Session Details</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Member & Trainer</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
              {view === 'history' && <th className="px-6 py-4 font-semibold text-gray-900 text-center">Attendance</th>}
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBookings.length > 0 ? filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{b.type}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                         <i className="fa-regular fa-calendar"></i> {b.date} 
                         <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <i className="fa-regular fa-clock"></i> {b.time}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <i className="fa-solid fa-user text-gray-400 text-xs"></i> 
                         <span className="text-gray-900 font-medium">{b.memberName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                         <i className="fa-solid fa-dumbbell text-gray-400 text-[10px]"></i> 
                         <span>{b.trainerName}</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(b.status)}`}>
                      {b.status}
                   </span>
                </td>
                
                {view === 'history' && (
                   <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleAttendance(b.id, b.attendance)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer transition-colors ${b.attendance === 'Present' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                      >
                         {b.attendance === 'Pending' ? 'Mark Attendance' : b.attendance}
                      </button>
                   </td>
                )}

                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      {b.status === 'Pending' && (
                         <button onClick={() => updateStatus(b.id, "Confirmed")} className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors cursor-pointer" title="Confirm">
                            <i className="fa-solid fa-check"></i>
                         </button>
                      )}
                      
                      {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                         <>
                            <button onClick={() => handleOpenModal(b)} className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer" title="Reschedule">
                               <i className="fa-regular fa-calendar-days"></i>
                            </button>
                            <button onClick={() => setShowCancelModal(b.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors cursor-pointer" title="Cancel">
                               <i className="fa-solid fa-xmark"></i>
                            </button>
                         </>
                      )}
                   </div>
                </td>
              </tr>
            )) : (
               <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                     <p>No bookings found.</p>
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{isEditing ? "Reschedule Session" : "New Booking"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSaveBooking} className="p-6">
                  
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Member</label>
                        <select 
                           required 
                           value={formData.memberId} 
                           onChange={e => setFormData({...formData, memberId: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                           disabled={isEditing}
                        >
                           <option value="">Select Member</option>
                           {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Trainer</label>
                        <select 
                           required 
                           value={formData.trainerId} 
                           onChange={e => setFormData({...formData, trainerId: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                        >
                           <option value="">Select Trainer</option>
                           {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
                        </select>
                     </div>
                  </div>

                  {/* Type */}
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-gray-500 mb-2">Session Type</label>
                     <div className="flex gap-2">
                        {['Personal Training', 'Group Class', 'Yoga Session', 'Consultation'].map(type => (
                           <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({...formData, type})}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${formData.type === type ? 'bg-[#CDE7FE] text-blue-900 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Date</label>
                        <input 
                           type="date" 
                           required 
                           value={formData.date} 
                           onChange={e => setFormData({...formData, date: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer" 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Time</label>
                        <input 
                           type="time" 
                           required 
                           value={formData.time} 
                           onChange={e => setFormData({...formData, time: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer" 
                        />
                     </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors cursor-pointer">
                     {isEditing ? "Update Booking" : "Confirm Booking"}
                  </button>

               </form>
            </div>
         </div>
      )}

      {/* --- CANCEL MODAL --- */}
      {showCancelModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Session?</h3>
               <p className="text-sm text-gray-500 mb-4">This action cannot be undone. Please provide a reason.</p>
               
               <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-300 mb-4 h-24 resize-none"
                  placeholder="e.g. Member requested, Trainer unavailable..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
               ></textarea>
               
               <div className="flex gap-3">
                  <button 
                    onClick={() => { setShowCancelModal(null); setCancelReason(""); }}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Keep Session
                  </button>
                  <button 
                    onClick={handleCancelBooking}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm cursor-pointer"
                  >
                    Confirm Cancel
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default ManageBooking;