import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";
const Booking = () => {
   // Use local mock API directly
   const {api}=useGlobalContext()
   const activeApi = api;

   // --- STATE ---
   const [sessions, setSessions] = useState([]);
   const [myBookings, setMyBookings] = useState([]);
   const [viewState, setViewState] = useState("upcoming"); // 'upcoming', 'history'
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

   // Initial Fetch
   useEffect(() => {
      fetchMyBookings();
      if (viewState === 'upcoming') {
         fetchSessions();
      }
   }, [viewState]);

   // --- ACTIONS ---
   const handleBookSession = async (session) => {
      try {
         // Check capacity (Client-side fail-safe)
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
         fetchSessions(); // Refresh to update booked counts if API supports it
      } catch (err) {
         toast.error(err.response?.data?.message || "Booking failed");
         fetchMyBookings(); // Revert
      }
   };

   const isBooked = (sessionId) => {
      return myBookings.some(b => b.session?._id === sessionId);
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
                        const booked = isBooked(session._id);
                        const capacity = session.capacity || 10;
                        const bookedCount = session.bookedCount || 0;
                        const isFull = bookedCount >= capacity;
                        const spotsLeft = Math.max(0, capacity - bookedCount);

                        return (
                           <div key={session._id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md ${isFull ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}>

                              <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{session.type}</h3>
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                       {session.duration}
                                    </span>
                                    
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
                                 onClick={() => !booked && !isFull && handleBookSession(session)}
                                 disabled={booked || isFull}
                                 className={`px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 min-w-[160px] justify-center ${
                                    booked 
                                    ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200" 
                                    : isFull 
                                       ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
                                       : "bg-[#D9F17F] text-green-900 hover:bg-green-300 cursor-pointer"
                                 }`}
                              >
                                 {booked ? (
                                    <>
                                       <i className="fa-solid fa-check"></i> Booked
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
                        <div key={b._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                           <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{b.session?.type || "Session"}</h3>
                              <p className="text-sm text-gray-500">
                                 {b.session?.date} • {b.session?.time}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                 Trainer: {b.session?.trainer?.name}
                              </p>
                           </div>

                           <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100">
                              {b.bookingStatus || "Confirmed"}
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