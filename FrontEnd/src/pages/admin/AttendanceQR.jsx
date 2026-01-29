import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceQR = () => {
  const { api } = useGlobalContext();
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);

  const refreshQR = async () => {
    try {
      const res = await api.get('/attendance/generate-token');
      if (res.data?.qrToken) {
        setToken(res.data.qrToken);
        setError(null);
      } else {
        setError("Backend did not return a qrToken");
      }
    } catch (err) {
      setError("Failed to connect to backend");
      console.error("QR Error", err);
    }
  };

  useEffect(() => {
    refreshQR();
    const interval = setInterval(refreshQR, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-xl max-w-md mx-auto mt-10 border border-gray-100">
      <h2 className="text-2xl font-black mb-4 text-gray-900">Daily Check-in QR</h2>
      
      <div className="p-4 bg-white border-8 border-gray-900 rounded-2xl shadow-inner min-h-[280px] flex items-center justify-center w-full">
        {token ? (
          <QRCodeCanvas 
            value={token} 
            size={250} 
            level="H" 
            includeMargin={true}
          />
        ) : (
          <div className="text-center text-gray-400">
            {error ? (
              <p className="text-red-500 font-bold">{error}</p>
            ) : (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            )}
            <p className="text-xs mt-2">Generating Secure Token...</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-gray-500 text-sm animate-pulse flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Code refreshes every 20 seconds
      </p>
    </div>
  );
};

export default AttendanceQR;