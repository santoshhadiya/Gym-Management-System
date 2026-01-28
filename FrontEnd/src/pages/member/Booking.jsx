import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

const Booking = () => {
   const { api } = useGlobalContext();
   const activeApi = api;

   // --- STATE ---
   const [sessions, setSessions] = useState([]);
   const [myBookings, setMyBookings] = useState([]);
   const [viewState, setViewState] = useState("upcoming");
   const [isLoading, setIsLoading] = useState(false);

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
         
         // Optimistic Update
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
         toast.info("Booking cancelled.");

         fetchMyBookings();
         fetchSessions();
      } catch (err) {
         toast.error(err.response?.data?.message || "Cancellation failed");
         fetchMyBookings();
      }
   };

   return (
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 font-sans">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* --- HEADER --- */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
               <h1 className="text-3xl font-black text-gray-900">Training Sessions</h1>
               <p className="text-gray-500 mt-1">Browse upcoming sessions and manage your bookings.</p>
            </div>

            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
               <button
                  onClick={() => setViewState("upcoming")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'upcoming' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
               >
                  Upcoming Sessions
               </button>
               <button
                  onClick={() => setViewState("history")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'history' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
               >
                  My Bookings
               </button>
            </div>
         </div>

         {/* --- CONTENT AREA --- */}
         {isLoading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
            </div>
         ) : (
            <div className="space-y-4">

               {/* VIEW: UPCOMING SESSIONS */}
               {viewState === 'upcoming' && (
                  sessions.length > 0 ? (
                     sessions.map(session => {
                        const existingBooking = myBookings.find(b => b.session?._id === session._id);
                        
                        const isCancelled = existingBooking?.bookingStatus === "Cancelled";
                        const isActive = existingBooking && !isCancelled;
                        const capacity = session.capacity || 10;
                        const bookedCount = session.bookedCount || 0;
                        const isFull = bookedCount >= capacity;
                        
                        // [NEW] Get the reason if it exists
                        const cancelReason = existingBooking?.cancelReason;

                        return (
                           <div key={session._id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md ${isFull && !isActive ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}>

                              <div className="flex-1">
                                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{session.type}</h3>
                                    <div className="flex flex-wrap gap-2">
                                       <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 w-fit">
                                          {session.duration}
                                       </span>
                                       
                                       {/* [UPDATED] Show Cancel Reason Badge */}
                                       {isCancelled && (
                                          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                                             <span className="text-xs font-bold text-red-600">Cancelled</span>
                                             {cancelReason && (
                                                <span className="text-xs text-red-500 border-l border-red-200 pl-2">
                                                   {cancelReason}
                                                </span>
                                             )}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 <p className="text-sm text-gray-500 mb-1">
                                    <i className="fa-solid fa-user-ninja text-gray-400 mr-2 w-4"></i>
                                    Trainer: <span className="font-medium text-gray-700">{session.trainer?.name}</span>
                                 </p>
                                 <p className="text-sm text-gray-500">
                                    <i className="fa-regular fa-clock text-gray-400 mr-2 w-4"></i>
                                    {session.date} • {session.time}
                                 </p>
                              </div>

                              <button
                                 onClick={() => {
                                    if (isActive) handleCancelSession(session._id);
                                    else if (!isFull && !isCancelled) handleBookSession(session);
                                 }}
                                 disabled={(!isActive && isFull) || isCancelled}
                                 className={`px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 min-w-[160px] justify-center ${
                                    isCancelled
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                                    : isActive 
                                       ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 cursor-pointer" 
                                       : isFull 
                                          ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300" 
                                          : "bg-[#D9F17F] text-green-900 hover:bg-green-300 cursor-pointer" 
                                 }`}
                              >
                                 {isCancelled ? (
                                    <>
                                       <i className="fa-solid fa-ban"></i> Cancelled
                                    </>
                                 ) : isActive ? (
                                    <>
                                       <i className="fa-solid fa-xmark"></i> Cancel
                                    </>
                                 ) : isFull ? (
                                    <>
                                       <i className="fa-solid fa-ban"></i> Full
                                    </>
                                 ) : (
                                    <>
                                       <span>Book Session</span>
                                       <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </>
                                 )}
                              </button>
                           </div>
                        );
                     })
                  ) : (
                     <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <i className="fa-regular fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500">No upcoming sessions available.</p>
                     </div>
                  )
               )}

               {/* VIEW: MY BOOKINGS */}
               {viewState === 'history' && (
                  myBookings.length > 0 ? (
                     myBookings.map(b => (
                        <div key={b._id} className={`p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 ${b.bookingStatus === 'Cancelled' ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                           <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{b.session?.type || "Session"}</h3>
                              <p className="text-sm text-gray-500">
                                 {b.session?.date} • {b.session?.time}
                              </p>
                              
                              {/* [UPDATED] Reason Display in History */}
                              {b.bookingStatus === 'Cancelled' && (
                                 <div className="mt-2 flex items-start gap-2">
                                    <i className="fa-solid fa-circle-info text-red-500 mt-0.5 text-xs"></i>
                                    <p className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                       Reason: {b.cancelReason || "Cancelled by admin"}
                                    </p>
                                 </div>
                              )}
                           </div>

                           <div className="flex items-center gap-3">
                              <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                                 b.bookingStatus === 'Cancelled' 
                                 ? 'bg-red-50 text-red-600 border-red-100' 
                                 : 'bg-green-50 text-green-700 border-green-100'
                              }`}>
                                 {b.bookingStatus || "Confirmed"}
                              </div>
                              
                              {b.bookingStatus !== 'Cancelled' && (
                                 <button 
                                    onClick={() => handleCancelSession(b.session?._id)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    title="Cancel Booking"
                                 >
                                    <i className="fa-solid fa-trash-can"></i>
                                 </button>
                              )}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <i className="fa-solid fa-ticket text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500">You haven't booked any sessions yet.</p>
                     </div>
                  )
               )}

            </div>
         )}
      </div>
   );
};

export default Booking;