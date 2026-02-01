// Attendance.jsx (Admin Panel)
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const Attendance = () => {
  const { api } = useGlobalContext();
  const [report, setReport] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      const res = await api.get('/attendance/report');
      // Assume report.allRecords contains all attendance
      setReport(res.data);
    };
    fetchReport();
  }, []);

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  if (!report) return <div>Loading...</div>;

  // Grouping logic: Create an object where keys are dates
  const grouped = report.todayList.reduce((acc, curr) => {
    acc[curr.date] = acc[curr.date] || [];
    acc[curr.date].push(curr);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Attendance History</h1>
      {Object.keys(grouped).map(date => (
        <div key={date} className="mb-4 border rounded-2xl overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleDate(date)}
            className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition"
          >
            <span className="font-bold text-lg">{date}</span>
            <span className="text-sm">{expandedDates[date] ? '▲ Collapse' : '▼ Expand'}</span>
          </button>
          
          {expandedDates[date] && (
            <div className="p-4 bg-white">
              {grouped[date].map(member => (
                <div key={member._id} className="flex justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{member.member?.name}</span>
                  <span className="text-gray-500">{member.checkInTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Attendance;