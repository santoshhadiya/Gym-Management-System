import React, { useState } from "react";

const MonitorProgress = () => {
  const [progress, setProgress] = useState([
    {
      date: "2025-07-01",
      weight: 60,
      bodyFat: 18,
      bmi: 21.5,
    },
    {
      date: "2025-08-01",
      weight: 58,
      bodyFat: 16,
      bmi: 20.8,
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    date: "",
    weight: "",
    bodyFat: "",
    bmi: "",
  });

  const handleChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!newEntry.date || !newEntry.weight) {
      alert("Date and Weight are required.");
      return;
    }

    setProgress([{ ...newEntry }, ...progress]);
    setNewEntry({ date: "", weight: "", bodyFat: "", bmi: "" });
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Monitor Progress</h1>

      {/* Add Progress Entry */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            name="date"
            value={newEntry.date}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Date"
          />
          <input
            type="number"
            name="weight"
            value={newEntry.weight}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Weight (kg)"
          />
          <input
            type="number"
            name="bodyFat"
            value={newEntry.bodyFat}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Body Fat %"
          />
          <input
            type="number"
            name="bmi"
            value={newEntry.bmi}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="BMI"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Record
        </button>
      </div>

      {/* Progress Table */}
      {progress.length === 0 ? (
        <p className="text-gray-500">No progress data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Weight (kg)</th>
                <th className="border px-4 py-2">Body Fat %</th>
                <th className="border px-4 py-2">BMI</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((entry, index) => (
                <tr key={index} className="text-center hover:bg-gray-50">
                  <td className="border px-4 py-2">{entry.date}</td>
                  <td className="border px-4 py-2">{entry.weight}</td>
                  <td className="border px-4 py-2">{entry.bodyFat}</td>
                  <td className="border px-4 py-2">{entry.bmi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonitorProgress;
