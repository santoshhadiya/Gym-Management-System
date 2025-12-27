import React, { useState } from 'react';

const AssignMember = () => {
  const [search, setSearch] = useState('');

  // Dummy data (you can replace with API call later)
  const members = [
    { id: 1, name: 'Ravi Patel', age: 28, goal: 'Weight Loss', phone: '9876543210' },
    { id: 2, name: 'Priya Shah', age: 24, goal: 'Muscle Gain', phone: '9765432180' },
    { id: 3, name: 'Amit Joshi', age: 35, goal: 'Stamina Boost', phone: '9988776655' },
    { id: 4, name: 'Sneha Desai', age: 29, goal: 'General Fitness', phone: '9123456789' },
  ];

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Assigned Members</h1>

      <input
        type="text"
        placeholder="Search by member name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md mb-6"
      />

      {filteredMembers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Age</th>
                <th className="px-4 py-2 border">Fitness Goal</th>
                <th className="px-4 py-2 border">Phone</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, idx) => (
                <tr key={member.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-2 border">{idx + 1}</td>
                  <td className="px-4 py-2 border">{member.name}</td>
                  <td className="px-4 py-2 border">{member.age}</td>
                  <td className="px-4 py-2 border">{member.goal}</td>
                  <td className="px-4 py-2 border">{member.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No members found.</p>
      )}
    </div>
  );
};

export default AssignMember;
