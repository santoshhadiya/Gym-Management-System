import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const AdminDashboard = () => {
  const { api } = useGlobalContext();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/attendance/admin-report');
        setReport(res.data);
      } catch (err) {
        console.error("Report fetch failed");
      }
    };
    fetchReport();
  }, []);

  if (!report) return <div className="p-10 text-center">Loading Report...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Attendance Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Today's Scans</p>
          <h2 className="text-4xl font-black mt-2 text-blue-600">{report.todayCount}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Attendance</p>
          <h2 className="text-4xl font-black mt-2 text-gray-900">{report.totalCheckins}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Status</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-green-600">Live Tracking Active</span>
          </div>
        </div>
      </div>

      {/* Today's Member List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-xl font-bold">Today's Check-ins</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-gray-500 text-sm">Member</th>
              <th className="px-6 py-4 text-gray-500 text-sm">Check-in Time</th>
              <th className="px-6 py-4 text-gray-500 text-sm">Verification</th>
            </tr>
          </thead>
          <tbody>
            {report.todayList.map((entry) => (
              <tr key={entry._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold">{entry.member?.name || "Member"}</td>
                <td className="px-6 py-4 text-gray-600">{entry.checkInTime}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase">
                    QR Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;