import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const Attendance = () => {
  const { api } = useGlobalContext();
  const [report, setReport] = useState(null);
  
  // 1. Get Today's Date String
  const todayDate = new Date().toISOString().split('T')[0];
  
  // 2. Initial state has today's date set to true (Expanded)
  const [expandedDates, setExpandedDates] = useState({ [todayDate]: true });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/attendance/report');
        setReport(res.data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };
    fetchReport();
  }, [api]);

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  if (!report) return (
    <div className="flex justify-center items-center h-64">
      <i className="fa-solid fa-circle-notch fa-spin text-2xl text-yellow-500"></i>
    </div>
  );

  // 3. Group allRecords by their date property
  const grouped = (report.allRecords || []).reduce((acc, curr) => {
    acc[curr.date] = acc[curr.date] || [];
    acc[curr.date].push(curr);
    return acc;
  }, {});

  // 4. Sort dates to show newest first
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Attendance History</h1>
          <p className="text-gray-500">Manage and view daily check-in logs</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Check-ins</span>
          <p className="text-2xl font-black text-yellow-500">{report.totalAttendance}</p>
        </div>
      </div>

      {sortedDates.map(date => (
        <div key={date} className="mb-4 border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm bg-white">
          <button
            onClick={() => toggleDate(date)}
            className={`w-full flex justify-between items-center p-5 transition-all ${
              expandedDates[date] ? 'bg-[#FEEF75] text-black' : 'hover:bg-slate-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-black text-lg">{date}</span>
              {date === todayDate && (
                <span className="bg-black text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                  Today
                </span>
              )}
              <span className="text-xs font-bold opacity-60">
                ({grouped[date].length} Members)
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm">
              {expandedDates[date] ? 'Collapse' : 'Expand'}
              <i className={`fa-solid fa-chevron-${expandedDates[date] ? 'up' : 'down'} text-xs`}></i>
            </div>
          </button>

          {expandedDates[date] && (
            <div className="p-2 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {grouped[date].map(record => (
                  <div 
                    key={record._id} 
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                        {record.member?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 leading-tight">{record.member?.name || 'Unknown User'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{record.member?.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-gray-700">
                        {record.checkInAt
                          ? new Date(record.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </p>
                      <p className="text-[10px] font-bold text-green-600 uppercase">Check-in</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Attendance;