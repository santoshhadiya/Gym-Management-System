import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';

const ScanAttendance = () => {
  const { api } = useGlobalContext();
  const [scanning, setScanning] = useState(true);
  const [checkinResult, setCheckinResult] = useState(null);

  // Use a reliable, short beep sound
  const beepAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    // 1. Initialize scanner
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    const onScanSuccess = async (decodedText) => {
      try {
        // 1. Play sound first for instant feedback
        beepAudio.current.play().catch(e => console.error("Audio block:", e));

        // 2. Call your backend
        // The backend should return an error status (e.g., 400) if the QR is expired
        const res = await api.post('/attendance/mark', { token: decodedText });

        // 3. ONLY clear and hide the scanner if the backend confirms success
        await scanner.clear();
        setScanning(false);
        setCheckinResult(res.data);
        toast.success("Attendance Marked Successfully!");

      } catch (err) {
        // 4. Handle Errors (Expired/Wrong QR)
        // We DON'T clear the scanner here so the user can try again immediately
        const errorMsg = err.response?.data?.message || "Invalid or Expired QR code";
        toast.error(errorMsg);
        console.error("Scan Error:", errorMsg);

        // Optional: Add a small delay so the user doesn't trigger 100 errors per second
        // scanner.pause();
        // setTimeout(() => scanner.resume(), 2000);
      }
    };

    scanner.render(onScanSuccess, (err) => {
      // Optional: handle scan errors (not necessary for every frame)
    });

    return () => {
      scanner.clear().catch(e => console.error("Cleanup error", e));
    };
  }, [api]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Member Check-in</h1>

      {/* Scanner Container */}
      <div style={{ display: scanning ? 'block' : 'none' }}>
        <div id="reader" className="overflow-hidden rounded-3xl border-4 border-gray-900 shadow-2xl"></div>
      </div>
      {/* Success Receipt Card */}
      {checkinResult && (
        <div className="mt-4 p-8 bg-white border-2 border-green-500 rounded-[2.5rem] shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Welcome Message and Name */}
          <h2 className="text-xl font-bold text-gray-600 uppercase">Welcome back,</h2>
          <h3 className="text-4xl font-black text-gray-900 mb-4">{checkinResult.name || "Member"}</h3>

          <div className="bg-green-50 py-2 px-4 rounded-full inline-block mb-6">
            <span className="text-green-700 font-bold">✓ Attendance Verified</span>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-gray-500 font-bold uppercase tracking-tighter text-xs">Check-in Time</p>
            <p className="text-2xl font-mono font-bold text-blue-600">{checkinResult.checkInTime || "Now"}</p>
          </div>
          <button
            onClick={() => navigate('/attendance-history')} // Redirect logic
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-bold uppercase"
          >
            Done
          </button>
        </div>
      )}

      {!scanning && (
        <button
          onClick={() => {
            setCheckinResult(null);
            setScanning(true);
            window.location.reload(); // Simplest way to reset the library state
          }}
          className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Next Member
        </button>
      )}
    </div>
  );
};

export default ScanAttendance;