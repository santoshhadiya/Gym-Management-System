import React, { useState } from 'react';

const MonitorProgress = () => {
  const [search, setSearch] = useState('');

  const progressRecords = [
    {
      id: 1,
      name: 'Ravi Patel',
      date: '2025-08-01',
      weight: '72 kg',
      muscle: 'Good',
      stamina: 'Improved',
    },
    {
      id: 2,
      name: 'Priya Shah',
      date: '2025-07-25',
      weight: '58 kg',
      muscle: 'Moderate',
      stamina: 'Stable',
    },
    {
      id: 3,
      name: 'Amit Joshi',
      date: '2025-07-18',
      weight: '80 kg',
      muscle: 'High',
      stamina: 'Excellent',
    },
  ];

  const filtered = progressRecords.filter((record) =>
    record.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Monitor Member Progress</h1>

      <input
        type="text"
        placeholder="Search by member name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-5"
      />

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-left">Muscle Strength</th>
              <th className="px-3 py-2 text-left">Stamina</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record, i) => (
              <tr key={record.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{record.name}</td>
                <td className="px-3 py-2">{record.date}</td>
                <td className="px-3 py-2">{record.weight}</td>
                <td className="px-3 py-2">{record.muscle}</td>
                <td className="px-3 py-2">{record.stamina}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No progress records found.</p>
      )}
    </div>
  );
};

export default MonitorProgress;
