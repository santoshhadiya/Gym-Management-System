import React from 'react';

const PerformanceReport = () => {
  const reports = [
    {
      id: 1,
      name: 'Ravi Patel',
      attendance: '22/30',
      progress: 'Improving',
      workout: 'Consistent',
      feedback: '4.8/5',
    },
    {
      id: 2,
      name: 'Priya Shah',
      attendance: '18/30',
      progress: 'Stable',
      workout: 'Moderate',
      feedback: '4.2/5',
    },
    {
      id: 3,
      name: 'Amit Joshi',
      attendance: '25/30',
      progress: 'Excellent',
      workout: 'High Intensity',
      feedback: '4.9/5',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Member Performance Reports</h1>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-2 px-3">#</th>
              <th className="text-left py-2 px-3">Member</th>
              <th className="text-left py-2 px-3">Attendance</th>
              <th className="text-left py-2 px-3">Progress</th>
              <th className="text-left py-2 px-3">Workout</th>
              <th className="text-left py-2 px-3">Feedback Rating</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{i + 1}</td>
                <td className="py-2 px-3 font-medium">{r.name}</td>
                <td className="py-2 px-3">{r.attendance}</td>
                <td className="py-2 px-3">{r.progress}</td>
                <td className="py-2 px-3">{r.workout}</td>
                <td className="py-2 px-3">{r.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceReport;
