import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";


const UpdateSessions = () => {
   const { api } = useGlobalContext()
   // --- STATE ---
   const [sessions, setSessions] = useState([]);
   const [trainers, setTrainers] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // UI State
   const [viewState, setViewState] = useState("list"); // 'list', 'history'
   const [showModal, setShowModal] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("All");

   // Bulk Selection
   const [selectedIds, setSelectedIds] = useState([]);

   // Form State
   const [formData, setFormData] = useState({
      _id: null, trainerId: "", type: "Personal Training",
      date: "", time: "", duration: "60 mins", status: "Upcoming", notes: "",
      capacity: 10 // Default capacity
   });

   // Cancel Modal State
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [cancelReason, setCancelReason] = useState("");
   const [sessionToCancel, setSessionToCancel] = useState(null);

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

   // --- FETCH DATA ---
   const fetchData = async () => {
      try {
         setIsLoading(true);
         const [sRes, tRes] = await Promise.all([
            api.get("/sessions"),
            api.get("/trainers")
         ]);
         setSessions(sRes.data);
         setTrainers(tRes.data);
      } catch (e) {
         toast.error("Failed to load data");
         console.error(e);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   // --- HELPERS ---
   const getStatusColor = (status) => {
      switch (status) {
         case "Upcoming": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
         case "Completed": return "bg-[#D9F17F] text-green-900 border-green-200";
         case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
         default: return "bg-gray-100 text-gray-600";
      }
   };

   const checkConflict = (newSession) => {
      return sessions.some(s =>
         s._id !== newSession._id &&
         s.trainer?._id === newSession.trainerId &&
         s.date === newSession.date &&
         s.time === newSession.time &&
         s.status !== "Cancelled"
      );
   };

   // --- ACTIONS ---
   const handleOpenModal = (session = null) => {
      if (session) {
         // Map nested objects back to form IDs for editing
         setFormData({
            ...session,
            trainerId: session.trainer?._id || "",
            capacity: session.capacity || 10
         });
         setIsEditing(true);
      } else {
         const today = new Date().toISOString().split('T')[0];
         setFormData({
            _id: null, trainerId: "", type: "Personal Training",
            date: today, time: "", duration: "60 mins", status: "Upcoming", notes: "",
            capacity: 10
         });
         setIsEditing(false);
      }
      setShowModal(true);
   };

   const handleSave = async (e) => {
      e.preventDefault();
      if (!formData.trainerId || !formData.date || !formData.time) {
         toast.error("Please fill all required fields.");
         return;
      }

      // Conflict Check
      if (checkConflict(formData)) {
         toast.error("Schedule Conflict: Trainer is busy at this time!");
         return;
      }

      // Prepare payload for backend (DB fields only)
      const payload = {
         trainer: formData.trainerId,   // ✅ REQUIRED BY BACKEND
         type: formData.type,
         date: formData.date,
         time: formData.time,
         duration: formData.duration,
         status: formData.status,
         notes: formData.notes,
         capacity: Number(formData.capacity),
      };

      try {
         if (isEditing) {
            await api.put(`/sessions/${formData._id}`, payload);
            toast.success("Session updated successfully.");
         } else {
            await api.post("/sessions", payload);
            toast.success("New session scheduled.");
         }
         setShowModal(false);
         fetchData(); // Refresh data from backend
      } catch (error) {
         console.error(error);
         toast.error("Failed to save session.");
      }
   };

   const handleBooking = async (sessionId) => {
      try {
         await api.post(`/session-bookings/${sessionId}`);
         toast.success("Booking confirmed!");
         fetchData();
      } catch (error) {
         console.error(error);
         toast.error("Booking failed");
      }
   };

   const initiateCancel = (id) => {
      setSessionToCancel(id);
      setShowCancelModal(true);
   };

   const confirmCancel = async () => {
      if (!cancelReason) {
         toast.warn("Please enter a reason.");
         return;
      }

      try {
         // ✅ FIX: Only send status and reason, not full object
         await api.put(`/sessions/${sessionToCancel}`, {
            status: "Cancelled",
            cancelReason: cancelReason
         });

         toast.error("Session cancelled.");
         setShowCancelModal(false);
         setCancelReason("");
         setSessionToCancel(null);
         fetchData();
      } catch (error) {
         toast.error("Failed to cancel session.");
      }
   };

   const handleBulkComplete = async () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`Mark ${selectedIds.length} sessions as Completed?`)) {
         try {
            // In real app, this might be a single bulk endpoint or Promise.all
            await Promise.all(selectedIds.map(id => {
               // ✅ FIX: Only send status update
               return api.put(`/sessions/${id}`, { status: "Completed" });
            }));

            toast.success("Bulk update successful.");
            setSelectedIds([]);
            fetchData();
         } catch (error) {
            toast.error("Bulk update failed.");
         }
      }
   };

   const toggleSelection = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };

   // --- FILTERING ---
   const filteredSessions = sessions.filter(s => {
      const matchesSearch = s.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "All" || s.status === filterStatus;

      // View logic
      if (viewState === 'list') return matchesSearch && matchesFilter && s.status !== 'Cancelled';
      return matchesSearch && matchesFilter; // History shows all
   });

   return (
      <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Manage Sessions</h1>
               <p className="text-sm text-gray-500 mt-1">Schedule, track, and modify training sessions.</p>
            </div>

            <div className="flex gap-3">
               <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  <button
                     onClick={() => setViewState("list")}
                     className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     Active
                  </button>
                  <button
                     onClick={() => setViewState("history")}
                     className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     History
                  </button>
               </div>

               <button
                  onClick={() => handleOpenModal()}
                  className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
               >
                  <i className="fa-solid fa-plus"></i> New Session
               </button>
            </div>
         </div>

         {isLoading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
            </div>
         ) : (
            <>
               {/* FILTERS & BULK ACTIONS */}
               <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3 flex-grow">
                     <div className="relative w-full max-w-xs">
                        <input
                           type="text"
                           placeholder="Search Trainer..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                        />
                        <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                     </div>

                     <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                     >
                        <option value="All">All Status</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                     </select>
                  </div>

                  {selectedIds.length > 0 && (
                     <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-5">
                        <span className="text-xs font-bold text-gray-500">{selectedIds.length} selected</span>
                        <button
                           onClick={handleBulkComplete}
                           className="px-4 py-2 bg-[#CDE7FE] text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-200 transition-colors shadow-sm cursor-pointer"
                        >
                           Mark Completed
                        </button>
                     </div>
                  )}
               </div>

               {/* TABLE */}
               <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                     <thead className="bg-[#f8f9fa]">
                        <tr>
                           <th className="px-6 py-4 w-10">
                              <input
                                 type="checkbox"
                                 onChange={(e) => setSelectedIds(e.target.checked ? filteredSessions.map(s => s._id) : [])}
                                 checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0}
                                 className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                           </th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Session Info</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Trainer</th>
                           <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>

                           <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredSessions.length > 0 ? filteredSessions.map((s) => (
                           <tr key={s._id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(s._id) ? 'bg-blue-50/30' : ''}`}>
                              <td className="px-6 py-4">
                                 <input
                                    type="checkbox"
                                    checked={selectedIds.includes(s._id)}
                                    onChange={() => toggleSelection(s._id)}
                                    className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                 />
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">{s.type}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                       <i className="fa-regular fa-calendar"></i> {s.date}
                                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                       <i className="fa-regular fa-clock"></i> {s.time} ({s.duration})
                                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                       <span className="font-bold text-blue-600">Cap: {s.capacity || 10}</span>
                                    </span>
                                    {s.notes && <span className="text-[10px] text-blue-500 mt-1 italic">Note: {s.notes}</span>}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                       <i className="fa-solid fa-user text-gray-400 text-xs"></i>
                                       <span className="text-gray-900 font-medium">{s.trainer?.name}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(s.status)}`}>
                                    {s.status}
                                 </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                 <div className="flex justify-end gap-2">


                                    <button onClick={() => handleOpenModal(s)} className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer" title="Edit / Note">
                                       <i className="fa-solid fa-pen text-xs"></i>
                                    </button>
                                    {s.status === 'Upcoming' && (
                                       <button onClick={() => initiateCancel(s._id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors cursor-pointer" title="Cancel">
                                          <i className="fa-solid fa-ban text-xs"></i>
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                 <p>No sessions found.</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </>
         )}

         {/* --- ADD/EDIT MODAL --- */}
         {showModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-900">{isEditing ? "Update Session" : "Schedule Session"}</h3>
                     <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <i className="fa-solid fa-xmark text-lg"></i>
                     </button>
                  </div>

                  <form onSubmit={handleSave} className="p-6">

                     {/* Selectors */}
                     <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2">Trainer</label>
                           <select
                              required
                              value={formData.trainerId}
                              onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                           >
                              <option value="">Select Trainer</option>
                              {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                           </select>
                        </div>
                     </div>

                     {/* Type & Duration */}
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2">Session Type</label>
                           <input
                              type="text"
                              value={formData.type}
                              onChange={e => setFormData({ ...formData, type: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                              placeholder="Personal Training"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2">Duration</label>
                           <input
                              type="text"
                              value={formData.duration}
                              onChange={e => setFormData({ ...formData, duration: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                              placeholder="e.g. 60 mins"
                           />
                        </div>
                     </div>

                     {/* Capacity */}
                     <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Capacity (Max Participants)</label>
                        <input
                           type="number"
                           min="1"
                           value={formData.capacity}
                           onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                           placeholder="10"
                        />
                     </div>

                     {/* Date & Time */}
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2">Date</label>
                           <input
                              type="date"
                              required
                              value={formData.date}
                              onChange={e => setFormData({ ...formData, date: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2">Time</label>
                           <input
                              type="time"
                              required
                              value={formData.time}
                              onChange={e => setFormData({ ...formData, time: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                           />
                        </div>
                     </div>

                     {/* Notes */}
                     <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Session Notes / Instructions</label>
                        <textarea
                           rows="3"
                           value={formData.notes}
                           onChange={e => setFormData({ ...formData, notes: e.target.value })}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm resize-none"
                           placeholder="e.g. Focus on cardio, Leg injury recovery..."
                        ></textarea>
                     </div>

                     <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors cursor-pointer">
                        {isEditing ? "Update Session" : "Schedule Session"}
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
                  <p className="text-sm text-gray-500 mb-4">Please provide a reason for cancellation. This will notify the member.</p>

                  <textarea
                     className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-300 mb-4 h-24 resize-none"
                     placeholder="e.g. Trainer unavailable, Emergency..."
                     value={cancelReason}
                     onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>

                  <div className="flex gap-3">
                     <button
                        onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                     >
                        Keep
                     </button>
                     <button
                        onClick={confirmCancel}
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

export default UpdateSessions;