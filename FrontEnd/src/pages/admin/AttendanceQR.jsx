import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceQR = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // Start at 30 seconds

  // 1. Function to generate a new QR Token
  const refreshQR = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/generate-token');
      if (res.data?.qrToken) {
        setToken(res.data.qrToken);
        setStatus("Active");
        setTimeLeft(30); // Reset timer to 30 after a successful refresh
      }
    } catch (err) {
      console.error("API Error:", err);
      setStatus("Connection Failed");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  // 2. Initial load
  useEffect(() => {
    refreshQR();
  }, []);

  // 3. The Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR(); // Trigger refresh when time runs out
          return 30;   // Restart the count
        }
        return prev - 1;
      });
    }, 1000); // Update every 1 second

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-50">
        
        {/* Header Section */}
        <div className="bg-gray-900 pt-10 pb-16 px-8 text-center">
          <h2 className="text-white text-2xl font-black tracking-tight mb-2">Member Pass</h2>
          <p className="text-gray-400 text-sm font-medium">Scan this at the front desk</p>
        </div>

        {/* QR Code Card */}
        <div className="px-8 -mt-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center relative border border-gray-100">
            
            {/* Countdown Ring UI */}
            <div className="absolute top-4 right-4 flex items-center bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            
              <span className={`text-[10px] font-bold font-mono text-gray-600
                ${timeLeft < 10 ? 'text-red-500' : 'text-green-500'}`}>{timeLeft}s</span>
            </div>

            <div className={`transition-all duration-500 ${loading ? 'opacity-20 blur-sm scale-95' : 'opacity-100 scale-100'}`}>
              {token ? (
                <QRCodeCanvas
                  value={token}
                  size={200}
                  level="H"
                  fgColor="#111827"
                  includeMargin={false}
                />
              ) : (
                <div className="h-[200px] w-[200px] flex items-center justify-center text-center">
                  <div className="animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">
                    {status}
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar and Footer */}
        <div className="p-10 pt-8 text-center">
          <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
          
          <button
            onClick={refreshQR}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Refresh Manually'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceQR;