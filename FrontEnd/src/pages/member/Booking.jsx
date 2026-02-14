import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";

const Booking = () => {
   const { api, BACKEND_URL, loadingIMG } = useGlobalContext();
   const { colors, theme } = useTheme();
   const activeApi = api;

   // --- STATE ---
   const [sessions, setSessions] = useState([]);
   const [myBookings, setMyBookings] = useState([]);
   const [viewState, setViewState] = useState("history");
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

   // --- HELPER FUNCTIONS ---
   const getTrainerDisplay = (session) => {
      const trainers = [];

      // Primary trainer
      if (session.trainer?.name) {
         trainers.push({ name: session.trainer.name, isPrimary: true, type: 'internal' });
      }

      // Additional internal trainers
      if (session.additionalTrainers && session.additionalTrainers.length > 0) {
         session.additionalTrainers.forEach(t => {
            if (t.name) trainers.push({ name: t.name, isPrimary: false, type: 'internal' });
         });
      }

      // External trainers
      if (session.externalTrainers && session.externalTrainers.length > 0) {
         session.externalTrainers.forEach(name => {
            trainers.push({ name: name, isPrimary: false, type: 'external' });
         });
      }

      return trainers;
   };

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
      if (!window.confirm("Are you sure you want to cancel this booking?")) return;

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

    const formatDate = (date) => {
      if (!date) return "-";

      return new Date(date)
         .toLocaleDateString("en-GB")
         .replaceAll("/", "-");
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
               {['history', 'upcoming'].map(v => (
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

            <div className="fixed inset-0 flex items-center justify-center h-screen" style={{ color: colors.textMuted }}>
               <img src={loadingIMG} className='h-20 w-25' alt="Loading" />
            </div>
         ) : (
            <div className="space-y-4">

               {/* VIEW: UPCOMING SESSIONS */}
               {viewState === 'upcoming' && (
                  sessions.filter(s => s.status === 'Upcoming').length > 0 ? (
                     sessions
                        .filter(s => {
                           const isUpcomingStatus = s.status === 'Upcoming';

                           // 1. ADD THIS DATE COMPARISON
                           const today = new Date().toISOString().split('T')[0]; // Gets current date as YYYY-MM-DD
                           const isFutureDate = s.date >= today; // Shows today and future dates

                           const userBooking = myBookings.find(b => b.session?._id === s._id);
                           const isAttended = userBooking?.bookingStatus === "Attended";

                           // 2. UPDATE THE RETURN STATEMENT
                           return isUpcomingStatus && isFutureDate && !isAttended;
                        })
                        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort: Latest first
                        .map(session => {
                           const existingBooking = myBookings.find(b => b.session?._id === session._id);
                           const isCancelled = existingBooking?.bookingStatus === "Cancelled";
                           const isActive = existingBooking && !isCancelled;
                           const capacity = session.capacity || 10;
                           const bookedCount = session.bookedCount || 0;
                           const isFull = bookedCount >= capacity;
                           const trainers = getTrainerDisplay(session);

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
                                             style={{
                                                backgroundColor: colors.accent,
                                                color: theme === 'dark' ? '#fff' : '#854d0e',
                                                borderColor: colors.accent
                                             }}
                                          >
                                             {session.duration}
                                          </span>
                                          <span className="px-3 py-1 rounded-full text-xs font-bold border w-fit"
                                             style={{ backgroundColor: colors.background, color: colors.textMuted, borderColor: colors.border }}
                                          >
                                             {bookedCount}/{capacity} Booked
                                          </span>
                                          {isActive && (
                                             <div className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: colors.primary }}></span>
                                                <span className="text-xs font-bold" style={{ color: colors.primary }}>
                                                   You're Booked
                                                </span>
                                             </div>
                                          )}
                                       </div>
                                    </div>

                                    {/* TRAINERS DISPLAY - ENHANCED */}
                                    {trainers.length > 0 && (
                                       <div className="mb-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                             <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
                                                <i className="fa-solid fa-user-ninja mr-1"></i>
                                                Trainer{trainers.length > 1 ? 's' : ''}:
                                             </span>
                                             {trainers.map((trainer, idx) => (
                                                <span
                                                   key={idx}
                                                   className="px-2 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1"
                                                   style={{
                                                      backgroundColor: trainer.isPrimary
                                                         ? colors.secondary
                                                         : trainer.type === 'external'
                                                            ? colors.accent
                                                            : colors.background,
                                                      color: trainer.isPrimary
                                                         ? (theme === 'dark' ? '#fff' : '#1e3a8a')
                                                         : trainer.type === 'external'
                                                            ? (theme === 'dark' ? '#fff' : '#854d0e')
                                                            : colors.text,
                                                      borderColor: trainer.isPrimary
                                                         ? colors.secondary
                                                         : trainer.type === 'external'
                                                            ? colors.accent
                                                            : colors.border
                                                   }}
                                                >
                                                   {trainer.isPrimary && <i className="fa-solid fa-star text-xs"></i>}
                                                   {trainer.type === 'external' && <i className="fa-solid fa-user-tie text-xs"></i>}
                                                   {trainer.name}
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    <p className="text-sm" style={{ color: colors.textMuted }}>
                                       <i className="fa-regular fa-clock mr-2 w-4"></i>
                                       {formatDate(session.date)} • {session.time}
                                    </p>

                                    {session.notes && (
                                       <p className="text-xs mt-2 p-2 rounded-lg" style={{ color: colors.textMuted, backgroundColor: colors.background }}>
                                          <i className="fa-solid fa-info-circle mr-1"></i>
                                          {session.notes}
                                       </p>
                                    )}
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
                     [...myBookings]
                        .sort((a, b) => {
                           // Sort: "Booked" sessions first, then "Attended" (and others) last
                           if (a.bookingStatus === 'Booked' && b.bookingStatus !== 'Booked') return -1;
                           if (a.bookingStatus !== 'Booked' && b.bookingStatus === 'Booked') return 1;
                           return 0;
                        })
                        .map(b => {
                           const isSessionCompleted = b.session?.status === 'Completed';
                           const isSessionCancelled = b.session?.status === 'Cancelled';
                           const isUserCancelled = b.bookingStatus === 'Cancelled';
                           const isAttended = b.bookingStatus === 'Attended';
                           const trainers = b.session ? getTrainerDisplay(b.session) : [];

                           return (
                              <div key={b._id}
                                 className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isUserCancelled || isSessionCancelled ? 'opacity-75' : ''}`}
                                 style={{ backgroundColor: colors.card, borderColor: colors.border }}
                              >
                                 <div className="flex-1 w-full">
                                    <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>{b.session?.type || "Session"}</h3>
                                    <p className="text-sm mb-2" style={{ color: colors.textMuted }}>
                                       {formatDate(b.session?.date)} • {b.session?.time}
                                    </p>

                                    {/* TRAINERS DISPLAY */}
                                    {trainers.length > 0 && (
                                       <div className="mb-2 flex flex-wrap items-center gap-1">
                                          <span className="text-xs" style={{ color: colors.textMuted }}>
                                             <i className="fa-solid fa-user-ninja mr-1"></i>
                                          </span>
                                          {trainers.map((trainer, idx) => (
                                             <span
                                                key={idx}
                                                className="px-2 py-0.5 rounded-full text-xs border"
                                                style={{
                                                   backgroundColor: trainer.isPrimary
                                                      ? colors.secondary
                                                      : trainer.type === 'external'
                                                         ? colors.accent
                                                         : colors.background,
                                                   color: trainer.isPrimary
                                                      ? (theme === 'dark' ? '#fff' : '#1e3a8a')
                                                      : trainer.type === 'external'
                                                         ? (theme === 'dark' ? '#fff' : '#854d0e')
                                                         : colors.text,
                                                   borderColor: colors.border
                                                }}
                                             >
                                                {trainer.isPrimary && <i className="fa-solid fa-star text-xs mr-1"></i>}
                                                {trainer.type === 'external' && <i className="fa-solid fa-user-tie text-xs mr-1"></i>}
                                                {trainer.name}
                                             </span>
                                          ))}
                                       </div>
                                    )}

                                    {isUserCancelled && (
                                       <div className="mt-2 flex items-start gap-2">
                                          <i className="fa-solid fa-circle-info text-red-500 mt-0.5 text-xs"></i>
                                          <p className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                             You Cancelled: {b.cancelReason || "No reason provided"}
                                          </p>
                                       </div>
                                    )}

                                    {isAttended && (
                                       <div className="mt-2 flex items-start gap-2">

                                          <p className="text-xs text-gray-700 font-bold bg-gray-50 px-2 py-1 rounded">
                                             Great job! You attended this session.
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

                                    {isSessionCompleted && !isAttended && (
                                       <div className="mt-2 flex items-start gap-2">
                                          <i className="fa-solid fa-check-circle text-green-500 mt-0.5 text-xs"></i>
                                          <p className="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                                             Session Completed
                                          </p>
                                       </div>
                                    )}
                                 </div>

                                 <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                                    <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${isUserCancelled
                                       ? 'bg-red-50 text-red-600 border-red-100'
                                       : isAttended
                                          ? 'bg-gray-600 text-white border-gray-700 shadow-sm'
                                          : isSessionCancelled
                                             ? 'bg-orange-50 text-orange-600 border-orange-100'
                                             : isSessionCompleted
                                                ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                : 'bg-green-50 text-green-700 border-green-100'
                                       }`}>
                                       {isUserCancelled
                                          ? "Cancelled"
                                          : isAttended
                                             ? <><i className="fa-solid fa-circle-check mr-1"></i> Attended</>
                                             : isSessionCancelled
                                                ? "Session Cancelled"
                                                : isSessionCompleted
                                                   ? "Completed"
                                                   : b.bookingStatus || "Confirmed"
                                       }
                                    </div>

                                    {!isUserCancelled && !isSessionCancelled && !isSessionCompleted && !isAttended && (
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
                           )
                        })
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