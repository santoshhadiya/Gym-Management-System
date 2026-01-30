import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const AttendanceHistory = () => {
  const { api } = useGlobalContext();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/attendance/my-history');
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history");
      }
      
    };
    fetchHistory();
  }, [api]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4">My Attendance History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500 text-sm">
              <th className="py-2">Date</th>
              <th className="py-2">Check-in Time</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record._id} className="border-b last:border-0">
                <td className="py-3 font-medium">{record.date}</td>
                <td className="py-3 text-gray-600">{record.checkInTime}</td>
                <td className="py-3 text-green-600 font-bold">Present</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory;