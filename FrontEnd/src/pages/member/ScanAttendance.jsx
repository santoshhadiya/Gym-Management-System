import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qr-scanner';
import { toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';

const ScanAttendance = () => {
  const { api } = useGlobalContext();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      setScanning(false);
      scanner.clear();
      try {
        await api.post('/attendance/mark', { token: decodedText });
        toast.success("Attendance marked successfully!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid QR");
      }
    });


    return () => scanner.clear();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Scan to Check-in</h1>
      <div id="reader" className="overflow-hidden rounded-3xl border-0"></div>
      {!scanning && <button onClick={() => window.location.reload()} className="w-full mt-4 py-3 bg-black text-white rounded-xl">Scan Again</button>}
    </div>
  );
};


export default ScanAttendance;