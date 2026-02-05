import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

const ScanAttendance = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const navigate = useNavigate();
  
  // State Management
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [checkinResult, setCheckinResult] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Refs
  const scannerRef = useRef(null);
  const beepAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // Request Camera Permissions and List Devices
  const requestPermission = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
        setPermissionGranted(true);
        toast.success("Camera access granted");
      }
    } catch (err) {
      toast.error("Camera permission denied");
      console.error(err);
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) return;
    
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      setScanning(true);
      await html5QrCode.start(
        selectedCamera,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess
      );
    } catch (err) {
      toast.error("Failed to start scanner");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      beepAudio.current.play().catch(e => console.error("Audio block:", e));
      
      // Update checkInAt and date property mapping to match backend
      const res = await api.post('/attendance/mark', { token: decodedText });
      
      await stopScanning();
      setCheckinResult(res.data);
      toast.success("Attendance Marked Successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid or Expired QR code";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-black mb-8 text-center text-gray-900 tracking-tight">Scanner</h1>

      {!checkinResult ? (
        <div className="space-y-6">
          {/* 1. Permission & Selection Section */}
          {!permissionGranted ? (
            <button
              onClick={requestPermission}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Enable Camera
            </button>
          ) : (
            <div className="bg-gray-100 p-4 rounded-2xl space-y-3 border border-gray-200">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Select Camera</label>
              <select 
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full p-3 bg-white border-0 rounded-xl shadow-sm font-medium focus:ring-2 focus:ring-blue-500"
                disabled={scanning}
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.label}</option>
                ))}
              </select>

              {!scanning ? (
                <button
                  onClick={startScanning}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                  Start Scanning
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="w-full py-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-all"
                >
                  Stop Scanning
                </button>
              )}
            </div>
          )}

          {/* 2. Scanner Viewport */}
          <div className={`relative overflow-hidden rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl transition-all duration-500 ${scanning ? 'opacity-100' : 'opacity-20 grayscale'}`}>
            <div id="reader" className="w-full aspect-square bg-black"></div>
            {scanning && (
              <div className="absolute inset-0 pointer-events-none border-[2px] border-blue-400 animate-pulse opacity-30"></div>
            )}
          </div>
        </div>
      ) : (
        /* 3. Success Receipt Card (Updated with Backend Mappings) */
        <div className="p-8 bg-white border-2 border-green-500 rounded-[2.5rem] shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Welcome</h2>
          <h3 className="text-4xl font-black text-gray-900 mb-6">{checkinResult.member?.name || "Member"}</h3>

          <div className="space-y-4">
             <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-gray-500 font-bold uppercase text-xs mb-1">Check-in Time</p>
                <p className="text-2xl font-mono font-bold text-blue-600">
                  {/* Using toLocaleTimeString to match your backend checkInAt field */}
                  {checkinResult.checkInAt ? new Date(checkinResult.checkInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Confirmed"}
                </p>
             </div>
             <button
               onClick={() => navigate('/member/attendance-history')} 
               className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase hover:bg-black transition-all"
             >
               Go to History
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanAttendance;