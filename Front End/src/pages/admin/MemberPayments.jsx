import React, { useState } from "react";

const MemberPayments = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      date: "2025-07-01",
      amount: 1500,
      status: "Paid",
      method: "UPI",
    },
    {
      id: 2,
      date: "2025-06-01",
      amount: 1500,
      status: "Paid",
      method: "Cash",
    },
    {
      id: 3,
      date: "2025-05-01",
      amount: 1500,
      status: "Failed",
      method: "Card",
    },
  ]);

  const handleNewPayment = () => {
    alert("Redirecting to payment gateway (dummy)...");
    // Later: redirect to Razorpay / Stripe / custom logic
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Your Payments</h1>

      <button
        onClick={handleNewPayment}
        className="mb-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Make a New Payment
      </button>

      {payments.length === 0 ? (
        <p className="text-gray-500">No payment history available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Amount (₹)</th>
                <th className="border px-4 py-2">Method</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="text-center hover:bg-gray-50 transition"
                >
                  <td className="border px-4 py-2">{p.date}</td>
                  <td className="border px-4 py-2 font-medium text-green-700">
                    ₹{p.amount}
                  </td>
                  <td className="border px-4 py-2">{p.method}</td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      p.status === "Paid"
                        ? "text-green-600"
                        : p.status === "Failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {p.status}
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

export default MemberPayments;
