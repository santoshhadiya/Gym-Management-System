import React from 'react';

const Dashboard = () => {
  const stats = [
    { label: 'Assigned Members', value: 12 },
    { label: 'Upcoming Sessions', value: 5 },
    { label: 'Pending Reports', value: 3 },
    { label: 'Feedback Received', value: 7 },
  ];

  const recentMembers = [
    { name: 'Ravi Patel', goal: 'Weight Loss' },
    { name: 'Priya Shah', goal: 'Muscle Gain' },
    { name: 'Amit Joshi', goal: 'Stamina Boost' },
  ];

  const upcomingSessions = [
    { time: '9:00 AM', member: 'Ravi Patel' },
    { time: '11:30 AM', member: 'Priya Shah' },
    { time: '4:00 PM', member: 'Amit Joshi' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Trainer Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-md border border-gray-100 text-center"
          >
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Two Columns: Recent Members & Upcoming Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-lg p-5 shadow-md border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Recently Joined Members</h3>
          <ul className="space-y-3">
            {recentMembers.map((m, i) => (
              <li key={i} className="flex justify-between border-b pb-2">
                <span className="font-medium">{m.name}</span>
                <span className="text-sm text-gray-600">{m.goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg p-5 shadow-md border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Today's Sessions</h3>
          <ul className="space-y-3">
            {upcomingSessions.map((s, i) => (
              <li key={i} className="flex justify-between border-b pb-2">
                <span className="font-medium">{s.time}</span>
                <span className="text-sm text-gray-600">{s.member}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
