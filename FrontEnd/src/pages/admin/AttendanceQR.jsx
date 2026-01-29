import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceQR = () => {
  const { api } = useGlobalContext();
  const [token, setToken] = useState("");

  const refreshQR = async () => {
    try {
      const res = await api.get('/attendance/generate-token');
      setToken(res.data.qrToken);
    } catch (err) { console.error("QR Error", err); }
  };

  useEffect(() => {
    refreshQR();
    const interval = setInterval(refreshQR, 20000); // Refresh every 20s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-black mb-4">Daily Check-in QR</h2>
      <div className="p-4 bg-white border-8 border-gray-900 rounded-2xl">
        {token && <QRCodeCanvas value={token} size={250} level="H" />}
      </div>
      <p className="mt-6 text-gray-500 text-sm animate-pulse">Code refreshes automatically...</p>
    </div>
  );
};


export default AttendanceQR;