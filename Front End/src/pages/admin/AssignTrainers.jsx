import React, { useState } from "react";

const AssignTrainers = () => {
  // Dummy data for example
  const members = ["John Doe", "Riya Patel", "David Smith", "Amit Sharma"];
  const trainers = ["Trainer A", "Trainer B", "Trainer C"];

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [assignments, setAssignments] = useState([]);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedTrainer) {
      alert("Please select both member and trainer.");
      return;
    }

    const newAssignment = {
      id: assignments.length + 1,
      member: selectedMember,
      trainer: selectedTrainer,
      assignedAt: new Date().toLocaleString(),
    };

    setAssignments([newAssignment, ...assignments]);
    setSelectedMember("");
    setSelectedTrainer("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Assign Trainer to Member</h1>

      <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Select Member</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">-- Choose Member --</option>
            {members.map((member, idx) => (
              <option key={idx} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Select Trainer</label>
          <select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">-- Choose Trainer --</option>
            {trainers.map((trainer, idx) => (
              <option key={idx} value={trainer}>
                {trainer}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Assign Trainer
          </button>
        </div>
      </form>

      {assignments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Current Assignments</h2>
          <ul className="space-y-3">
            {assignments.map((assign) => (
              <li key={assign.id} className="bg-gray-100 p-3 rounded shadow-sm">
                <strong>{assign.member}</strong> is assigned to <strong>{assign.trainer}</strong>{" "}
                <span className="text-sm text-gray-500">({assign.assignedAt})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignTrainers;
