import React, { useState } from "react";

const ManageMember = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "Riya Patel", phone: "9876543210", status: "Active" },
    { id: 2, name: "Amit Sharma", phone: "9123456789", status: "Inactive" },
  ]);

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this member?");
    if (confirmed) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
    }
  };

  const handleStatusToggle = (id) => {
    const updated = members.map((m) =>
      m.id === id
        ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" }
        : m
    );
    setMembers(updated);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Manage Members</h1>

      {members.length === 0 ? (
        <p className="text-gray-500">No members found.</p>
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
              {members.map((member) => (
                <tr key={member.id} className="text-center hover:bg-gray-50">
                  <td className="border px-4 py-2">{member.id}</td>
                  <td className="border px-4 py-2">{member.name}</td>
                  <td className="border px-4 py-2">{member.phone}</td>
                  <td
                    className={`border px-4 py-2 font-medium ${
                      member.status === "Active"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {member.status}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleStatusToggle(member.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
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

export default ManageMember;
