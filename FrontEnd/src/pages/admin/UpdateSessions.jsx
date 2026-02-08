import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";

const UpdateSessions = () => {
   const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
   const { colors, theme } = useTheme();

   // --- STATE ---
   const [sessions, setSessions] = useState([]);
   const [trainers, setTrainers] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // UI State
   const [viewState, setViewState] = useState("list");
   const [showModal, setShowModal] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("All");

   // Bulk Selection
   const [selectedIds, setSelectedIds] = useState([]);

   // Bulk Action Modal
   const [showBulkActionModal, setShowBulkActionModal] = useState(false);
   const [bulkAction, setBulkAction] = useState(""); // 'cancel' or 'complete'

   // Form State - ENHANCED with multiple trainers
   const [formData, setFormData] = useState({
      _id: null, 
      trainerId: "", 
      additionalTrainerIds: [],
      externalTrainerNames: [],
      type: "Personal Training",
      date: "", 
      time: "", 
      duration: "60 mins", 
      status: "Upcoming", 
      notes: "",
      capacity: 10
   });

   // External trainer input state
   const [externalTrainerInput, setExternalTrainerInput] = useState("");

   // Cancel Modal State
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [cancelReason, setCancelReason] = useState("");
   const [sessionToCancel, setSessionToCancel] = useState(null);

   // --- STYLE INJECTION ---
   useEffect(() => {
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
      const allTrainerIds = [
         newSession.trainerId,
         ...(newSession.additionalTrainerIds || [])
      ].filter(Boolean);

      return sessions.some(s => {
         if (s._id === newSession._id || s.status === "Cancelled") return false;
         
         const existingTrainerIds = [
            s.trainer?._id,
            ...(s.additionalTrainers?.map(t => t._id) || [])
         ].filter(Boolean);

         const hasTrainerConflict = allTrainerIds.some(id => 
            existingTrainerIds.includes(id)
         );

         return hasTrainerConflict && 
                s.date === newSession.date && 
                s.time === newSession.time;
      });
   };

   const getTrainerDisplay = (session) => {
      const trainers = [];
      
      if (session.trainer?.name) {
         trainers.push(session.trainer.name + " (Lead)");
      }
      
      if (session.additionalTrainers && session.additionalTrainers.length > 0) {
         session.additionalTrainers.forEach(t => {
            if (t.name) trainers.push(t.name);
         });
      }
      
      if (session.externalTrainers && session.externalTrainers.length > 0) {
         session.externalTrainers.forEach(name => {
            trainers.push(name + " (External)");
         });
      }
      
      return trainers.join(", ") || "No trainers assigned";
   };

   // --- ACTIONS ---
   const handleOpenModal = (session = null) => {
      if (session) {
         setFormData({
            ...session,
            _id: session._id,
            trainerId: session.trainer?._id || "",
            additionalTrainerIds: session.additionalTrainers?.map(t => t._id) || [],
            externalTrainerNames: session.externalTrainers || [],
            capacity: session.capacity || 10
         });
         setIsEditing(true);
      } else {
         const today = new Date().toISOString().split('T')[0];
         setFormData({
            _id: null, 
            trainerId: "", 
            additionalTrainerIds: [],
            externalTrainerNames: [],
            type: "Personal Training",
            date: today, 
            time: "", 
            duration: "60 mins", 
            status: "Upcoming", 
            notes: "",
            capacity: 10
         });
         setIsEditing(false);
      }
      setExternalTrainerInput("");
      setShowModal(true);
   };

   const handleSave = async (e) => {
      e.preventDefault();
      
      if (!formData.trainerId || !formData.date || !formData.time) {
         toast.error("Please fill all required fields (Primary Trainer, Date, Time).");
         return;
      }

      if (checkConflict(formData)) {
         toast.error("Schedule Conflict: One or more trainers are busy at this time!");
         return;
      }

      const payload = {
         trainer: formData.trainerId,
         additionalTrainers: formData.additionalTrainerIds,
         externalTrainers: formData.externalTrainerNames,
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
         toast.error(error.response?.data?.message || "Failed to save session.");
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
         console.error(error);
         toast.error("Failed to cancel session.");
      }
   };

   // NEW: Bulk Actions
   const initiateBulkAction = (action) => {
      if (selectedIds.length === 0) {
         toast.error("No sessions selected");
         return;
      }
      setBulkAction(action);
      setShowBulkActionModal(true);
   };

   const confirmBulkAction = async () => {
      if (bulkAction === 'cancel' && (!cancelReason || !cancelReason.trim())) {
         toast.error("Please enter a valid reason for cancellation.");
         return;
      }

      try {
         const updatePromises = selectedIds.map(id => {
            if (bulkAction === 'cancel') {
               return api.put(`/sessions/${id}`, { 
                  status: "Cancelled",
                  cancelReason: cancelReason || "Bulk cancellation by admin"
               });
            } else if (bulkAction === 'complete') {
               return api.put(`/sessions/${id}`, { 
                  status: "Completed"
               });
            }
         });

         await Promise.all(updatePromises);
         
         const actionText = bulkAction === 'cancel' ? 'cancelled' : 'marked as completed';
         toast.success(`${selectedIds.length} session(s) ${actionText}`);
         
         setShowBulkActionModal(false);
         setCancelReason("");
         setSelectedIds([]);
         fetchData();
      } catch (err) {
         console.error(err);
         toast.error(`Some sessions failed to ${bulkAction === 'cancel' ? 'cancel' : 'complete'}`);
      }
   };

   // --- ADDITIONAL TRAINER MANAGEMENT ---
   const toggleAdditionalTrainer = (trainerId) => {
      setFormData(prev => {
         const isSelected = prev.additionalTrainerIds.includes(trainerId);
         
         if (isSelected) {
            return {
               ...prev,
               additionalTrainerIds: prev.additionalTrainerIds.filter(id => id !== trainerId)
            };
         } else {
            if (trainerId === prev.trainerId) {
               toast.error("This trainer is already set as the primary trainer");
               return prev;
            }
            return {
               ...prev,
               additionalTrainerIds: [...prev.additionalTrainerIds, trainerId]
            };
         }
      });
   };

   const addExternalTrainer = () => {
      const trimmedName = externalTrainerInput.trim();
      
      if (!trimmedName) {
         toast.error("Please enter a trainer name");
         return;
      }

      if (formData.externalTrainerNames.includes(trimmedName)) {
         toast.error("This trainer has already been added");
         return;
      }

      setFormData(prev => ({
         ...prev,
         externalTrainerNames: [...prev.externalTrainerNames, trimmedName]
      }));
      setExternalTrainerInput("");
      toast.success("External trainer added");
   };

   const removeExternalTrainer = (name) => {
      setFormData(prev => ({
         ...prev,
         externalTrainerNames: prev.externalTrainerNames.filter(n => n !== name)
      }));
   };

   // --- FILTERING & DISPLAY ---
   const filteredSessions = sessions.filter(s => {
      const matchesSearch = 
         s.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.additionalTrainers?.some(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
         s.externalTrainers?.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === "All" || s.status === filterStatus;
      
      return matchesSearch && matchesStatus;
   });

   const displayedSessions = viewState === "list" 
      ? filteredSessions.filter(s => s.status === "Upcoming")
      : filteredSessions.filter(s => s.status !== "Upcoming");

   return (
      <div 
         className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
         style={{ color: colors.text }}
      >
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Training Sessions</h1>
               <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                  {viewState === "list" ? "Manage upcoming training sessions" : "View session history"}
               </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-center md:justify-end">
               {/* Only show bulk actions in list view (upcoming sessions) */}
               {viewState === "list" && selectedIds.length > 0 && (
                  <>
                     <button
                        onClick={() => initiateBulkAction('complete')}
                        className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                        style={{ backgroundColor: colors.primary, color: '#14532d' }}
                     >
                        <i className="fa-solid fa-check"></i> Mark Completed ({selectedIds.length})
                     </button>
                     <button
                        onClick={() => initiateBulkAction('cancel')}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm transition-colors flex items-center gap-2"
                     >
                        <i className="fa-solid fa-ban"></i> Cancel Selected ({selectedIds.length})
                     </button>
                  </>
               )}
               
               {viewState === "list" && (
                  <button 
                     onClick={() => handleOpenModal()}
                     className="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2"
                     style={{ backgroundColor: colors.primary, color: '#14532d' }}
                  >
                     <i className="fa-solid fa-plus"></i> New Session
                  </button>
               )}
            </div>
         </div>

         {/* FILTERS & TABS */}
         <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
               <div className="relative">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}></i>
                  <input
                     type="text"
                     placeholder="Search by session type or trainer..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-11 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
                     style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                  />
               </div>
            </div>

            <div className="flex gap-2 flex-wrap">
               <div className="flex border rounded-xl p-1" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  {["list", "history"].map(v => (
                     <button
                        key={v}
                        onClick={() => {
                           setViewState(v);
                           setSelectedIds([]); // Clear selection when changing view
                        }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${viewState === v ? 'shadow' : ''}`}
                        style={{
                           backgroundColor: viewState === v ? colors.background : 'transparent',
                           color: viewState === v ? colors.secondary : colors.textMuted
                        }}
                     >
                        {v === "history" ? "History" : "Upcoming"}
                     </button>
                  ))}
               </div>

               <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-xl border focus:outline-none transition-colors"
                  style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
               >
                  <option value="All">All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
               </select>
            </div>
         </div>

         {/* CONTENT */}
         {isLoading ? (
            <div className="flex items-center justify-center h-64">
               <img src={loadingIMG} className='h-20 w-25' alt="Loading"/>
            </div>
         ) : (
            <>
               <div className="overflow-x-auto rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <table className="w-full text-left text-sm" style={{ color: colors.text }}>
                     <thead className="border-b" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                        <tr>
                           <th className="px-6 py-4">
                              <input
                                 type="checkbox"
                                 checked={displayedSessions.length > 0 && selectedIds.length === displayedSessions.length}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setSelectedIds(displayedSessions.map(s => s._id));
                                    } else {
                                       setSelectedIds([]);
                                    }
                                 }}
                                 className="w-4 h-4 rounded cursor-pointer"
                              />
                           </th>
                           <th className="px-6 py-4 font-semibold" style={{ color: colors.textMuted }}>Session Details</th>
                           <th className="px-6 py-4 font-semibold" style={{ color: colors.textMuted }}>Trainers</th>
                           <th className="px-6 py-4 font-semibold" style={{ color: colors.textMuted }}>Schedule</th>
                           <th className="px-6 py-4 font-semibold text-center" style={{ color: colors.textMuted }}>Status</th>
                           <th className="px-6 py-4 font-semibold text-right" style={{ color: colors.textMuted }}>Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y" style={{ divideColor: colors.border }}>
                        {displayedSessions.length > 0 ? (
                           displayedSessions.map(session => (
                              <tr 
                                 key={session._id} 
                                 className="transition-colors hover:opacity-80"
                                 style={{ backgroundColor: colors.card }}
                              >
                                 <td className="px-6 py-4">
                                    <input
                                       type="checkbox"
                                       checked={selectedIds.includes(session._id)}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setSelectedIds([...selectedIds, session._id]);
                                          } else {
                                             setSelectedIds(selectedIds.filter(id => id !== session._id));
                                          }
                                       }}
                                       className="w-4 h-4 rounded cursor-pointer"
                                    />
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="font-bold" style={{ color: colors.text }}>{session.type}</div>
                                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                                       Capacity: {session.capacity || 10} | {session.duration}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm">
                                       <div className="font-medium flex items-center gap-2 mb-1" style={{ color: colors.text }}>
                                          <i className="fa-solid fa-star text-xs" style={{ color: colors.accent }}></i>
                                          {session.trainer?.name || "Not assigned"}
                                       </div>
                                       {session.additionalTrainers && session.additionalTrainers.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                             {session.additionalTrainers.map((t, idx) => (
                                                <span 
                                                   key={idx} 
                                                   className="px-2 py-0.5 rounded-full text-xs border"
                                                   style={{ 
                                                      backgroundColor: colors.background, 
                                                      borderColor: colors.border,
                                                      color: colors.textMuted 
                                                   }}
                                                >
                                                   {t.name}
                                                </span>
                                             ))}
                                          </div>
                                       )}
                                       {session.externalTrainers && session.externalTrainers.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                             {session.externalTrainers.map((name, idx) => (
                                                <span 
                                                   key={idx} 
                                                   className="px-2 py-0.5 rounded-full text-xs border"
                                                   style={{ 
                                                      backgroundColor: colors.accent, 
                                                      borderColor: colors.accent,
                                                      color: theme === 'dark' ? '#fff' : '#854d0e'
                                                   }}
                                                >
                                                   <i className="fa-solid fa-user-tie text-xs mr-1"></i>
                                                   {name}
                                                </span>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                                       <i className="fa-regular fa-calendar"></i>
                                       <span>{session.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm mt-1" style={{ color: colors.textMuted }}>
                                       <i className="fa-regular fa-clock"></i>
                                       <span>{session.time}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <span 
                                       className="px-3 py-1 rounded-full text-xs font-bold border inline-block"
                                       style={getStatusColor(session.status)}
                                    >
                                       {session.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                       <button
                                          onClick={() => handleOpenModal(session)}
                                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:opacity-80"
                                          style={{ backgroundColor: colors.background, color: colors.secondary, border: `1px solid ${colors.border}` }}
                                       >
                                          <i className="fa-solid fa-pen"></i> Edit
                                       </button>
                                       {session.status === "Upcoming" && (
                                          <button
                                             onClick={() => initiateCancel(session._id)}
                                             className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                                          >
                                             <i className="fa-solid fa-ban"></i> Cancel
                                          </button>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        ) : (
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
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
               <div 
                  className="rounded-3xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
                  style={{ backgroundColor: colors.card }}
               >
                  <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                     <h3 className="font-bold" style={{ color: colors.text }}>
                        {isEditing ? "Update Session" : "Schedule Session"}
                     </h3>
                     <button onClick={() => setShowModal(false)} style={{ color: colors.textMuted }}>
                        <i className="fa-solid fa-xmark text-lg"></i>
                     </button>
                  </div>

                  <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                     
                     {/* PRIMARY TRAINER */}
                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-star text-xs mr-1" style={{ color: colors.accent }}></i>
                           Primary Trainer *
                        </label>
                        <select
                           required
                           value={formData.trainerId}
                           onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                           className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                        >
                           <option value="">Select Primary Trainer</option>
                           {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                           The main trainer responsible for this session
                        </p>
                     </div>

                     {/* ADDITIONAL INTERNAL TRAINERS */}
                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-users text-xs mr-1"></i>
                           Additional Internal Trainers (Optional)
                        </label>
                        <div 
                           className="border rounded-xl p-4 max-h-48 overflow-y-auto"
                           style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        >
                           {trainers.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                 {trainers
                                    .filter(t => t._id !== formData.trainerId)
                                    .map(trainer => (
                                       <label
                                          key={trainer._id}
                                          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors"
                                          style={{ 
                                             backgroundColor: formData.additionalTrainerIds.includes(trainer._id) 
                                                ? colors.card 
                                                : 'transparent'
                                          }}
                                       >
                                          <input
                                             type="checkbox"
                                             checked={formData.additionalTrainerIds.includes(trainer._id)}
                                             onChange={() => toggleAdditionalTrainer(trainer._id)}
                                             className="w-4 h-4 rounded cursor-pointer"
                                          />
                                          <span className="text-sm" style={{ color: colors.text }}>
                                             {trainer.name}
                                          </span>
                                       </label>
                                    ))}
                              </div>
                           ) : (
                              <p className="text-sm" style={{ color: colors.textMuted }}>No trainers available</p>
                           )}
                        </div>
                        {formData.additionalTrainerIds.length > 0 && (
                           <div className="flex flex-wrap gap-2 mt-2">
                              {formData.additionalTrainerIds.map(id => {
                                 const trainer = trainers.find(t => t._id === id);
                                 return trainer ? (
                                    <span 
                                       key={id}
                                       className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1"
                                       style={{ 
                                          backgroundColor: colors.card, 
                                          borderColor: colors.border,
                                          color: colors.text 
                                       }}
                                    >
                                       {trainer.name}
                                       <button
                                          type="button"
                                          onClick={() => toggleAdditionalTrainer(id)}
                                          className="ml-1 hover:opacity-70"
                                       >
                                          <i className="fa-solid fa-times text-xs"></i>
                                       </button>
                                    </span>
                                 ) : null;
                              })}
                           </div>
                        )}
                     </div>

                     {/* EXTERNAL TRAINERS */}
                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-user-tie text-xs mr-1" style={{ color: colors.accent }}></i>
                           External Trainers (Optional)
                        </label>
                        <div className="flex gap-2">
                           <input
                              type="text"
                              value={externalTrainerInput}
                              onChange={e => setExternalTrainerInput(e.target.value)}
                              onKeyPress={e => {
                                 if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addExternalTrainer();
                                 }
                              }}
                              className="flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                              placeholder="Enter external trainer name"
                           />
                           <button
                              type="button"
                              onClick={addExternalTrainer}
                              className="px-4 py-2 rounded-xl font-bold transition-colors"
                              style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                           >
                              <i className="fa-solid fa-plus"></i> Add
                           </button>
                        </div>
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                           Add trainers who are not in the gym database (e.g., guest trainers, external instructors)
                        </p>
                        
                        {formData.externalTrainerNames.length > 0 && (
                           <div className="flex flex-wrap gap-2 mt-3">
                              {formData.externalTrainerNames.map((name, idx) => (
                                 <span 
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2"
                                    style={{ 
                                       backgroundColor: colors.accent, 
                                       borderColor: colors.accent,
                                       color: theme === 'dark' ? '#fff' : '#854d0e'
                                    }}
                                 >
                                    <i className="fa-solid fa-user-tie text-xs"></i>
                                    {name}
                                    <button
                                       type="button"
                                       onClick={() => removeExternalTrainer(name)}
                                       className="ml-1 hover:opacity-70"
                                    >
                                       <i className="fa-solid fa-times text-xs"></i>
                                    </button>
                                 </span>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* SESSION DETAILS */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>Session Type *</label>
                           <input
                              type="text"
                              required
                              value={formData.type}
                              onChange={e => setFormData({ ...formData, type: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                              placeholder="e.g., Personal Training, Yoga, HIIT"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>Duration</label>
                           <input
                              type="text"
                              value={formData.duration}
                              onChange={e => setFormData({ ...formData, duration: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                              placeholder="e.g., 60 mins"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>Capacity (Max Participants)</label>
                        <input
                           type="number"
                           min="1"
                           value={formData.capacity}
                           onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>Date *</label>
                           <input
                              type="date"
                              required
                              min={new Date().toISOString().split("T")[0]}
                              value={formData.date}
                              onChange={e => setFormData({ ...formData, date: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>Time *</label>
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

                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>Session Notes / Instructions</label>
                        <textarea
                           rows="3"
                           value={formData.notes}
                           onChange={e => setFormData({ ...formData, notes: e.target.value })}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           placeholder="e.g., Focus on cardio, bring yoga mat..."
                        ></textarea>
                     </div>

                     {/* TRAINER SUMMARY */}
                     {(formData.trainerId || formData.additionalTrainerIds.length > 0 || formData.externalTrainerNames.length > 0) && (
                        <div 
                           className="p-4 rounded-xl border"
                           style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        >
                           <h4 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                              <i className="fa-solid fa-clipboard-check mr-1"></i>
                              Session Trainer Summary
                           </h4>
                           <div className="space-y-1 text-sm">
                              {formData.trainerId && (
                                 <div style={{ color: colors.text }}>
                                    <i className="fa-solid fa-star text-xs mr-2" style={{ color: colors.accent }}></i>
                                    <strong>Lead:</strong> {trainers.find(t => t._id === formData.trainerId)?.name}
                                 </div>
                              )}
                              {formData.additionalTrainerIds.length > 0 && (
                                 <div style={{ color: colors.text }}>
                                    <i className="fa-solid fa-users text-xs mr-2"></i>
                                    <strong>Additional:</strong> {formData.additionalTrainerIds.map(id => 
                                       trainers.find(t => t._id === id)?.name
                                    ).join(', ')}
                                 </div>
                              )}
                              {formData.externalTrainerNames.length > 0 && (
                                 <div style={{ color: colors.text }}>
                                    <i className="fa-solid fa-user-tie text-xs mr-2" style={{ color: colors.accent }}></i>
                                    <strong>External:</strong> {formData.externalTrainerNames.join(', ')}
                                 </div>
                              )}
                              <div className="text-xs mt-2 pt-2 border-t" style={{ color: colors.textMuted, borderColor: colors.border }}>
                                 Total Trainers: {1 + formData.additionalTrainerIds.length + formData.externalTrainerNames.length}
                              </div>
                           </div>
                        </div>
                     )}

                     <button 
                        type="submit" 
                        className="w-full py-3 font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                        style={{ backgroundColor: colors.primary, color: '#14532d' }}
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
                  <p className="text-sm mb-4" style={{ color: colors.textMuted }}>Please provide a reason for cancellation. This will notify all booked members.</p>

                  <textarea
                     className="w-full border rounded-xl p-3 text-sm focus:outline-none mb-4 h-24 resize-none transition-colors"
                     style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                     placeholder="e.g., Trainer unavailable..."
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