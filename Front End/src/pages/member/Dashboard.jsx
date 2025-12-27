import React from 'react';

const Dashboard = () => {
  const memberData = {
    name: 'Santosh',
    membershipType: 'Gold',
    sessionsBooked: 12,
    progress: 'Weight: -4kg, Muscle: +2%',
    nextSession: {
      date: '2025-08-05',
      time: '6:00 AM',
      trainer: 'Amit Patel',
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Welcome */}
      <h1 className="text-3xl font-bold text-red-600 mb-6">Welcome back, {memberData.name} 👋</h1>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-red-100 text-red-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Membership</h2>
          <p className="text-xl font-bold">{memberData.membershipType}</p>
        </div>
        <div className="bg-blue-100 text-blue-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Sessions Booked</h2>
          <p className="text-xl font-bold">{memberData.sessionsBooked}</p>
        </div>
        <div className="bg-green-100 text-green-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Progress</h2>
          <p className="text-sm mt-1">{memberData.progress}</p>
        </div>
      </div>

      {/* Next Session */}
      <div className="bg-gray-100 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Your Next Session</h2>
        <p className="text-gray-600 mb-1">
          <strong>Date:</strong> {memberData.nextSession.date}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Time:</strong> {memberData.nextSession.time}
        </p>
        <p className="text-gray-600">
          <strong>Trainer:</strong> {memberData.nextSession.trainer}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
