import React, { useState } from "react";

const VerifyAccounts = () => {
  const [accounts, setAccounts] = useState([
    {
      id: "U001",
      name: "Santosh Hadiya",
      role: "Member",
      email: "santosh@example.com",
      status: "Pending",
    },
    {
      id: "U002",
      name: "Jay Patel",
      role: "Trainer",
      email: "jay@example.com",
      status: "Pending",
    },
  ]);

  const handleVerify = (id) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, status: "Verified" } : acc
      )
    );
  };

  const handleReject = (id) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, status: "Rejected" } : acc
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Verify Accounts</h1>

      {accounts.length === 0 ? (
        <p className="text-gray-500">No accounts pending verification.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-collapse border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">User ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="text-center hover:bg-gray-50">
                  <td className="border px-4 py-2">{acc.id}</td>
                  <td className="border px-4 py-2">{acc.name}</td>
                  <td className="border px-4 py-2">{acc.role}</td>
                  <td className="border px-4 py-2">{acc.email}</td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      acc.status === "Verified"
                        ? "text-green-600"
                        : acc.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {acc.status}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleVerify(acc.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      disabled={acc.status !== "Pending"}
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleReject(acc.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      disabled={acc.status !== "Pending"}
                    >
                      Reject
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

export default VerifyAccounts;
