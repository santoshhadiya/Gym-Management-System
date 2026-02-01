import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceQR = () => {
  const { api, user } = useGlobalContext();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [loading, setLoading] = useState(false);
  const [lastScanId, setLastScanId] = useState(null);

  // 1. Function to generate a new QR Token
  const refreshQR = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/generate-token');
      if (res.data?.qrToken) {
        setToken(res.data.qrToken);
        setStatus("Active");
      }
    } catch (err) {
      console.error("API Error:", err);
      setStatus("Connection Failed");
    } finally {
      // Small delay for smooth UI transition
      setTimeout(() => setLoading(false), 600);
    }
  };

  // 2. Initialize QR on first mount
  useEffect(() => {
    refreshQR();
  }, []);

  // 3. Polling Logic: Checks for new database entries to trigger auto-refresh
  useEffect(() => {
    let isMounted = true;

    const checkUpdates = async () => {
      try {
        // We call the endpoint that returns the latest scan ID
        const res = await api.get('/attendance/check-status'); 
        const currentId = res.data.latestId;

        if (isMounted && currentId) {
          // If we have a previous ID saved and it differs from the current one, 
          // it means a new member just scanned successfully.
          if (lastScanId && currentId !== lastScanId) {
            console.log("New scan detected! Auto-refreshing QR...");
            refreshQR(); 
          }
          // Update the tracker with the current ID
          setLastScanId(currentId);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(checkUpdates, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lastScanId, api]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-50">

        {/* Header Section */}
        <div className="bg-gray-900 pt-10 pb-16 px-8 text-center">
          <h2 className="text-white text-2xl font-black tracking-tight mb-2">Member Pass</h2>
          <p className="text-gray-400 text-sm font-medium">Scan this at the front desk to check-in</p>
        </div>

        {/* QR Code Card */}
        <div className="px-8 -mt-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center relative border border-gray-100">
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

            {/* Spinner Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Controls & Info */}
        <div className="p-10 pt-8 text-center">
          <button
            onClick={refreshQR}
            disabled={loading}
            className="group relative w-full overflow-hidden bg-gray-900 text-white py-4 rounded-2xl font-bold transition-all hover:bg-black active:scale-[0.98] disabled:opacity-70"
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              <svg
                className={`w-5 h-5 transition-transform duration-700 ${loading ? 'rotate-180' : 'group-hover:rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Generating...' : 'Refresh Pass'}</span>
            </div>
          </button>

          <div className="mt-6 flex flex-col gap-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Token</p>
            <p className="text-xs text-gray-500 italic font-medium">Smart auto-refresh enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceQR;