import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceQR = () => {
  const { api } = useGlobalContext();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [loading, setLoading] = useState(false); // Added for button state

  const refreshQR = async () => {
    setLoading(true); // Indicate refresh is happening
    try {
      const res = await api.get('/attendance/generate-token');
      if (res.data?.qrToken) {
        setToken(res.data.qrToken);
        setStatus("Active");
      } else {
        setStatus("Invalid Response from Server");
      }
    } catch (err) {
      console.error("API Error:", err.response || err);
      setStatus(`Error: ${err.response?.status || "Connection Failed"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshQR();
    // Removed the 5-second interval as we are switching to manual refresh
  }, []);

  return (
    <div className="flex flex-col items-center p-10 bg-white rounded-[2.5rem] shadow-xl max-w-md mx-auto mt-10 border border-gray-100">
      <h2 className="text-2xl font-black mb-4 text-gray-900 text-center">Gym Check-in</h2>
      
      <div className="p-4 bg-white border-[10px] border-gray-900 rounded-3xl shadow-2xl flex items-center justify-center min-h-[280px] w-full">
        {token ? (
          <QRCodeCanvas value={token} size={250} level="H" includeMargin={true} />
        ) : (
          <div className="text-center">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
             <p className="text-red-500 font-bold text-sm">{status}</p>
          </div>
        )}
      </div>

      {/* New Refresh Button Section */}
      <div className="mt-8 w-full">
        <button
          onClick={refreshQR}
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg 
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Refreshing..." : "Refresh QR Code"}
        </button>
        <p className="text-center text-gray-400 text-[10px] uppercase mt-4 tracking-widest font-bold">
          Code expires in 30 seconds
        </p>
      </div>
    </div>
  );
};

export default AttendanceQR;