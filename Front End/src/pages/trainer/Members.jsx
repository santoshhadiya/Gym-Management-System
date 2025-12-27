import React, { useState } from 'react';

const Members = () => {
  const [search, setSearch] = useState('');

  const members = [
    { id: 1, name: 'Ravi Patel', goal: 'Weight Loss', status: 'Active', joined: '2025-06-12' },
    { id: 2, name: 'Priya Shah', goal: 'Muscle Gain', status: 'Active', joined: '2025-07-01' },
    { id: 3, name: 'Amit Joshi', goal: 'Stamina Boost', status: 'Inactive', joined: '2025-05-22' },
  ];

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Assigned Members</h1>

      <input
        type="text"
        placeholder="Search members by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded-md mb-5"
      />

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Goal</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Join Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member, i) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{member.name}</td>
                <td className="px-3 py-2">{member.goal}</td>
                <td
                  className={`px-3 py-2 font-semibold ${
                    member.status === 'Active' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {member.status}
                </td>
                <td className="px-3 py-2">{member.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No members found.</p>
      )}
    </div>
  );
};

export default Members;
