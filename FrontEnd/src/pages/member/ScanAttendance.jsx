import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';

const ScanAttendance = () => {
  const { api } = useGlobalContext();
  const [scanning, setScanning] = useState(true);
  const [checkinResult, setCheckinResult] = useState(null);
  
  // Use a ref to store the audio object so it's not recreated every render
  const beepAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  const playSuccessSound = () => {
    beepAudio.current.play().catch(err => console.log("Audio play blocked by browser:", err));
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      // 1. Immediately stop scanning to prevent double-calls
      setScanning(false);
      
      try {
        // 2. Clear the scanner interface
        scanner.clear(); 
        
        // 3. API call to mark attendance
        const res = await api.post('/attendance/mark', { token: decodedText });
        
        // 4. Play success sound
        playSuccessSound();

        // 5. Success Feedback
        toast.success(`Welcome back! Checked in at ${res.data.checkInTime}`);
        setCheckinResult(res.data); 

      } catch (err) {
        // Handle failure (e.g., expired QR or network error)
        scanner.clear();
        toast.error(err.response?.data?.message || "Invalid or expired QR code");
      }
    });

    return () => {
        try { scanner.clear(); } catch (e) {}
    };
  }, [api]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Member Check-in</h1>
      
      {scanning && (
        <div id="reader" className="overflow-hidden rounded-3xl border-4 border-gray-900 shadow-2xl"></div>
      )}

      {/* Success Receipt Card */}
      {checkinResult && (
        <div className="mt-4 p-8 bg-white border-2 border-green-500 rounded-[2.5rem] shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">Verified</h2>
          <div className="mt-4 space-y-1">
            <p className="text-gray-500 font-bold uppercase tracking-tighter text-xs">Check-in Time</p>
            <p className="text-2xl font-mono font-bold text-blue-600">{checkinResult.checkInTime}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
             <p className="text-gray-400 text-sm font-medium">{checkinResult.date}</p>
          </div>
        </div>
      )}

      {!scanning && (
        <button 
          onClick={() => window.location.reload()} 
          className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Next Member
        </button>
      )}
    </div>
  );
};

export default ScanAttendance;