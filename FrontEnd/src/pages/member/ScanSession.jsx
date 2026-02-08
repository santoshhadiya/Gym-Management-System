import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom"; // Added for redirection
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";

const ScanSession = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme();
   const navigate = useNavigate(); // Hook for redirection

   const [scanner, setScanner] = useState(null);
   const [isScanning, setIsScanning] = useState(false);
   const [recentScans, setRecentScans] = useState([]);

   useEffect(() => {
      initializeScanner();
      
      return () => {
         if (scanner) {
            scanner.clear().catch(console.error);
         }
      };
   }, []);

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

   // Helper to stop camera and redirect
   const stopAndRedirect = async () => {
      if (scanner) {
         try {
            await scanner.clear(); // Stop the camera hardware
         } catch (error) {
            console.error("Failed to stop scanner", error);
         }
      }
      // Redirect to the booking page
      navigate("/member/booking");
   };

   const onScanSuccess = async (decodedText) => {
      try {
         // Temporarily pause scanning state
         setIsScanning(false);
         
         // Parse QR code data
         const qrData = JSON.parse(decodedText);
         
         // Validate QR code structure
         if (!qrData.sessionId || !qrData.sessionDate || !qrData.sessionType || !qrData.qrId) {
            toast.error("Invalid QR code format");
            setIsScanning(true);
            return;
         }

         // Check if already scanned recently in this session state (UI level preventer)
         const isDuplicate = recentScans.some(scan => 
            scan.sessionId === qrData.sessionId && 
            Date.now() - scan.timestamp < 5000 
         );

         if (isDuplicate) {
            toast.error("QR code already scanned. Please wait...");
            setIsScanning(true);
            return;
         }

         // Mark attendance via backend
         const res = await api.post('/session-bookings/mark-attendance', {
            sessionId: qrData.sessionId,
            qrId: qrData.qrId,
            sessionDate: qrData.sessionDate
         });

         toast.success(res.data.message || "Attendance marked successfully!");
         
         // Stop camera and redirect on success
         setTimeout(() => {
            stopAndRedirect();
         }, 1500); // Small delay so user can read the success toast

      } catch (err) {
         if (err instanceof SyntaxError) {
            toast.error("Invalid QR code data");
            setIsScanning(true);
         } else {
            const errorMessage = err.response?.data?.message || "Failed to mark attendance";
            toast.error(errorMessage);

            // If the error indicates attendance already exists, redirect anyway
            if (errorMessage.toLowerCase().includes("already") || err.response?.status === 409) {
               setTimeout(() => {
                  stopAndRedirect();
               }, 1500);
            } else {
               setIsScanning(true);
            }
         }
         console.error(err);
      }
   };

   const onScanError = (error) => {
      // Silently ignore scan errors
   };

   const clearRecentScans = () => {
      setRecentScans([]);
   };

   return (
      <div 
         className="w-full max-w-4xl mx-auto p-4 font-sans min-h-screen"
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

         {/* Scanner Instructions */}
         <div 
            className="rounded-2xl border p-6 mb-6"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
         >
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
               <i className="fa-solid fa-info-circle text-lg" style={{ color: colors.secondary }}></i>
               <div className="text-sm" style={{ color: colors.textMuted }}>
                  <p className="font-bold mb-1" style={{ color: colors.text }}>How to mark attendance:</p>
                  <ul className="list-disc list-inside space-y-1">
                     <li>Position your camera to scan the QR code shown by your trainer</li>
                     <li>Upon successful scan, you will be redirected to your bookings</li>
                     <li>QR codes are only valid on the scheduled session date</li>
                  </ul>
               </div>
            </div>
         </div>

         {/* Scanner */}
         <div 
            className="rounded-2xl border p-6 mb-6"
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
                  {isScanning ? 'Ready to Scan' : 'Processing...'}
               </div>
            </div>

            <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
         </div>

         {/* Recent Scans Footer */}
         {recentScans.length > 0 && (
            <div 
               className="rounded-2xl border p-6"
               style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                     <i className="fa-solid fa-check-circle mr-2"></i>
                     Session Status
                  </h2>
               </div>

               <div className="space-y-2">
                  {recentScans.map((scan, index) => (
                     <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: colors.background }}
                     >
                        <div className="flex items-center gap-3">
                           <i className="fa-solid fa-circle-check text-lg" style={{ color: colors.primary }}></i>
                           <div>
                              <p className="font-bold text-sm" style={{ color: colors.text }}>
                                 {scan.sessionType}
                              </p>
                           </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                           style={{ 
                              backgroundColor: colors.primary,
                              color: '#14532d'
                           }}
                        >
                           Processed
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

export default ScanSession;