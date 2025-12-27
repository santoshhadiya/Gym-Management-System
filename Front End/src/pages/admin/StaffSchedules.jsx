import React, { useState } from "react";

const StaffSchedules = () => {
  const [schedules, setSchedules] = useState([
    { id: 1, name: "Raj Mehta", day: "Monday", time: "7:00 AM - 9:00 AM" },
    { id: 2, name: "Sneha Patel", day: "Tuesday", time: "5:00 PM - 7:00 PM" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    day: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSchedule = () => {
    if (!formData.name || !formData.day || !formData.time) {
      alert("Please fill out all fields.");
      return;
    }

    const newSchedule = {
      id: Date.now(),
      ...formData,
    };

    setSchedules([newSchedule, ...schedules]);
    setFormData({ name: "", day: "", time: "" });
  };

  const handleDelete = (id) => {
    const filtered = schedules.filter((s) => s.id !== id);
    setSchedules(filtered);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Staff Schedules</h1>

      {/* Add Schedule Form */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Trainer Name"
          value={formData.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <select
          name="day"
          value={formData.day}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Day</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
          <option>Sunday</option>
        </select>
        <input
          type="text"
          name="time"
          placeholder="Time Slot (e.g., 6-8 AM)"
          value={formData.time}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={handleAddSchedule}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Assign
        </button>
      </div>

      {/* Schedule List */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Trainer</th>
              <th className="border px-4 py-2">Day</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="text-center hover:bg-gray-50">
                <td className="border px-4 py-2">{schedule.name}</td>
                <td className="border px-4 py-2">{schedule.day}</td>
                <td className="border px-4 py-2">{schedule.time}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffSchedules;
