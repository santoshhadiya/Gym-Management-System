import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const Booking = () => {
  // --- MOCK DATA ---
  const [trainers] = useState([
    { id: 1, name: "Raj Mehta", specialization: "Strength" },
    { id: 2, name: "Sneha Rathi", specialization: "Yoga" },
    { id: 3, name: "Vikram Singh", specialization: "CrossFit" },
  ]);

  const [availability, setAvailability] = useState([
    { time: "06:00 AM", status: "Available" },
    { time: "07:00 AM", status: "Busy" },
    { time: "08:00 AM", status: "Available" },
    { time: "05:00 PM", status: "Available" },
    { time: "06:00 PM", status: "Busy" },
    { time: "07:00 PM", status: "Available" },
  ]);

  const [bookings, setBookings] = useState([
    { id: 1, type: "Personal Training", trainer: "Raj Mehta", date: "2025-08-10", time: "07:00 AM", status: "Approved" },
    { id: 2, type: "Group Class", trainer: "Sneha Rathi", date: "2025-08-12", time: "06:00 PM", status: "Pending" },
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("new"); // 'new', 'upcoming', 'history'
  const [formData, setFormData] = useState({
    type: "Personal Training",
    trainerId: "",
    date: "",
    time: "",
    notes: ""
  });
  
  // Reschedule State
  const [rescheduleData, setRescheduleData] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

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
  const getStatusStyle = (status) => {
    switch(status) {
      case "Approved": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Pending": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
      case "Completed": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  // --- ACTIONS ---
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!formData.trainerId || !formData.date || !formData.time) {
      toast.error("Please fill all fields.");
      return;
    }

    const trainer = trainers.find(t => t.id === parseInt(formData.trainerId));
    
    // Logic: Check availability (mock)
    const slot = availability.find(a => a.time === formData.time); // Simple time match
    // In real app, check specific date+time+trainer availability

    const newBooking = {
      id: Date.now(),
      type: formData.type,
      trainer: trainer.name,
      date: formData.date,
      time: formData.time,
      status: "Pending" // Default to pending for admin approval
    };

    setBookings([newBooking, ...bookings]);
    toast.success("Booking request sent! Waiting for approval.");
    setFormData({ type: "Personal Training", trainerId: "", date: "", time: "", notes: "" });
    setViewState("upcoming");
  };

  const handleCancel = (id) => {
    if(window.confirm("Are you sure you want to cancel this session?")) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Cancelled" } : b));
      toast.info("Booking cancelled.");
    }
  };

  const openReschedule = (booking) => {
    setRescheduleData(booking);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = () => {
     if (!rescheduleData.newDate || !rescheduleData.newTime) {
        toast.warn("Select new date and time.");
        return;
     }
     setBookings(prev => prev.map(b => b.id === rescheduleData.id ? { 
        ...b, 
        date: rescheduleData.newDate, 
        time: rescheduleData.newTime,
        status: "Pending" // Reset to pending for approval
     } : b));
     
     toast.success("Reschedule request sent.");
     setShowRescheduleModal(false);
  };

  // --- FILTERING ---
  const filteredBookings = bookings.filter(b => {
    if (viewState === 'upcoming') return b.status === 'Approved' || b.status === 'Pending';
    if (viewState === 'history') return b.status === 'Completed' || b.status === 'Cancelled';
    return false;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Session Booking</h1>
          <p className="text-gray-500 mt-1">Schedule your training sessions.</p>
        </div>
        
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
           <button 
             onClick={() => setViewState("new")}
             className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'new' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Book New
           </button>
           <button 
             onClick={() => setViewState("upcoming")}
             className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'upcoming' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Upcoming
           </button>
           <button 
             onClick={() => setViewState("history")}
             className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'history' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
           >
             History
           </button>
        </div>
      </div>

      {/* --- NEW BOOKING FORM --- */}
      {viewState === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Form Card */}
           <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <i className="fa-solid fa-calendar-plus text-[#D9F17F]"></i> New Request
              </h2>
              
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Session Type</label>
                       <select 
                          value={formData.type} 
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium"
                       >
                          <option>Personal Training</option>
                          <option>Group Session</option>
                          <option>Yoga Class</option>
                          <option>Consultation</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Trainer</label>
                       <select 
                          value={formData.trainerId} 
                          onChange={(e) => setFormData({...formData, trainerId: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium"
                       >
                          <option value="">Select Trainer</option>
                          {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Date</label>
                       <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium" 
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Preferred Time</label>
                       <input 
                          type="time" 
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium" 
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Notes (Optional)</label>
                    <textarea 
                       rows="2"
                       placeholder="e.g. Focus on legs, recovering from injury..."
                       value={formData.notes}
                       onChange={(e) => setFormData({...formData, notes: e.target.value})}
                       className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium resize-none"
                    ></textarea>
                 </div>

                 <button type="submit" className="w-full py-3.5 bg-[#D9F17F] text-green-900 rounded-xl font-bold hover:bg-green-300 transition-colors shadow-lg hover:shadow-green-500/20">
                    Submit Request
                 </button>
              </form>
           </div>

           {/* Availability Side Panel */}
           <div className="bg-[#f8fbff] p-6 rounded-[2.5rem] border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider">Trainer Availability</h3>
              <p className="text-xs text-gray-500 mb-4">Typical availability for {formData.trainerId ? trainers.find(t=>t.id==formData.trainerId)?.name : "selected trainer"}.</p>
              
              <div className="space-y-3">
                 {availability.map((slot, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                       <span className="text-sm font-bold text-gray-700">{slot.time}</span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded ${slot.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {slot.status}
                       </span>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      )}

      {/* --- UPCOMING / HISTORY LIST --- */}
      {viewState !== 'new' && (
         <div className="space-y-4">
            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
               <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                  
                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{booking.type}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusStyle(booking.status)}`}>
                           {booking.status}
                        </span>
                     </div>
                     <p className="text-sm text-gray-500">
                        <i className="fa-solid fa-user-ninja text-blue-500 mr-1"></i> {booking.trainer}
                     </p>
                  </div>

                  {/* Date/Time */}
                  <div className="text-center bg-gray-50 px-6 py-2 rounded-2xl border border-gray-100">
                     <p className="text-xs text-gray-400 uppercase font-bold">Scheduled For</p>
                     <p className="text-base font-black text-gray-800">{booking.time}</p>
                     <p className="text-xs text-gray-600">{booking.date}</p>
                  </div>

                  {/* Actions */}
                  {viewState === 'upcoming' && (
                     <div className="flex gap-2">
                        <button 
                           onClick={() => openReschedule(booking)}
                           className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" 
                           title="Reschedule"
                        >
                           <i className="fa-regular fa-calendar-days"></i>
                        </button>
                        <button 
                           onClick={() => handleCancel(booking.id)}
                           className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" 
                           title="Cancel"
                        >
                           <i className="fa-solid fa-xmark"></i>
                        </button>
                     </div>
                  )}
               </div>
            )) : (
               <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <i className="fa-regular fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No {viewState} sessions found.</p>
               </div>
            )}
         </div>
      )}

      {/* --- RESCHEDULE MODAL --- */}
      {showRescheduleModal && rescheduleData && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 animate-fade-in">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Reschedule Session</h3>
               <p className="text-sm text-gray-500 mb-4">Requesting change for <strong>{rescheduleData.type}</strong> with {rescheduleData.trainer}.</p>
               
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">New Date</label>
                     <input 
                        type="date" 
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm"
                        onChange={(e) => setRescheduleData({...rescheduleData, newDate: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">New Time</label>
                     <input 
                        type="time" 
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm"
                        onChange={(e) => setRescheduleData({...rescheduleData, newTime: e.target.value})}
                     />
                  </div>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => setShowRescheduleModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={confirmReschedule} className="flex-1 py-2.5 bg-[#FEEF75] text-yellow-900 rounded-xl text-sm font-bold hover:bg-yellow-300">Request Change</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Booking;