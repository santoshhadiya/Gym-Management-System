import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

const UpdateSessions = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme(); // Access custom colors and current theme

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
      // Note: react-toastify link removed as it is handled by Toaster in ThemeContext
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      return () => {
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
         case "Upcoming": return { backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e', borderColor: colors.accent };
         case "Completed": return { backgroundColor: colors.primary, color: '#111827', borderColor: colors.primary };
         case "Cancelled": return { backgroundColor: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' };
         default: return { backgroundColor: colors.background, color: colors.textMuted, borderColor: colors.border };
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

      if (checkConflict(formData)) {
         toast.error("Schedule Conflict: Trainer is busy at this time!");
         return;
      }

      const payload = {
         trainer: formData.trainerId,
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
         fetchData();
      } catch (error) {
         console.error(error);
         toast.error("Failed to save session.");
      }
   };

   const initiateCancel = (id) => {
      setSessionToCancel(id);
      setShowCancelModal(true);
   };

   const confirmCancel = async () => {
      if (!cancelReason || !cancelReason.trim()) {
         toast.error("Please enter a valid reason.");
         return;
      }

      try {
         await api.put(`/sessions/${sessionToCancel}`, {
            status: "Cancelled",
            cancelReason: cancelReason
         });

         toast.success("Session cancelled.");
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
            await Promise.all(selectedIds.map(id => {
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

   const filteredSessions = sessions.filter(s => {
      const matchesSearch = s.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "All" || s.status === filterStatus;

      if (viewState === 'list') {
         return matchesSearch && matchesFilter && s.status !== 'Cancelled' && s.status !== 'Completed';
      }
      return matchesSearch && matchesFilter;
   });

   return (
      <div 
         className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
         style={{color: colors.text }}
      >
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Manage Sessions</h1>
               <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Schedule, track, and modify training sessions.</p>
            </div>

            <div className="flex gap-3">
               <div className="flex p-1 rounded-2xl border transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <button
                     onClick={() => setViewState("list")}
                     className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'list' ? 'shadow' : ''}`}
                     style={{ 
                        backgroundColor: viewState === 'list' ? colors.background : 'transparent',
                        color: viewState === 'list' ? colors.secondary : colors.textMuted 
                     }}
                  >
                     Active
                  </button>
                  <button
                     onClick={() => setViewState("history")}
                     className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'history' ? 'shadow' : ''}`}
                     style={{ 
                        backgroundColor: viewState === 'history' ? colors.background : 'transparent',
                        color: viewState === 'history' ? colors.secondary : colors.textMuted 
                     }}
                  >
                     History
                  </button>
               </div>

               <button
                  onClick={() => handleOpenModal()}
                  className="px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: colors.primary, color: '#111827' }}
               >
                  <i className="fa-solid fa-plus"></i> New Session
               </button>
            </div>
         </div>

         {isLoading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.border }}></i>
            </div>
         ) : (
            <>
               {/* FILTERS & BULK ACTIONS */}
               <div 
                  className="flex flex-wrap items-center justify-between gap-4 mb-6 p-3 rounded-2xl border transition-colors"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  <div className="flex items-center gap-3 flex-grow">
                     <div className="relative w-full max-w-xs">
                        <input
                           type="text"
                           placeholder="Search Trainer..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                           style={{ 
                              backgroundColor: colors.background, 
                              borderColor: colors.border, 
                              color: colors.text,
                              '--tw-ring-color': colors.secondary 
                           }}
                        />
                        <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                     </div>

                     <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 cursor-pointer transition-colors"
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border, '--tw-ring-color': colors.secondary }}
                     >
                        <option value="All">All Status</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                     </select>
                  </div>

                  {selectedIds.length > 0 && (
                     <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-5">
                        <span className="text-xs font-bold" style={{ color: colors.textMuted }}>{selectedIds.length} selected</span>
                        <button
                           onClick={handleBulkComplete}
                           className="px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                           style={{ backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#1e3a8a' }}
                        >
                           Mark Completed
                        </button>
                     </div>
                  )}
               </div>

               {/* TABLE */}
               <div className="overflow-hidden rounded-2xl border shadow-sm transition-colors" style={{ borderColor: colors.border }}>
                  <table className="w-full border-collapse text-left text-sm">
                     <thead style={{ backgroundColor: colors.card }}>
                        <tr>
                           <th className="px-6 py-4 w-10">
                              <input
                                 type="checkbox"
                                 onChange={(e) => setSelectedIds(e.target.checked ? filteredSessions.map(s => s._id) : [])}
                                 checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0}
                                 className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                           </th>
                           <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Session Info</th>
                           <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Trainer</th>
                           <th className="px-6 py-4 font-semibold text-center" style={{ color: colors.text }}>Status</th>
                           <th className="px-6 py-4 font-semibold text-right" style={{ color: colors.text }}>Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y" style={{ divideColor: colors.border, backgroundColor: colors.background }}>
                        {filteredSessions.length > 0 ? filteredSessions.map((s) => (
                           <tr key={s._id} className={`transition-colors hover:opacity-80 ${selectedIds.includes(s._id) ? (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50/30') : ''}`}>
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
                                    <span className="font-bold" style={{ color: colors.text }}>{s.type}</span>
                                    <span className="text-xs flex items-center gap-2 mt-1" style={{ color: colors.textMuted }}>
                                       <i className="fa-regular fa-calendar"></i> {s.date}
                                       <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.border }}></span>
                                       <i className="fa-regular fa-clock"></i> {s.time} ({s.duration})
                                       <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.border }}></span>
                                       <span className="font-bold" style={{ color: colors.secondary }}>Cap: {s.capacity || 10}</span>
                                    </span>
                                    {s.notes && <span className="text-[10px] mt-1 italic" style={{ color: colors.secondary }}>Note: {s.notes}</span>}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                       <i className="fa-solid fa-user text-xs" style={{ color: colors.textMuted }}></i>
                                       <span className="font-medium" style={{ color: colors.text }}>{s.trainer?.name}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                                    style={getStatusColor(s.status)}
                                 >
                                    {s.status}
                                 </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                 {viewState === 'list' ? (
                                    <div className="flex justify-end gap-2">
                                       <button onClick={() => handleOpenModal(s)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer" style={{ backgroundColor: colors.secondary, color: colors.text }} title="Edit / Note">
                                          <i className="fa-solid fa-pen text-xs"></i>
                                       </button>
                                       {s.status === 'Upcoming' && (
                                          <button onClick={() => initiateCancel(s._id)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors cursor-pointer" style={{ backgroundColor: colors.card }} title="Cancel">
                                             <i className="fa-solid fa-ban text-xs"></i>
                                          </button>
                                       )}
                                    </div>
                                 ) : (
                                    <span className="text-xs italic" style={{ color: colors.textMuted }}>View Only</span>
                                 )}
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan="6" className="px-6 py-12 text-center" style={{ color: colors.textMuted }}>
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
               <div 
                  className="rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  style={{ backgroundColor: colors.card }}
               >
                  <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                     <h3 className="font-bold" style={{ color: colors.text }}>{isEditing ? "Update Session" : "Schedule Session"}</h3>
                     <button onClick={() => setShowModal(false)} style={{ color: colors.textMuted }}>
                        <i className="fa-solid fa-xmark text-lg"></i>
                     </button>
                  </div>

                  <form onSubmit={handleSave} className="p-6">
                     <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Trainer</label>
                           <select
                              required
                              value={formData.trainerId}
                              onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           >
                              <option value="">Select Trainer</option>
                              {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Session Type</label>
                           <input
                              type="text"
                              value={formData.type}
                              onChange={e => setFormData({ ...formData, type: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                              placeholder="Personal Training"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Duration</label>
                           <input
                              type="text"
                              value={formData.duration}
                              onChange={e => setFormData({ ...formData, duration: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                              placeholder="e.g. 60 mins"
                           />
                        </div>
                     </div>

                     <div className="mb-4">
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Capacity (Max Participants)</label>
                        <input
                           type="number"
                           min="1"
                           value={formData.capacity}
                           onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Date</label>
                           <input
                              type="date"
                              required
                              value={formData.date}
                              onChange={e => setFormData({ ...formData, date: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Time</label>
                           <input
                              type="time"
                              required
                              value={formData.time}
                              onChange={e => setFormData({ ...formData, time: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           />
                        </div>
                     </div>

                     <div className="mb-6">
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Session Notes / Instructions</label>
                        <textarea
                           rows="3"
                           value={formData.notes}
                           onChange={e => setFormData({ ...formData, notes: e.target.value })}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           placeholder="e.g. Focus on cardio..."
                        ></textarea>
                     </div>

                     <button 
                        type="submit" 
                        className="w-full py-3 font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                        style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                     >
                        {isEditing ? "Update Session" : "Schedule Session"}
                     </button>
                  </form>
               </div>
            </div>
         )}

         {/* --- CANCEL MODAL --- */}
         {showCancelModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
               <div 
                  className="rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 transition-colors"
                  style={{ backgroundColor: colors.card }}
               >
                  <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>Cancel Session?</h3>
                  <p className="text-sm mb-4" style={{ color: colors.textMuted }}>Please provide a reason for cancellation. This will notify the member.</p>

                  <textarea
                     className="w-full border rounded-xl p-3 text-sm focus:outline-none mb-4 h-24 resize-none transition-colors"
                     style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                     placeholder="e.g. Trainer unavailable..."
                     value={cancelReason}
                     onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>

                  <div className="flex gap-3">
                     <button
                        onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                        className="flex-1 py-2.5 border rounded-xl text-sm font-bold transition-colors cursor-pointer"
                        style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.textMuted }}
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