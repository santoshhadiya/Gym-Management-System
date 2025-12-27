import React from "react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Members",
      value: 120,
      color: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      title: "Total Trainers",
      value: 10,
      color: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      title: "Monthly Earnings",
      value: "₹1,50,000",
      color: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    {
      title: "Total Sessions",
      value: 480,
      color: "bg-purple-100",
      textColor: "text-purple-700",
    },
    {
      title: "Pending Verifications",
      value: 5,
      color: "bg-red-100",
      textColor: "text-red-700",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Hello,Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl p-5 shadow-sm ${stat.color}`}
          >
            <h2 className={`text-lg font-semibold ${stat.textColor}`}>
              {stat.title}
            </h2>
            <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Future: Charts / Top Members / Recent Activity */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Analytics (Coming Soon)</h2>
        <div className="bg-gray-100 p-6 rounded-xl text-center text-gray-500">
          You can add graphs, activity feeds, or top member stats here using Recharts, Chart.js or Firebase data.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
