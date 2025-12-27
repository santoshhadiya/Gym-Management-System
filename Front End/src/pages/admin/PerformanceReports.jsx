import React, { useState } from "react";

const PerformanceReport = () => {
  const [report] = useState({
    name: "Santosh Hadiya",
    joinedOn: "2025-05-01",
    totalSessions: 48,
    attendedSessions: 44,
    weightLost: 4.5, // in kg
    strengthImprovement: "15%",
    goalAchieved: true,
  });

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Performance Report</h1>

      <div className="space-y-4 text-gray-800">
        <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded">
          <p><strong>Member:</strong> {report.name}</p>
          <p><strong>Joined On:</strong> {report.joinedOn}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-100 rounded shadow-sm">
            <p className="text-xl font-bold">{report.totalSessions}</p>
            <p>Total Sessions Assigned</p>
          </div>
          <div className="p-4 bg-green-100 rounded shadow-sm">
            <p className="text-xl font-bold">{report.attendedSessions}</p>
            <p>Sessions Attended</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded shadow-sm">
            <p className="text-xl font-bold">{report.weightLost} kg</p>
            <p>Weight Lost</p>
          </div>
          <div className="p-4 bg-purple-100 rounded shadow-sm">
            <p className="text-xl font-bold">{report.strengthImprovement}</p>
            <p>Strength Improvement</p>
          </div>
        </div>

        <div className="mt-6 bg-white border-l-4 border-indigo-500 p-4 shadow-md rounded">
          <p>
            <strong>Goal Status:</strong>{" "}
            <span
              className={`font-semibold ${
                report.goalAchieved ? "text-green-600" : "text-red-600"
              }`}
            >
              {report.goalAchieved ? "Achieved 🎯" : "In Progress"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
