import React, { useState } from "react";

const ManageTrainer = () => {
  const [trainers, setTrainers] = useState([
    { id: 1, name: "Raj Mehta", phone: "9876543210", status: "Active" },
    { id: 2, name: "Sneha Rathi", phone: "9123456789", status: "Inactive" },
  ]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    if (!name || !phone) {
      alert("All fields are required.");
      return;
    }

    const newTrainer = {
      id: Date.now(),
      name,
      phone,
      status: "Active",
    };

    setTrainers([newTrainer, ...trainers]);
    setName("");
    setPhone("");
  };

  const handleDelete = (id) => {
    const updated = trainers.filter((t) => t.id !== id);
    setTrainers(updated);
  };

  const toggleStatus = (id) => {
    const updated = trainers.map((t) =>
      t.id === id
        ? { ...t, status: t.status === "Active" ? "Inactive" : "Active" }
        : t
    );
    setTrainers(updated);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Manage Trainers</h1>

      {/* Add Trainer Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm space-y-4">
        <div>
          <label className="block font-medium">Trainer Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add Trainer
        </button>
      </div>

      {/* Trainer List */}
      {trainers.length === 0 ? (
        <p className="text-gray-500">No trainers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer) => (
                <tr key={trainer.id} className="text-center hover:bg-gray-50">
                  <td className="border px-4 py-2">{trainer.id}</td>
                  <td className="border px-4 py-2">{trainer.name}</td>
                  <td className="border px-4 py-2">{trainer.phone}</td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      trainer.status === "Active"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {trainer.status}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => toggleStatus(trainer.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDelete(trainer.id)}
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

export default ManageTrainer;
