import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

// ----------------------------------------------------------------------
// ⚠️ MOCK API CLIENT (FOR PREVIEW ONLY)
// In your real project, delete this const and uncomment the import below:
// import api from "../../api";
// ----------------------------------------------------------------------
// Mock Data Store (to persist changes within the session)
let mockBookingsStore = [
  { 
    _id: "bk_1", 
    session: { 
       _id: "ses_old_1", // Use an ID that doesn't match upcoming to start fresh, or match "ses_1" to test "Booked" state
       type: "Personal Training", 
       date: "2025-08-10", 
       time: "07:00 AM",
       trainer: { name: "Raj Mehta" }
    },
    bookingStatus: "Confirmed"
  }
];

const api = {
  get: async (url) => {
    console.log(`[Mock API] GET ${url}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === "/sessions") {
          resolve({
            data: [
              { 
                _id: "ses_1", 
                type: "Yoga Class", 
                trainer: { name: "Sneha Rathi" }, 
                date: "2025-08-15", 
                time: "07:00 AM",
                duration: "60 mins",
                capacity: 20
              },
              { 
                _id: "ses_2", 
                type: "HIIT Workout", 
                trainer: { name: "Vikram Singh" }, 
                date: "2025-08-16", 
                time: "06:00 PM",
                duration: "45 mins",
                capacity: 15
              }
            ]
          });
        } else if (url === "/session-bookings/my") {
          resolve({ data: [...mockBookingsStore] });
        } else {
          resolve({ data: [] });
        }
      }, 600);
    });
  },
  post: async (url) => {
    console.log(`[Mock API] POST ${url}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate adding to backend
        // Extract session ID from url "/session-bookings/:id"
        const parts = url.split('/');
        const sessId = parts[parts.length - 1];
        
        // Add dummy booking to mock store so it persists on refetch
        mockBookingsStore.push({
           _id: `bk_${Date.now()}`,
           session: { _id: sessId, type: "New Session", date: "Just Now", time: "...", trainer: { name: "..." } },
           bookingStatus: "Confirmed"
        });
        
        resolve({ data: { success: true, message: "Session booked successfully!" } });
      }, 800);
    });
  }
};
// ----------------------------------------------------------------------

const Booking = () => {
   const { api: globalApi } = useGlobalContext() || {};
   // Fallback to local mock api if global context is missing (for preview)
   const activeApi = globalApi || api;

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
         // Don't set global loading true if we are just refreshing data in background
         // but for first load we might want to.
         const res = await activeApi.get("/session-bookings/my");
         setMyBookings(res.data);
      } catch (err) {
         console.error("Failed to load bookings");
      }
   };

   // Initial Fetch
   useEffect(() => {
      // Always fetch bookings so we know what is already booked (for button state)
      fetchMyBookings();
      
      if (viewState === 'upcoming') {
         fetchSessions();
      }
   }, [viewState]);

   // --- ACTIONS ---
   const handleBookSession = async (session) => {
      try {
         // Optimistic Update: Add to local bookings immediately so button changes
         const tempBooking = { _id: "temp_" + Date.now(), session: session, bookingStatus: "Confirmed" };
         setMyBookings(prev => [...prev, tempBooking]);

         await activeApi.post(`/session-bookings/${session._id}`);
         toast.success("Session booked successfully!");
         
         // Refresh actual data from backend to get real ID/status
         fetchMyBookings();
      } catch (err) {
         toast.error(err.response?.data?.message || "Booking failed");
         // Revert optimistic update on failure
         fetchMyBookings(); 
      }
   };

   // Check if a session ID is in my bookings
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
                        return (
                           <div key={session._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-4">

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
                                 onClick={() => !booked && handleBookSession(session)}
                                 disabled={booked}
                                 className={`px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 ${
                                    booked 
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200" 
                                    : "bg-[#D9F17F] text-green-900 hover:bg-green-300 cursor-pointer"
                                 }`}
                              >
                                 {booked ? (
                                    <>
                                       <i className="fa-solid fa-check"></i> Booked
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