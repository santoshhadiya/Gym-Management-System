import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

const ManageBookings = () => {
   const { api } = useGlobalContext()
   // --- STATE ---
   const [bookings, setBookings] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   
   // [NEW] View State for Tabs
   const [viewState, setViewState] = useState("active"); // 'active' | 'history'

   // Cancellation Modal State
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [selectedBookingId, setSelectedBookingId] = useState(null);
   const [cancelReason, setCancelReason] = useState("");

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
      // 1. Group by Session ID
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

      // 2. Convert to Array
      let groups = Object.values(grouped);

      // 3. Filter and Sort based on View State
      if (viewState === 'active') {
         // ACTIVE: Only "Upcoming", Sort by Date ASC (Nearest first)
         return groups
            .filter(g => g.session.status === 'Upcoming')
            .sort((a, b) => {
               const dateA = new Date(`${a.session.date} ${a.session.time}`);
               const dateB = new Date(`${b.session.date} ${b.session.time}`);
               return dateA - dateB; 
            });
      } else {
         // HISTORY: "Completed" or "Cancelled", Sort by Date DESC (Newest first)
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
         toast.warn("Please enter a cancellation reason.");
         return;
      }

      try {
         await api.put(`/session-bookings/${selectedBookingId}/cancel`, { reason: cancelReason });
         toast.success("Booking cancelled successfully");
         setShowCancelModal(false);
         fetchBookings(); // Refresh data
      } catch (err) {
         toast.error("Failed to cancel booking");
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case "Confirmed": return "text-green-600 bg-green-50 border-green-100";
         case "Pending": return "text-yellow-600 bg-yellow-50 border-yellow-100";
         case "Cancelled": return "text-red-600 bg-red-50 border-red-100";
         default: return "text-gray-600 bg-gray-50 border-gray-100";
      }
   };

   const getSessionStatusBadge = (status) => {
      if (status === 'Completed') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Completed</span>;
      if (status === 'Cancelled') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Cancelled</span>;
      return null;
   };

   return (
      <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
               <p className="text-sm text-gray-500 mt-1">View and manage member bookings grouped by session.</p>
            </div>

            {/* View Switcher */}
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
               <button
                  onClick={() => setViewState("active")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'active' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                  Upcoming
               </button>
               <button
                  onClick={() => setViewState("history")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                  History
               </button>
            </div>
         </div>

         {isLoading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
            </div>
         ) : (
            <div className="space-y-8">
               {visibleGroups.length > 0 ? (
                  visibleGroups.map((group) => (
                     <div key={group.session._id} className={`border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 ${group.session.status === 'Cancelled' ? 'bg-red-50/10 border-red-100' : 'bg-white border-gray-200'}`}>

                        {/* Session Header */}
                        <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${group.session.status === 'Cancelled' ? 'bg-red-50 border-red-100' : 'bg-[#f8f9fa] border-gray-100'}`}>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${group.session.status === 'Upcoming' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                    {group.session.type}
                                 </h3>
                                 
                                 {/* History Status Badge */}
                                 {viewState === 'history' && getSessionStatusBadge(group.session.status)}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-medium">
                                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                    <i className="fa-regular fa-calendar text-blue-400"></i> {group.session.date}
                                 </span>
                                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                    <i className="fa-regular fa-clock text-blue-400"></i> {group.session.time}
                                 </span>
                                 <span className="flex items-center gap-1">
                                    <i className="fa-solid fa-user-ninja text-gray-400"></i> Trainer: {group.session.trainer?.name}
                                 </span>
                              </div>
                           </div>
                           <div className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600 shadow-sm self-start sm:self-center">
                              {group.bookings.length} Members Booked
                           </div>
                        </div>

                        {/* Bookings Table */}
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm text-gray-500">
                              <thead className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                                 <tr>
                                    <th className="px-6 py-3 font-semibold">Member Name</th>
                                    <th className="px-6 py-3 font-semibold">Booked On</th>
                                    <th className="px-6 py-3 font-semibold text-center">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 bg-white">
                                 {group.bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                       <td className="px-6 py-3 font-medium text-gray-900">
                                          {booking.member?.name || "Unknown Member"}
                                       </td>
                                       <td className="px-6 py-3 text-xs">
                                          {new Date(booking.createdAt).toLocaleString()}
                                       </td>
                                       <td className="px-6 py-3 text-center">
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(booking.bookingStatus)}`}>
                                             {booking.bookingStatus}
                                          </span>
                                       </td>
                                       <td className="px-6 py-3 text-right">
                                          {/* Action only available for ACTIVE sessions */}
                                          {viewState === 'active' && booking.bookingStatus !== "Cancelled" ? (
                                             <button
                                                onClick={() => openCancelModal(booking._id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-red-100"
                                             >
                                                Cancel Booking
                                             </button>
                                          ) : (
                                             <span className="text-gray-300 text-xs italic">--</span>
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
                  <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                     <i className={`fa-solid ${viewState === 'active' ? 'fa-clipboard-list' : 'fa-box-archive'} text-4xl text-gray-300 mb-3`}></i>
                     <p className="text-gray-500">No {viewState} bookings found.</p>
                  </div>
               )}
            </div>
         )}

         {/* --- CANCELLATION MODAL --- */}
         {showCancelModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                     <h3 className="font-bold text-red-900">Cancel Booking</h3>
                     <button onClick={() => setShowCancelModal(false)} className="text-red-400 hover:text-red-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                     </button>
                  </div>

                  <div className="p-6">
                     <p className="text-sm text-gray-600 mb-4">
                        Are you sure you want to cancel this booking? This action cannot be undone.
                     </p>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Cancellation</label>
                     <textarea
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 h-24 resize-none mb-6"
                        placeholder="e.g. Member request, Payment issue..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        autoFocus
                     ></textarea>

                     <div className="flex gap-3">
                        <button
                           onClick={() => setShowCancelModal(false)}
                           className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
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