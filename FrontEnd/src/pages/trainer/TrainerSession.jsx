import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";
import TrainerNav from "../../components/trainer/TrainerNav";

const TrainerSession = () => {
   const { api, BACKEND_URL } = useGlobalContext();
   const { colors, theme } = useTheme();
   const navigate = useNavigate();

   const [allSessions, setAllSessions] = useState([]);
   const [trainerSessions, setTrainerSessions] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState("all");
   const [selectedSession, setSelectedSession] = useState(null);
   const [sessionDetails, setSessionDetails] = useState(null);
   const [detailsLoading, setDetailsLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("Upcoming");

   // Color Palette
   const paletteColors = {
      white: "#FFFFFF",
      mattBlack: "#000000",
      lightBlue: "#CDE7FE",
      lime: "#D9F17F",
      softYellow: "#FEEF75",
      gray: "#6B7280"
   };

   const getTransparentColor = (hex, opacity) => {
      if (!hex) return `rgba(255, 255, 255, ${opacity})`;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
   };

   // Fetch all sessions
   useEffect(() => {
      const fetchSessions = async () => {
         try {
            setIsLoading(true);

            // Fetch all available sessions
            const allRes = await api.get("/sessions");
            setAllSessions(allRes.data || []);

            // Fetch trainer's assigned sessions
            const trainerRes = await api.get("/sessions/trainer/assigned");
            setTrainerSessions(trainerRes.data || []);
         } catch (err) {
            console.error("Fetch Sessions Error:", err);
            toast.error("Failed to load sessions");
         } finally {
            setIsLoading(false);
         }
      };

      fetchSessions();
   }, [api]);

   // Fetch session details with participants
   const fetchSessionDetails = async (sessionId) => {
      try {
         setDetailsLoading(true);
         const res = await api.get(`/sessions/${sessionId}/details`);
         setSessionDetails(res.data);
      } catch (err) {
         console.error("Fetch Session Details Error:", err);
         toast.error("Failed to load session details");
      } finally {
         setDetailsLoading(false);
      }
   };

   // Filter sessions based on search and status
   const filterSessions = (sessions) => {
      let filtered = sessions;

      // Filter by status
      if (filterStatus !== "all") {
         filtered = filtered.filter(s => s.status === filterStatus);
      }

      // Filter by search term
      if (searchTerm.trim()) {
         filtered = filtered.filter(s =>
            s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.trainer?.name && s.trainer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            s.date.includes(searchTerm)
         );
      }

      return filtered;
   };

   const displaySessions = activeTab === "all" ? allSessions : trainerSessions;
   const filteredSessions = filterSessions(displaySessions);

   // Session Card Component
   const SessionCard = ({ session, isAssigned }) => {
      const statusColor = {
         "Upcoming": paletteColors.lime,
         "Completed": paletteColors.lightBlue,
         "Cancelled": "#EF4444"
      };

      return (
         <div
            className="border-2 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg"
            style={{
               backgroundColor: paletteColors.white,
               borderColor: paletteColors.lightBlue
            }}
            onClick={() => {
               setSelectedSession(session);
               fetchSessionDetails(session._id);
            }}
            onMouseEnter={e => {
               e.currentTarget.style.borderColor = paletteColors.lime;
               e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
               e.currentTarget.style.borderColor = paletteColors.lightBlue;
               e.currentTarget.style.transform = "translateY(0)";
            }}
         >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
               <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: paletteColors.mattBlack }}>
                     {session.type}
                  </h3>
                  <p className="text-sm" style={{ color: paletteColors.gray }}>
                     {session.notes || "No description"}
                  </p>
               </div>
               <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: statusColor[session.status] }}
               >
                  {session.status}
               </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <p className="text-xs" style={{ color: paletteColors.gray }}>Date</p>
                  <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                     {new Date(session.date).toLocaleDateString()}
                  </p>
               </div>
               <div>
                  <p className="text-xs" style={{ color: paletteColors.gray }}>Time</p>
                  <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                     {session.time}
                  </p>
               </div>
               <div>
                  <p className="text-xs" style={{ color: paletteColors.gray }}>Duration</p>
                  <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                     {session.duration}
                  </p>
               </div>
               <div>
                  <p className="text-xs" style={{ color: paletteColors.gray }}>Capacity</p>
                  <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                     {session.bookedCount || 0} / {session.capacity}
                  </p>
               </div>
            </div>

            {/* Trainer Info */}
            <div className="mb-3 pb-3 border-t" style={{ borderColor: paletteColors.lightBlue }}>
               <p className="text-xs" style={{ color: paletteColors.gray }}>Trainers</p>
               <p className="text-sm font-semibold" style={{ color: paletteColors.mattBlack }}>
                  {session.trainer?.name || "Unknown"}
                  {session.additionalTrainers?.length > 0 && `, +${session.additionalTrainers.length}`}
               </p>
            </div>

            {/* Badge for assigned sessions */}
            {isAssigned && (
               <div
                  className="inline-block px-2 py-1 rounded text-xs font-bold"
                  style={{
                     backgroundColor: getTransparentColor(paletteColors.lime, 0.2),
                     color: paletteColors.mattBlack,
                     border: `1px solid ${paletteColors.lime}`
                  }}
               >
                  <i className="fa-solid fa-check mr-1"></i>Assigned to You
               </div>
            )}
         </div>
      );
   };

   // Session Detail Modal
   const SessionDetailModal = () => {
      if (!selectedSession || detailsLoading) {
         return (
            <div
               className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
               onClick={() => setSelectedSession(null)}
            >
               <div
                  className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  style={{ backgroundColor: paletteColors.white }}
                  onClick={e => e.stopPropagation()}
               >
                  <div className="flex items-center justify-center h-40">
                     <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3">
                           <div className="animate-spin border-4 border-blue-100 rounded-full border-t-blue-500" style={{ borderTopColor: paletteColors.lightBlue }}></div>
                        </div>
                        <p style={{ color: paletteColors.gray }}>Loading details...</p>
                     </div>
                  </div>
               </div>
            </div>
         );
      }

      return (
         <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSession(null)}
         >
            <div
               className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               style={{ backgroundColor: paletteColors.white }}
               onClick={e => e.stopPropagation()}
            >
               {/* Close Button */}
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: paletteColors.mattBlack }}>
                     <i className="fa-solid fa-details" style={{ color: paletteColors.lightBlue }}></i>
                     Session Details
                  </h2>
                  <button
                     onClick={() => setSelectedSession(null)}
                     className="text-2xl leading-none"
                     style={{ color: paletteColors.gray }}
                  >
                     ✕
                  </button>
               </div>

               {/* Session Info */}
               <div className="mb-6 pb-6 border-b" style={{ borderColor: paletteColors.lightBlue }}>
                  <div className="mb-4">
                     <h3 className="text-2xl font-bold mb-2" style={{ color: paletteColors.mattBlack }}>
                        {selectedSession.type}
                     </h3>
                     <p style={{ color: paletteColors.gray }}>
                        {selectedSession.notes || "No description provided"}
                     </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                     <span
                        className="px-3 py-1 rounded-full text-sm font-bold text-white"
                        style={{
                           backgroundColor: {
                              "Upcoming": paletteColors.lime,
                              "Completed": paletteColors.lightBlue,
                              "Cancelled": "#EF4444"
                           }[selectedSession.status]
                        }}
                     >
                        {selectedSession.status}
                     </span>
                     {selectedSession.status === "Cancelled" && selectedSession.cancelReason && (
                        <p className="text-sm" style={{ color: "#DC2626" }}>
                           Reason: {selectedSession.cancelReason}
                        </p>
                     )}
                  </div>
               </div>

               {/* Session Details Grid */}
               <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b" style={{ borderColor: paletteColors.lightBlue }}>
                  <div>
                     <p className="text-xs font-bold uppercase" style={{ color: paletteColors.gray }}>Date</p>
                     <p className="text-lg font-semibold mt-1" style={{ color: paletteColors.mattBlack }}>
                        {new Date(selectedSession.date).toLocaleDateString("en-US", {
                           weekday: "long",
                           year: "numeric",
                           month: "long",
                           day: "numeric"
                        })}
                     </p>
                  </div>
                  <div>
                     <p className="text-xs font-bold uppercase" style={{ color: paletteColors.gray }}>Time</p>
                     <p className="text-lg font-semibold mt-1" style={{ color: paletteColors.mattBlack }}>
                        {selectedSession.time}
                     </p>
                  </div>
                  <div>
                     <p className="text-xs font-bold uppercase" style={{ color: paletteColors.gray }}>Duration</p>
                     <p className="text-lg font-semibold mt-1" style={{ color: paletteColors.mattBlack }}>
                        {selectedSession.duration}
                     </p>
                  </div>
                  <div>
                     <p className="text-xs font-bold uppercase" style={{ color: paletteColors.gray }}>Capacity</p>
                     <p className="text-lg font-semibold mt-1" style={{ color: paletteColors.mattBlack }}>
                        {sessionDetails?.bookedCount || 0} / {selectedSession.capacity} Booked
                     </p>
                  </div>
               </div>

               {/* Trainers */}
               <div className="mb-6 pb-6 border-b" style={{ borderColor: paletteColors.lightBlue }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: paletteColors.mattBlack }}>
                     <i className="fa-solid fa-user-tie mr-2" style={{ color: paletteColors.lightBlue }}></i>
                     Trainers Assigned
                  </h4>
                  <div className="space-y-2">
                     {selectedSession.trainer && (
                        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: getTransparentColor(paletteColors.lime, 0.1) }}>
                           <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: paletteColors.lime, color: paletteColors.mattBlack }}
                           >
                              {selectedSession.trainer.name?.charAt(0)}
                           </div>
                           <div>
                              <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                                 {selectedSession.trainer.name}
                              </p>
                              <p className="text-xs" style={{ color: paletteColors.gray }}>
                                 {selectedSession.trainer.specialization || "Primary Trainer"}
                              </p>
                           </div>
                        </div>
                     )}
                     {selectedSession.additionalTrainers?.map((trainer, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: getTransparentColor(paletteColors.lightBlue, 0.1) }}>
                           <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: paletteColors.lightBlue, color: paletteColors.mattBlack }}
                           >
                              {trainer.name?.charAt(0)}
                           </div>
                           <div>
                              <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                                 {trainer.name}
                              </p>
                              <p className="text-xs" style={{ color: paletteColors.gray }}>
                                 {trainer.specialization || "Additional Trainer"}
                              </p>
                           </div>
                        </div>
                     ))}
                     {selectedSession.externalTrainers?.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: getTransparentColor(paletteColors.softYellow, 0.1) }}>
                           <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: paletteColors.softYellow, color: paletteColors.mattBlack }}
                           >
                              {name?.charAt(0)}
                           </div>
                           <div>
                              <p className="font-semibold" style={{ color: paletteColors.mattBlack }}>
                                 {name}
                              </p>
                              <p className="text-xs" style={{ color: paletteColors.gray }}>
                                 External Trainer
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Participants */}
               <div className="mb-6 pb-6 border-b" style={{ borderColor: paletteColors.lightBlue }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: paletteColors.mattBlack }}>
                     <i className="fa-solid fa-users mr-2" style={{ color: paletteColors.softYellow }}></i>
                     Participants ({sessionDetails?.participantCount || 0})
                  </h4>
                  {sessionDetails?.participants && sessionDetails.participants.length > 0 ? (
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                        {sessionDetails.participants.map((booking, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 rounded-lg border-l-4" style={{ backgroundColor: getTransparentColor(paletteColors.lightBlue, 0.1), borderColor: paletteColors.lightBlue }}>
                              <div className="flex items-center gap-3">
                                 <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: paletteColors.lightBlue, color: paletteColors.mattBlack }}
                                 >
                                    {booking.member?.name?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-semibold text-sm" style={{ color: paletteColors.mattBlack }}>
                                       {booking.member?.name}
                                    </p>
                                    <p className="text-xs" style={{ color: paletteColors.gray }}>
                                       {booking.member?.email}
                                    </p>
                                 </div>
                              </div>
                              <span
                                 className="px-2 py-1 rounded text-xs font-bold"
                                 style={{
                                    backgroundColor: {
                                       "Booked": getTransparentColor(paletteColors.lime, 0.2),
                                       "Confirmed": getTransparentColor(paletteColors.softYellow, 0.2),
                                       "Attended": getTransparentColor("#10B981", 0.2),
                                       "Cancelled": getTransparentColor("#EF4444", 0.2)
                                    }[booking.bookingStatus] || getTransparentColor(paletteColors.gray, 0.2),
                                    color: {
                                       "Booked": paletteColors.mattBlack,
                                       "Confirmed": paletteColors.mattBlack,
                                       "Attended": "#059669",
                                       "Cancelled": "#DC2626"
                                    }[booking.bookingStatus] || paletteColors.mattBlack
                                 }}
                              >
                                 {booking.bookingStatus}
                              </span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-6" style={{ opacity: 0.5 }}>
                        <i className="fa-solid fa-inbox text-3xl mb-2" style={{ color: paletteColors.gray }}></i>
                        <p className="text-sm" style={{ color: paletteColors.gray }}>No participants yet</p>
                     </div>
                  )}
               </div>

               {/* Stats */}
               <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getTransparentColor(paletteColors.lime, 0.1) }}>
                     <p className="text-sm" style={{ color: paletteColors.gray }}>Booked</p>
                     <p className="text-2xl font-bold" style={{ color: paletteColors.mattBlack }}>
                        {sessionDetails?.bookedCount || 0}
                     </p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getTransparentColor(paletteColors.lightBlue, 0.1) }}>
                     <p className="text-sm" style={{ color: paletteColors.gray }}>Total</p>
                     <p className="text-2xl font-bold" style={{ color: paletteColors.mattBlack }}>
                        {sessionDetails?.participantCount || 0}
                     </p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getTransparentColor("#10B981", 0.1) }}>
                     <p className="text-sm" style={{ color: paletteColors.gray }}>Attended</p>
                     <p className="text-2xl font-bold text-green-600">
                        {sessionDetails?.attendedCount || 0}
                     </p>
                  </div>
               </div>

               {/* Close Button */}
               <button
                  onClick={() => setSelectedSession(null)}
                  className="w-full py-3 rounded-lg font-bold transition-all"
                  style={{
                     backgroundColor: paletteColors.mattBlack,
                     color: paletteColors.white
                  }}
                  onMouseEnter={e => e.target.style.opacity = "0.8"}
                  onMouseLeave={e => e.target.style.opacity = "1"}
               >
                  Close
               </button>
            </div>
         </div>
      );
   };

   // Loading State
   if (isLoading) {
      return (
         <div className="w-full">
           
            <div className="w-full pb-10 space-y-8 px-6 lg:px-10 py-8">
               <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="font-black text-gray-400 tracking-tighter text-sm uppercase">Loading Sessions...</p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full">
        

         <div className="w-full pb-10 space-y-8 px-6 lg:px-10 py-8">
            <style>{`
               .tab-button {
                  transition: all 0.3s ease;
               }
               .tab-button:hover {
                  transform: translateY(-2px);
               }
            `}</style>

            {/* Header */}
            <div className="space-y-2">
               <h1 className="text-4xl font-black" style={{ color: paletteColors.mattBlack }}>
                  <i className="fa-solid fa-calendar-check mr-3" style={{ color: paletteColors.lime }}></i>
                  Sessions
               </h1>
               <p className="text-lg" style={{ color: paletteColors.gray }}>
                  Manage and view all training sessions
               </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b-2" style={{ borderColor: paletteColors.lightBlue }}>
               <button
                  className="tab-button px-6 py-3 font-bold border-b-4 transition-all"
                  style={{
                     color: activeTab === "all" ? paletteColors.mattBlack : paletteColors.gray,
                     borderColor: activeTab === "all" ? paletteColors.lime : "transparent",
                     backgroundColor: activeTab === "all" ? getTransparentColor(paletteColors.lime, 0.1) : "transparent"
                  }}
                  onClick={() => setActiveTab("all")}
               >
                  <i className="fa-solid fa-list mr-2"></i>All Sessions ({allSessions.length})
               </button>
               <button
                  className="tab-button px-6 py-3 font-bold border-b-4 transition-all"
                  style={{
                     color: activeTab === "mine" ? paletteColors.mattBlack : paletteColors.gray,
                     borderColor: activeTab === "mine" ? paletteColors.lime : "transparent",
                     backgroundColor: activeTab === "mine" ? getTransparentColor(paletteColors.lime, 0.1) : "transparent"
                  }}
                  onClick={() => setActiveTab("mine")}
               >
                  <i className="fa-solid fa-user-check mr-2"></i>My Sessions ({trainerSessions.length})
               </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Search Bar */}
               <div className="relative">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: paletteColors.gray }}></i>
                  <input
                     type="text"
                     placeholder="Search by type, trainer, or date..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                     style={{
                        borderColor: paletteColors.lightBlue,
                        backgroundColor: paletteColors.white,
                        color: paletteColors.mattBlack
                     }}
                     onFocus={(e) => e.target.style.borderColor = paletteColors.lime}
                     onBlur={(e) => e.target.style.borderColor = paletteColors.lightBlue}
                  />
               </div>

               {/* Status Filter */}
               <div>
                  <select
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                     className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                     style={{
                        borderColor: paletteColors.lightBlue,
                        backgroundColor: paletteColors.white,
                        color: paletteColors.mattBlack
                     }}
                  >
                     <option value="all">All Status</option>
                     <option value="Upcoming">Upcoming</option>
                     <option value="Completed">Completed</option>
                     <option value="Cancelled">Cancelled</option>
                  </select>
               </div>
            </div>

            {/* Sessions Grid */}
            {filteredSessions.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSessions.map((session, idx) => (
                     <SessionCard
                        key={idx}
                        session={session}
                        isAssigned={trainerSessions.some(ts => ts._id === session._id)}
                     />
                  ))}
               </div>
            ) : (
               <div className="text-center py-16" style={{ opacity: 0.5 }}>
                  <i className="fa-solid fa-inbox text-6xl mb-4" style={{ color: paletteColors.gray }}></i>
                  <p className="text-lg font-semibold" style={{ color: paletteColors.gray }}>
                     {searchTerm || filterStatus !== "all" 
                        ? "No sessions match your filters" 
                        : `No ${activeTab === "all" ? "sessions available" : "sessions assigned to you"}`}
                  </p>
               </div>
            )}
         </div>

         {/* Session Detail Modal */}
         {selectedSession && <SessionDetailModal />}
      </div>
   );
};

export default TrainerSession;
