import React, { useState } from "react";

const UpdateSessions = () => {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      member: "Santosh Hadiya",
      date: "2025-08-01",
      type: "Cardio",
      duration: "45 mins",
    },
    {
      id: 2,
      member: "Jay Patel",
      date: "2025-08-01",
      type: "Weight Training",
      duration: "60 mins",
    },
  ]);

  const [formData, setFormData] = useState({
    member: "",
    date: "",
    type: "",
    duration: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSession = () => {
    if (!formData.member || !formData.date || !formData.type || !formData.duration) {
      alert("Please fill out all fields");
      return;
    }

    const newSession = {
      id: Date.now(),
      ...formData,
    };

    setSessions([newSession, ...sessions]);
    setFormData({ member: "", date: "", type: "", duration: "" });
  };

  const handleDelete = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Update Sessions</h1>

      {/* Add Session */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <input
          type="text"
          name="member"
          placeholder="Member Name"
          value={formData.member}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="type"
          placeholder="Session Type (e.g., Cardio)"
          value={formData.type}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="duration"
          placeholder="Duration (e.g., 45 mins)"
          value={formData.duration}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddSession}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {/* Sessions Table */}
      {sessions.length === 0 ? (
        <p className="text-gray-500">No session records available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Member</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Duration</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="text-center hover:bg-gray-50">
                  <td className="border px-4 py-2">{s.member}</td>
                  <td className="border px-4 py-2">{s.date}</td>
                  <td className="border px-4 py-2">{s.type}</td>
                  <td className="border px-4 py-2">{s.duration}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpdateSessions;
