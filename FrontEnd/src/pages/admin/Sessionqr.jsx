import React, { useState, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";

const SessionQR = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme();

   const [sessions, setSessions] = useState([]);
   const [selectedSession, setSelectedSession] = useState(null);
   const [qrData, setQrData] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [filter, setFilter] = useState('today'); // 'today', 'upcoming', 'all'
   const [isFullscreen, setIsFullscreen] = useState(false);

   useEffect(() => {
      fetchSessions();
   }, []);

   const fetchSessions = async () => {
      try {
         setIsLoading(true);
         const res = await api.get("/sessions");
         setSessions(res.data);
      } catch (err) {
         toast.error("Failed to load sessions");
         console.error(err);
      } finally {
         setIsLoading(false);
      }
   };

   const generateQRForSession = async (session) => {
      try {
         // Generate QR code from backend
         const res = await api.post(`/sessions/${session._id}/generate-qr`);
         
         setSelectedSession(session);
         setQrData(res.data.qrData);
         toast.success("QR code generated successfully!");
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to generate QR code");
         console.error(err);
      }
   };

   const getFilteredSessions = () => {
      const today = new Date().toISOString().split('T')[0];
      
      switch (filter) {
         case 'today':
            return sessions.filter(s => s.date === today && s.status === 'Upcoming');
         case 'upcoming':
            return sessions.filter(s => s.date >= today && s.status === 'Upcoming');
         case 'all':
            return sessions.filter(s => s.status === 'Upcoming');
         default:
            return sessions;
      }
   };

   const isSessionToday = (sessionDate) => {
      const today = new Date().toISOString().split('T')[0];
      return sessionDate === today;
   };

   const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
   };

   const closeQRDisplay = () => {
      setSelectedSession(null);
      setQrData(null);
      setIsFullscreen(false);
   };

   const filteredSessions = getFilteredSessions();

   return (
      <div 
         className="w-full max-w-6xl mx-auto p-4 font-sans min-h-screen"
         style={{ color: colors.text }}
      >
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: colors.text }}>
               Session QR Codes
            </h1>
            <p className="text-sm md:text-base" style={{ color: colors.textMuted }}>
               Generate and display QR codes for session attendance
            </p>
         </div>

         {/* Fullscreen QR Display */}
         {isFullscreen && qrData && selectedSession && (
            <div 
               className="fixed inset-0 z-50 flex items-center justify-center"
               style={{ backgroundColor: '#ffffff' }}
            >
               <button
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-4 p-3 rounded-full shadow-lg z-10"
                  style={{ backgroundColor: colors.card }}
               >
                  <i className="fa-solid fa-times text-xl" style={{ color: colors.text }}></i>
               </button>

               <div className="text-center">
                  <div className="mb-8">
                     <h2 className="text-4xl font-black mb-2" style={{ color: '#000000' }}>
                        {selectedSession.type}
                     </h2>
                     <p className="text-2xl" style={{ color: '#666666' }}>
                        {selectedSession.time} • {selectedSession.date}
                     </p>
                  </div>

                  <div className="inline-block p-8 rounded-3xl shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
                     <QRCodeSVG
                        value={JSON.stringify(qrData)}
                        size={500}
                        level="H"
                        includeMargin={true}
                        fgColor="#000000"
                        bgColor="#ffffff"
                     />
                  </div>

                  <div className="mt-8">
                     <p className="text-xl font-bold mb-2" style={{ color: '#000000' }}>
                        Scan this QR code to mark attendance
                     </p>
                     <p className="text-lg" style={{ color: '#666666' }}>
                        Valid only on {selectedSession.date}
                     </p>
                  </div>
               </div>
            </div>
         )}

         {/* Filter Tabs */}
         <div className="flex border rounded-xl p-1 shadow-sm w-full md:w-auto mb-6" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <button
               onClick={() => setFilter('today')}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all`}
               style={{
                  backgroundColor: filter === 'today' ? colors.secondary : 'transparent',
                  color: filter === 'today' ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
               }}
            >
               <i className="fa-solid fa-calendar-day mr-2"></i>
               Today
            </button>
            <button
               onClick={() => setFilter('upcoming')}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all`}
               style={{
                  backgroundColor: filter === 'upcoming' ? colors.secondary : 'transparent',
                  color: filter === 'upcoming' ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
               }}
            >
               <i className="fa-solid fa-calendar-week mr-2"></i>
               Upcoming
            </button>
            <button
               onClick={() => setFilter('all')}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all`}
               style={{
                  backgroundColor: filter === 'all' ? colors.secondary : 'transparent',
                  color: filter === 'all' ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
               }}
            >
               <i className="fa-solid fa-list mr-2"></i>
               All Sessions
            </button>
         </div>

         {/* Active QR Display */}
         {qrData && selectedSession && !isFullscreen && (
            <div 
               className="rounded-2xl border p-6 mb-6 animate-fadeIn"
               style={{ backgroundColor: colors.card, borderColor: colors.primary }}
            >
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black" style={{ color: colors.text }}>
                           Active QR Code
                        </h2>
                        <button
                           onClick={closeQRDisplay}
                           className="p-2 rounded-lg transition-all"
                           style={{ 
                              backgroundColor: colors.background,
                              color: colors.textMuted 
                           }}
                        >
                           <i className="fa-solid fa-times"></i>
                        </button>
                     </div>

                     <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                        {selectedSession.type}
                     </h3>

                     <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                           <i className="fa-regular fa-calendar w-4"></i>
                           <span>{selectedSession.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                           <i className="fa-regular fa-clock w-4"></i>
                           <span>{selectedSession.time} ({selectedSession.duration})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-user-ninja w-4"></i>
                           <span>{selectedSession.trainer?.name || 'Trainer TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-users w-4"></i>
                           <span>{selectedSession.bookedCount || 0} / {selectedSession.capacity} booked</span>
                        </div>
                     </div>

                     {isSessionToday(selectedSession.date) && (
                        <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
                           style={{ backgroundColor: colors.primary + '20', borderLeft: `4px solid ${colors.primary}` }}
                        >
                           <i className="fa-solid fa-circle-check" style={{ color: colors.primary }}></i>
                           <span className="text-sm font-bold" style={{ color: colors.primary }}>
                              QR Code is valid today
                           </span>
                        </div>
                     )}

                     <button
                        onClick={toggleFullscreen}
                        className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        style={{ 
                           backgroundColor: colors.secondary,
                           color: theme === 'dark' ? '#fff' : '#1e3a8a'
                        }}
                     >
                        <i className="fa-solid fa-expand"></i>
                        Display Fullscreen
                     </button>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                     <div 
                        className="p-4 rounded-2xl border-2"
                        style={{ 
                           backgroundColor: '#ffffff',
                           borderColor: colors.primary
                        }}
                     >
                        <QRCodeSVG
                           value={JSON.stringify(qrData)}
                           size={250}
                           level="H"
                           includeMargin={true}
                           fgColor="#000000"
                           bgColor="#ffffff"
                        />
                     </div>
                     <p className="text-xs text-center px-4" style={{ color: colors.textMuted }}>
                        Members scan this code to mark attendance
                     </p>
                  </div>
               </div>
            </div>
         )}

         {/* Sessions List */}
         <div className="space-y-4">
            {isLoading ? (
               <div className="text-center py-12" style={{ color: colors.textMuted }}>
                  <i className="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
                  <p>Loading sessions...</p>
               </div>
            ) : filteredSessions.length > 0 ? (
               filteredSessions.map(session => {
                  const isToday = isSessionToday(session.date);
                  const isActive = selectedSession?._id === session._id;

                  return (
                     <div 
                        key={session._id}
                        className={`rounded-2xl border p-6 transition-all ${isActive ? 'ring-2' : ''}`}
                        style={{ 
                           backgroundColor: colors.card, 
                           borderColor: isActive ? colors.primary : colors.border,
                           ringColor: colors.primary
                        }}
                     >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                 <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>
                                       {session.type}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                       {isToday && (
                                          <span className="px-2 py-1 rounded-full text-xs font-bold border"
                                             style={{ 
                                                backgroundColor: colors.primary, 
                                                color: '#14532d',
                                                borderColor: colors.primary 
                                             }}
                                          >
                                             <i className="fa-solid fa-circle text-xs animate-pulse mr-1"></i>
                                             Today
                                          </span>
                                       )}
                                       <span className="px-2 py-1 rounded-full text-xs font-bold"
                                          style={{ 
                                             backgroundColor: colors.background, 
                                             color: colors.textMuted 
                                          }}
                                       >
                                          {session.status}
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: colors.textMuted }}>
                                 <div className="flex items-center gap-2">
                                    <i className="fa-regular fa-calendar w-4"></i>
                                    <span>{session.date}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <i className="fa-regular fa-clock w-4"></i>
                                    <span>{session.time}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-user-ninja w-4"></i>
                                    <span>{session.trainer?.name || 'TBA'}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-users w-4"></i>
                                    <span>{session.bookedCount || 0}/{session.capacity}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex gap-2">
                              {isActive ? (
                                 <button
                                    onClick={closeQRDisplay}
                                    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                                    style={{ 
                                       backgroundColor: colors.background,
                                       color: colors.textMuted 
                                    }}
                                 >
                                    <i className="fa-solid fa-eye-slash"></i>
                                    Hide QR
                                 </button>
                              ) : (
                                 <button
                                    onClick={() => generateQRForSession(session)}
                                    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                                    style={{ 
                                       backgroundColor: colors.secondary,
                                       color: theme === 'dark' ? '#fff' : '#1e3a8a'
                                    }}
                                 >
                                    <i className="fa-solid fa-qrcode"></i>
                                    Generate QR
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })
            ) : (
               <div 
                  className="text-center py-16 rounded-2xl border border-dashed"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  <i className="fa-solid fa-calendar-xmark text-4xl mb-3" style={{ color: colors.textMuted }}></i>
                  <p style={{ color: colors.textMuted }}>No sessions found for the selected filter</p>
                  <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
                     Try selecting a different filter or create a new session
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

export default SessionQR;