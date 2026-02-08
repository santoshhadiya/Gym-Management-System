import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";

const ScanSession = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme();
   const navigate = useNavigate();

   const [scanner, setScanner] = useState(null);
   const [isScanning, setIsScanning] = useState(false);
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [modalMessage, setModalMessage] = useState("");
   const [modalType, setModalType] = useState("success"); // "success" or "info"

   useEffect(() => {
      initializeScanner();
      
      return () => {
         stopScanner();
      };
   }, []);

   const stopScanner = () => {
      if (scanner) {
         scanner.clear().catch(err => console.error("Failed to clear scanner", err));
         setScanner(null);
         setIsScanning(false);
      }
   };

   const initializeScanner = () => {
      const config = {
         fps: 10,
         qrbox: { width: 250, height: 250 },
         rememberLastUsedCamera: true,
         aspectRatio: 1.0,
      };

      const html5QrcodeScanner = new Html5QrcodeScanner(
         "qr-reader",
         config,
         false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
      setIsScanning(true);
   };

   const onScanSuccess = async (decodedText) => {
      try {
         // 1. Immediately stop the camera once a code is read
         stopScanner();
         
         // Parse QR code data
         const qrData = JSON.parse(decodedText);
         
         // Validate QR code structure
         if (!qrData.sessionId || !qrData.sessionDate || !qrData.qrId) {
            toast.error("Invalid QR code format");
            initializeScanner(); // Restart if format is wrong
            return;
         }

         // Mark attendance via backend
         const res = await api.post('/session-bookings/mark-attendance', {
            sessionId: qrData.sessionId,
            qrId: qrData.qrId,
            sessionDate: qrData.sessionDate
         });

         // Check if attendance was already marked or is new
         // Assuming backend returns specific flags or messages
         const isAlreadyMarked = res.data.message?.toLowerCase().includes("already") || res.data.alreadyMarked;
         
         setModalType(isAlreadyMarked ? "info" : "success");
         setModalMessage(res.data.message || "Attendance marked successfully!");
         setShowSuccessModal(true);

      } catch (err) {
         console.error(err);
         const errorMessage = err.response?.data?.message || "";
         
         // Handle the case where backend says attendance already exists via error status
         if (errorMessage.toLowerCase().includes("already") || err.response?.status === 409) {
            setModalType("info");
            setModalMessage(errorMessage || "Attendance has already been recorded for this session.");
            setShowSuccessModal(true);
            stopScanner();
         } else {
            if (err instanceof SyntaxError) {
               toast.error("Invalid QR code data");
            } else {
               toast.error(errorMessage || "Failed to mark attendance");
            }
            // If it's a genuine error (not "already marked"), restart scanner
            initializeScanner();
         }
      }
   };

   const onScanError = (error) => {
      // Silently ignore scan errors during search
   };

   return (
      <div 
         className="w-full max-w-4xl mx-auto p-4 font-sans min-h-screen relative"
         style={{ color: colors.text }}
      >
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: colors.text }}>
               Scan Session QR Code
            </h1>
            <p className="text-sm md:text-base" style={{ color: colors.textMuted }}>
               Scan the QR code displayed by your trainer to mark your attendance
            </p>
         </div>

         {/* Scanner Area */}
         <div 
            className="rounded-2xl border p-6 mb-6 shadow-sm"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
         >
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                  <i className="fa-solid fa-qrcode mr-2"></i>
                  QR Code Scanner
               </h2>
               <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2`}
                  style={{ 
                     backgroundColor: isScanning ? colors.primary : colors.background,
                     color: isScanning ? '#14532d' : colors.textMuted 
                  }}
               >
                  <i className={`fa-solid fa-circle text-xs ${isScanning ? 'animate-pulse' : ''}`}></i>
                  {isScanning ? 'Ready to Scan' : 'Scanner Off'}
               </div>
            </div>

            {/* If successful, we show a placeholder, otherwise the reader */}
            {!showSuccessModal ? (
               <div id="qr-reader" className="rounded-xl overflow-hidden border-2" style={{ borderColor: colors.border }}></div>
            ) : (
               <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl border-2 border-dashed" style={{ borderColor: colors.border }}>
                  <i className={`fa-solid ${modalType === 'success' ? 'fa-circle-check text-green-500' : 'fa-circle-info text-blue-500'} text-5xl mb-4`}></i>
                  <p className="font-bold">Scan Complete</p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>Camera stopped to prevent duplicate scans</p>
               </div>
            )}
         </div>

         {/* Scanner Instructions */}
         <div 
            className="rounded-2xl border p-6 mb-6"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
         >
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
               <i className="fa-solid fa-lightbulb text-lg" style={{ color: colors.secondary }}></i>
               <div className="text-sm" style={{ color: colors.textMuted }}>
                  <p className="font-bold mb-1" style={{ color: colors.text }}>Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                     <li>Align the QR code within the scanner frame</li>
                     <li>The scanner will stop automatically once attendance is confirmed</li>
                     <li>Check your booking history to view attended sessions</li>
                  </ul>
               </div>
            </div>
         </div>

         {/* SUCCESS / ALREADY MARKED POPUP MODAL */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div 
                  className="w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300"
                  style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
               >
                  <div 
                     className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                     style={{ backgroundColor: modalType === 'success' ? colors.primary : colors.secondary + '30' }}
                  >
                     <i className={`fa-solid ${modalType === 'success' ? 'fa-check text-green-900' : 'fa-info text-blue-900'} text-3xl`}></i>
                  </div>
                  
                  <h2 className="text-2xl font-black mb-2" style={{ color: colors.text }}>
                     {modalType === 'success' ? 'Success!' : 'Notice'}
                  </h2>
                  
                  <p className="text-sm mb-8 font-medium" style={{ color: colors.textMuted }}>
                     {modalMessage}
                  </p>

                  <button
                     onClick={() => navigate('/member/booking')}
                     className="w-full py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-900/10"
                     style={{ 
                        backgroundColor: colors.primary,
                        color: '#14532d' 
                     }}
                  >
                     <i className="fa-solid fa-calendar-check mr-2"></i>
                     Go to My Bookings
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default ScanSession;