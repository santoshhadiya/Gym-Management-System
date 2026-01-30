import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceQR = () => {
  const { api } = useGlobalContext();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Initializing...");

  
  const refreshQR = async () => {
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
    }
  };

  useEffect(() => {
    refreshQR();
    const interval = setInterval(refreshQR, 5000000); // 5-second refresh
    return () => clearInterval(interval);
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

      <div className="mt-6 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${token ? 'bg-green-500 animate-pulse' : 'bg-red-50'}`}></span>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          {token ? "Refreshes every 5 seconds" : "Checking Backend Connection..."}
        </p>
      </div>
    </div>
  );
};

export default AttendanceQR;