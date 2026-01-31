import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast'; // Updated Toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import Context

const Booking = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme(); // Consume Theme
   const activeApi = api;

   // --- STATE ---
   const [sessions, setSessions] = useState([]);
   const [myBookings, setMyBookings] = useState([]);
   const [viewState, setViewState] = useState("upcoming");
   const [isLoading, setIsLoading] = useState(false);

   // --- FETCH DATA ---
   const fetchSessions = async () => {
      try {
         setIsLoading(true);
         const res = await activeApi.get("/sessions");
         setSessions(res.data);
      } catch (err) {
         toast.error("Failed to load upcoming sessions");
      } finally {
         setIsLoading(false);
      }
   };

   const fetchMyBookings = async () => {
      try {
         const res = await activeApi.get("/session-bookings/my");
         setMyBookings(res.data);
      } catch (err) {
         console.error("Failed to load bookings");
      }
   };

   useEffect(() => {
      fetchMyBookings();
      if (viewState === 'upcoming') {
         fetchSessions();
      }
   }, [viewState]);

   // --- ACTIONS ---
   const handleBookSession = async (session) => {
      try {
         if ((session.bookedCount || 0) >= (session.capacity || 10)) {
            toast.error("Session is full!");
            return;
         }
         
         const tempBooking = { _id: "temp_" + Date.now(), session: session, bookingStatus: "Confirmed" };
         setMyBookings(prev => [...prev, tempBooking]);

         await activeApi.post(`/session-bookings/${session._id}`);
         toast.success("Session booked successfully!");
         
         fetchMyBookings();
         fetchSessions(); 
      } catch (err) {
         toast.error(err.response?.data?.message || "Booking failed");
         fetchMyBookings(); 
      }
   };

   const handleCancelSession = async (sessionId) => {
      if(!window.confirm("Are you sure you want to cancel this booking?")) return;

      try {
         setMyBookings(prev => prev.filter(b => b.session?._id !== sessionId));
         await activeApi.delete(`/session-bookings/${sessionId}`);
         toast.success("Booking cancelled.");

         fetchMyBookings();
         fetchSessions();
      } catch (err) {
         toast.error(err.response?.data?.message || "Cancellation failed");
         fetchMyBookings();
      }
   };

   return (
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 font-sans px-4 sm:px-6">

         {/* --- HEADER --- */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
               <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>Training Sessions</h1>
               <p className="text-sm md:text-base mt-1" style={{ color: colors.textMuted }}>Browse upcoming sessions and manage your bookings.</p>
            </div>

            <div className="flex border rounded-xl p-1 shadow-sm w-full md:w-auto" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               {['upcoming', 'history'].map(v => (
                   <button
                     key={v}
                     onClick={() => setViewState(v)}
                     className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all text-center capitalize`}
                     style={{ 
                         backgroundColor: viewState === v ? colors.secondary : 'transparent',
                         color: viewState === v ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
                     }}
                   >
                      {v === 'history' ? 'My Bookings' : v}
                   </button>
               ))}
            </div>
         </div>

         {/* --- CONTENT AREA --- */}
         {isLoading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.textMuted }}></i>
            </div>
         ) : (
            <div className="space-y-4">

               {/* VIEW: UPCOMING SESSIONS */}
               {viewState === 'upcoming' && (
                  sessions.filter(s => s.status === 'Upcoming').length > 0 ? (
                     sessions
                        .filter(s => s.status === 'Upcoming')
                        .map(session => {
                           const existingBooking = myBookings.find(b => b.session?._id === session._id);
                           const isCancelled = existingBooking?.bookingStatus === "Cancelled";
                           const isActive = existingBooking && !isCancelled;
                           const capacity = session.capacity || 10;
                           const bookedCount = session.bookedCount || 0;
                           const isFull = bookedCount >= capacity;
                           const cancelReason = existingBooking?.cancelReason;

                           return (
                              <div key={session._id} 
                                   className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md ${isFull && !isActive ? 'opacity-75' : ''}`}
                                   style={{ 
                                       backgroundColor: colors.card, 
                                       borderColor: colors.border 
                                   }}
                              >

                                 <div className="flex-1 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                       <h3 className="text-xl font-bold" style={{ color: colors.text }}>{session.type}</h3>
                                       <div className="flex flex-wrap gap-2">
                                          <span className="px-3 py-1 rounded-full text-xs font-bold border w-fit"
                                                style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#eff6ff', color: theme === 'dark' ? '#bfdbfe' : '#2563eb', borderColor: theme === 'dark' ? '#1e40af' : '#dbeafe' }}>
                                             {session.duration}
                                          </span>
                                          
                                          {isCancelled && (
                                             <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
                                                  style={{ backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2', borderColor: theme === 'dark' ? '#991b1b' : '#fee2e2' }}>
                                                <span className="text-xs font-bold text-red-600 dark:text-red-400">You Cancelled</span>
                                                {cancelReason && (
                                                   <span className="text-xs pl-2 border-l border-red-200 dark:border-red-800 text-red-500 dark:text-red-300">
                                                      {cancelReason}
                                                   </span>
                                                )}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                    <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                                       <i className="fa-solid fa-user-ninja mr-2 w-4"></i>
                                       Trainer: <span className="font-medium" style={{ color: colors.text }}>{session.trainer?.name}</span>
                                    </p>
                                    <p className="text-sm" style={{ color: colors.textMuted }}>
                                       <i className="fa-regular fa-clock mr-2 w-4"></i>
                                       {session.date} • {session.time}
                                    </p>
                                 </div>

                                 <button
                                    onClick={() => {
                                       if (isActive) handleCancelSession(session._id);
                                       else if (!isFull && !isCancelled) handleBookSession(session);
                                    }}
                                    disabled={(!isActive && isFull) || isCancelled}
                                    className={`px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 min-w-[160px] justify-center w-full md:w-auto cursor-pointer`}
                                    style={
                                        isCancelled ? { backgroundColor: colors.border, color: colors.textMuted, cursor: 'not-allowed' } :
                                        isActive ? { backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2', color: '#dc2626', borderColor: '#fee2e2', border: '1px solid' } :
                                        isFull ? { backgroundColor: colors.border, color: colors.textMuted, cursor: 'not-allowed' } :
                                        { backgroundColor: colors.primary, color: '#14532d' }
                                    }
                                 >
                                    {isCancelled ? (
                                       <><i className="fa-solid fa-ban"></i> Cancelled</>
                                    ) : isActive ? (
                                       <><i className="fa-solid fa-xmark"></i> Cancel</>
                                    ) : isFull ? (
                                       <><i className="fa-solid fa-ban"></i> Full</>
                                    ) : (
                                       <><span>Book Session</span><i className="fa-solid fa-arrow-right text-xs"></i></>
                                    )}
                                 </button>
                              </div>
                           );
                        })
                  ) : (
                     <div className="text-center py-16 rounded-[2.5rem] border border-dashed"
                          style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                        <i className="fa-regular fa-calendar-xmark text-4xl mb-3" style={{ color: colors.textMuted }}></i>
                        <p style={{ color: colors.textMuted }}>No upcoming sessions available.</p>
                     </div>
                  )
               )}

               {/* VIEW: MY BOOKINGS (HISTORY) */}
               {viewState === 'history' && (
                  myBookings.length > 0 ? (
                     myBookings.map(b => {
                        const isSessionCompleted = b.session?.status === 'Completed';
                        const isSessionCancelled = b.session?.status === 'Cancelled';
                        const isUserCancelled = b.bookingStatus === 'Cancelled';

                        return (
                        <div key={b._id} 
                             className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isUserCancelled || isSessionCancelled ? 'opacity-75' : ''}`}
                             style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        >
                           <div className="flex-1 w-full">
                              <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>{b.session?.type || "Session"}</h3>
                              <p className="text-sm" style={{ color: colors.textMuted }}>
                                 {b.session?.date} • {b.session?.time}
                              </p>
                              
                              {isUserCancelled && (
                                 <div className="mt-2 flex items-start gap-2">
                                    <i className="fa-solid fa-circle-info text-red-500 mt-0.5 text-xs"></i>
                                    <p className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                       You Cancelled: {b.cancelReason || "No reason provided"}
                                    </p>
                                 </div>
                              )}

                              {isSessionCancelled && !isUserCancelled && (
                                 <div className="mt-2 flex items-start gap-2">
                                    <i className="fa-solid fa-triangle-exclamation text-orange-500 mt-0.5 text-xs"></i>
                                    <p className="text-xs text-orange-700 font-bold bg-orange-50 px-2 py-1 rounded">
                                       Session Cancelled: {b.session?.cancelReason || b.session?.notes || "Administrative Action"}
                                    </p>
                                 </div>
                              )}
                              
                              {isSessionCompleted && (
                                 <div className="mt-2 flex items-start gap-2">
                                    <i className="fa-solid fa-check-circle text-green-500 mt-0.5 text-xs"></i>
                                    <p className="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                                       Session Completed
                                    </p>
                                 </div>
                              )}
                           </div>

                           <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                              <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                                 isUserCancelled 
                                    ? 'bg-red-50 text-red-600 border-red-100' 
                                    : isSessionCancelled
                                       ? 'bg-orange-50 text-orange-600 border-orange-100'
                                       : isSessionCompleted
                                          ? 'bg-gray-100 text-gray-600 border-gray-200'
                                          : 'bg-green-50 text-green-700 border-green-100'
                              }`}>
                                 {isUserCancelled 
                                    ? "Cancelled" 
                                    : isSessionCancelled 
                                       ? "Session Cancelled"
                                       : isSessionCompleted 
                                          ? "Completed"
                                          : b.bookingStatus || "Confirmed"
                                 }
                              </div>
                              
                              {!isUserCancelled && !isSessionCancelled && !isSessionCompleted && (
                                 <button 
                                    onClick={() => handleCancelSession(b.session?._id)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
                                    style={{ backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2', color: '#dc2626' }}
                                    title="Cancel Booking"
                                 >
                                    <i className="fa-solid fa-trash-can"></i>
                                 </button>
                              )}
                           </div>
                        </div>
                     )})
                  ) : (
                     <div className="text-center py-16 rounded-[2.5rem] border border-dashed"
                          style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                        <i className="fa-solid fa-ticket text-4xl mb-3" style={{ color: colors.textMuted }}></i>
                        <p style={{ color: colors.textMuted }}>You haven't booked any sessions yet.</p>
                     </div>
                  )
               )}

            </div>
         )}
      </div>
   );
};

export default Booking;