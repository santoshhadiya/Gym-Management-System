import React, { useState } from 'react';

const SessionReports = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sessionReports = [
    {
      id: 1,
      member: 'Ravi Patel',
      date: '2025-08-01',
      type: 'Weight Training',
      notes: 'Focused on compound lifts. Increased weight on deadlift.',
    },
    {
      id: 2,
      member: 'Priya Shah',
      date: '2025-07-31',
      type: 'Cardio & Core',
      notes: 'Did HIIT and core circuits. Good stamina shown.',
    },
    {
      id: 3,
      member: 'Amit Joshi',
      date: '2025-07-30',
      type: 'Full Body Strength',
      notes: 'Solid progress in pushups and pullups.',
    },
  ];

  const filteredReports = sessionReports.filter((report) =>
    report.member.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Training Session Reports</h1>

      <input
        type="text"
        placeholder="Search by member name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
      />

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Member</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Session Type</th>
              <th className="px-3 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, index) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 font-medium">{report.member}</td>
                <td className="px-3 py-2">{report.date}</td>
                <td className="px-3 py-2">{report.type}</td>
                <td className="px-3 py-2">{report.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReports.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No session reports found.</p>
      )}
    </div>
  );
};

export default SessionReports;
