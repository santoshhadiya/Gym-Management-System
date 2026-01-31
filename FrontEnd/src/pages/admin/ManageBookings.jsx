import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

const ManageBookings = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme(); // Access custom colors and current theme

   // --- STATE ---
   const [bookings, setBookings] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   
   // View State for Tabs
   const [viewState, setViewState] = useState("active"); // 'active' | 'history'

   // Cancellation Modal State
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [selectedBookingId, setSelectedBookingId] = useState(null);
   const [cancelReason, setCancelReason] = useState("");

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
   const fetchBookings = async () => {
      try {
         setIsLoading(true);
         const res = await api.get("/session-bookings/admin/all");
         setBookings(res.data);
      } catch (err) {
         toast.error("Failed to load bookings");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchBookings();
   }, []);

   // --- GROUPING & SORTING LOGIC ---
   const processBookings = () => {
      const grouped = bookings.reduce((acc, booking) => {
         const sessionKey = booking.session._id;
         if (!acc[sessionKey]) {
            acc[sessionKey] = {
               session: booking.session,
               bookings: [],
            };
         }
         acc[sessionKey].bookings.push(booking);
         return acc;
      }, {});

      let groups = Object.values(grouped);

      if (viewState === 'active') {
         return groups
            .filter(g => g.session.status === 'Upcoming')
            .sort((a, b) => {
               const dateA = new Date(`${a.session.date} ${a.session.time}`);
               const dateB = new Date(`${b.session.date} ${b.session.time}`);
               return dateA - dateB; 
            });
      } else {
         return groups
            .filter(g => g.session.status !== 'Upcoming')
            .sort((a, b) => {
               const dateA = new Date(`${a.session.date} ${a.session.time}`);
               const dateB = new Date(`${b.session.date} ${b.session.time}`);
               return dateB - dateA; 
            });
      }
   };

   const visibleGroups = processBookings();

   // --- ACTIONS ---
   const openCancelModal = (bookingId) => {
      setSelectedBookingId(bookingId);
      setCancelReason("");
      setShowCancelModal(true);
   };

   const handleConfirmCancel = async () => {
      if (!cancelReason.trim()) {
         toast.error("Please enter a cancellation reason.");
         return;
      }

      try {
         await api.put(`/session-bookings/${selectedBookingId}/cancel`, { reason: cancelReason });
         toast.success("Booking cancelled successfully");
         setShowCancelModal(false);
         fetchBookings();
      } catch (err) {
         toast.error("Failed to cancel booking");
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case "Confirmed": return `text-green-600 border-green-100 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`;
         case "Pending": return `text-yellow-600 border-yellow-100 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`;
         case "Cancelled": return `text-red-600 border-red-100 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`;
         default: return `text-gray-600 border-gray-100 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`;
      }
   };

   const getSessionStatusBadge = (status) => {
      if (status === 'Completed') return <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ backgroundColor: colors.primary, color: '#111827', borderColor: colors.primary }}>Completed</span>;
      if (status === 'Cancelled') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Cancelled</span>;
      return null;
   };

   return (
      <div 
         className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen relative transition-colors duration-300"
         style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
      >
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Manage Bookings</h1>
               <p className="text-sm mt-1" style={{ color: colors.textMuted }}>View and manage member bookings grouped by session.</p>
            </div>

            {/* View Switcher */}
            <div className="flex p-1 rounded-2xl border transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <button
                  onClick={() => setViewState("active")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'active' ? 'shadow' : ''}`}
                  style={{ 
                     backgroundColor: viewState === 'active' ? colors.background : 'transparent',
                     color: viewState === 'active' ? colors.secondary : colors.textMuted 
                  }}
               >
                  Upcoming
               </button>
               <button
                  onClick={() => setViewState("history")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'history' ? 'shadow' : ''}`}
                  style={{ 
                     backgroundColor: viewState === 'history' ? colors.background : 'transparent',
                     color: viewState === 'history' ? colors.secondary : colors.textMuted 
                  }}
               >
                  History
               </button>
            </div>
         </div>

         {isLoading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.border }}></i>
            </div>
         ) : (
            <div className="space-y-8">
               {visibleGroups.length > 0 ? (
                  visibleGroups.map((group) => (
                     <div 
                        key={group.session._id} 
                        className="border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 transition-colors"
                        style={{ 
                           backgroundColor: colors.card, 
                           borderColor: group.session.status === 'Cancelled' ? '#fecaca' : colors.border 
                        }}
                     >

                        {/* Session Header */}
                        <div 
                           className="px-6 py-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                           style={{ 
                              backgroundColor: group.session.status === 'Cancelled' ? (theme === 'dark' ? '#450a0a' : '#fef2f2') : (theme === 'dark' ? colors.sidebar : '#f8f9fa'), 
                              borderColor: colors.border 
                           }}
                        >
                           <div>
                              <div className="flex items-center gap-3">
                                 <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.text }}>
                                    <span 
                                       className={`w-2 h-2 rounded-full ${group.session.status === 'Upcoming' ? 'animate-pulse' : ''}`}
                                       style={{ backgroundColor: group.session.status === 'Upcoming' ? colors.secondary : colors.textMuted }}
                                    ></span>
                                    {group.session.type}
                                 </h3>
                                 
                                 {viewState === 'history' && getSessionStatusBadge(group.session.status)}
                              </div>

                              <div className="flex items-center gap-4 text-xs mt-1 font-medium" style={{ color: colors.textMuted }}>
                                 <span className="flex items-center gap-1 px-2 py-1 rounded border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                                    <i className="fa-regular fa-calendar" style={{ color: colors.secondary }}></i> {group.session.date}
                                 </span>
                                 <span className="flex items-center gap-1 px-2 py-1 rounded border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                                    <i className="fa-regular fa-clock" style={{ color: colors.secondary }}></i> {group.session.time}
                                 </span>
                                 <span className="flex items-center gap-1">
                                    <i className="fa-solid fa-user-ninja"></i> Trainer: {group.session.trainer?.name}
                                 </span>
                              </div>
                           </div>
                           <div 
                              className="text-xs font-bold px-3 py-1 rounded-full border shadow-sm self-start sm:self-center"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                           >
                              {group.bookings.length} Members Booked
                           </div>
                        </div>

                        {/* Bookings Table */}
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm" style={{ color: colors.text }}>
                              <thead className="border-b text-xs uppercase tracking-wider" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.textMuted }}>
                                 <tr>
                                    <th className="px-6 py-3 font-semibold">Member Name</th>
                                    <th className="px-6 py-3 font-semibold">Booked On</th>
                                    <th className="px-6 py-3 font-semibold text-center">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y" style={{ divideColor: colors.border }}>
                                 {group.bookings.map((booking) => (
                                    <tr key={booking._id} className="transition-colors hover:opacity-80" style={{ backgroundColor: colors.card }}>
                                       <td className="px-6 py-3 font-medium" style={{ color: colors.text }}>
                                          {booking.member?.name || "Unknown Member"}
                                       </td>
                                       <td className="px-6 py-3 text-xs" style={{ color: colors.textMuted }}>
                                          {new Date(booking.createdAt).toLocaleString()}
                                       </td>
                                       <td className="px-6 py-3 text-center">
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(booking.bookingStatus)}`}>
                                             {booking.bookingStatus}
                                          </span>
                                       </td>
                                       <td className="px-6 py-3 text-right">
                                          {viewState === 'active' && booking.bookingStatus !== "Cancelled" ? (
                                             <button
                                                onClick={() => openCancelModal(booking._id)}
                                                className="text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-red-600"
                                             >
                                                Cancel Booking
                                             </button>
                                          ) : (
                                             <span className="text-xs italic" style={{ color: colors.border }}>--</span>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  ))
               ) : (
                  <div 
                     className="text-center py-16 rounded-[2.5rem] border border-dashed transition-colors"
                     style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  >
                     <i className={`fa-solid ${viewState === 'active' ? 'fa-clipboard-list' : 'fa-box-archive'} text-4xl mb-3`} style={{ color: colors.border }}></i>
                     <p style={{ color: colors.textMuted }}>No {viewState} bookings found.</p>
                  </div>
               )}
            </div>
         )}

         {/* --- CANCELLATION MODAL --- */}
         {showCancelModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div 
                  className="rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  style={{ backgroundColor: colors.card }}
               >
                  <div 
                     className="px-6 py-4 border-b flex justify-between items-center" 
                     style={{ backgroundColor: theme === 'dark' ? '#450a0a' : '#fef2f2', borderColor: colors.border }}
                  >
                     <h3 className="font-bold" style={{ color: '#ef4444' }}>Cancel Booking</h3>
                     <button onClick={() => setShowCancelModal(false)} className="hover:opacity-70">
                        <i className="fa-solid fa-xmark text-lg" style={{ color: '#ef4444' }}></i>
                     </button>
                  </div>

                  <div className="p-6">
                     <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                     </p>
                     <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Reason for Cancellation</label>
                     <textarea
                        className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 h-24 resize-none mb-6 transition-colors"
                        style={{ 
                           backgroundColor: colors.background, 
                           color: colors.text, 
                           borderColor: colors.border,
                           '--tw-ring-color': '#fee2e2' 
                        }}
                        placeholder="e.g. Member request, Payment issue..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        autoFocus
                     ></textarea>

                     <div className="flex gap-3">
                        <button
                           onClick={() => setShowCancelModal(false)}
                           className="flex-1 py-2.5 border rounded-xl text-sm font-bold transition-colors"
                           style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                        >
                           Keep Booking
                        </button>
                        <button
                           onClick={handleConfirmCancel}
                           className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm transition-colors flex justify-center items-center gap-2"
                        >
                           <i className="fa-solid fa-ban"></i> Confirm Cancel
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ManageBookings;