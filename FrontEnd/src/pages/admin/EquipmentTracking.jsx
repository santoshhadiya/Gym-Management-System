import React, { useState } from "react";

const EquipmentTracking = () => {
  const [equipmentList, setEquipmentList] = useState([
    { id: 1, name: "Treadmill", status: "Working" },
    { id: 2, name: "Dumbbells Set", status: "Under Maintenance" },
  ]);

  const [newEquipment, setNewEquipment] = useState("");
  const [newStatus, setNewStatus] = useState("Working");

  const handleAdd = () => {
    if (!newEquipment.trim()) return;
    const newItem = {
      id: Date.now(),
      name: newEquipment,
      status: newStatus,
    };
    setEquipmentList([newItem, ...equipmentList]);
    setNewEquipment("");
    setNewStatus("Working");
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedList = equipmentList.map((eq) =>
      eq.id === id ? { ...eq, status: newStatus } : eq
    );
    setEquipmentList(updatedList);
  };

  const handleDelete = (id) => {
    const updatedList = equipmentList.filter((eq) => eq.id !== id);
    setEquipmentList(updatedList);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Gym Equipment Tracking</h1>

      {/* Add New Equipment */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Equipment Name"
          className="border px-4 py-2 rounded w-full"
          value={newEquipment}
          onChange={(e) => setNewEquipment(e.target.value)}
        />
        <select
          className="border px-4 py-2 rounded"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          <option>Working</option>
          <option>Under Maintenance</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Equipment List */}
      <div className="space-y-4">
        {equipmentList.length === 0 ? (
          <p className="text-gray-500">No equipment listed yet.</p>
        ) : (
          equipmentList.map((eq) => (
            <div
              key={eq.id}
              className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded shadow-sm"
            >
              <div className="font-medium text-lg">{eq.name}</div>
              <div className="flex gap-2 items-center mt-2 md:mt-0">
                <select
                  value={eq.status}
                  onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                  className="border px-3 py-1 rounded"
                >
                  <option>Working</option>
                  <option>Under Maintenance</option>
                </select>
                <button
                  onClick={() => handleDelete(eq.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentTracking;
