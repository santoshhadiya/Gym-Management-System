import React, { useState } from "react";

const MembershipPlan = () => {
  const [currentPlan] = useState({
    name: "Monthly Plan",
    price: 1500,
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    status: "Active",
  });

  const [plans] = useState([
    { id: 1, name: "Monthly Plan", price: 1500, duration: "1 Month" },
    { id: 2, name: "Quarterly Plan", price: 4000, duration: "3 Months" },
    { id: 3, name: "Yearly Plan", price: 15000, duration: "12 Months" },
  ]);

  const handleSubscribe = (plan) => {
    alert(`Redirecting to payment for ${plan.name} - ₹${plan.price}`);
    // Add real payment logic here
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Membership Plan</h1>

      {/* Current Membership */}
      <div className="mb-8 border-l-4 border-green-600 bg-green-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2 text-green-700">Current Plan</h2>
        <p><strong>Plan:</strong> {currentPlan.name}</p>
        <p><strong>Start Date:</strong> {currentPlan.startDate}</p>
        <p><strong>End Date:</strong> {currentPlan.endDate}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="text-green-700 font-medium">{currentPlan.status}</span>
        </p>
      </div>

      {/* All Available Plans */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upgrade / Renew Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border p-4 rounded shadow-sm bg-gray-50">
            <h3 className="text-lg font-bold text-red-600">{plan.name}</h3>
            <p className="text-gray-700">{plan.duration}</p>
            <p className="text-xl font-bold mt-2 mb-4">₹{plan.price}</p>
            <button
              onClick={() => handleSubscribe(plan)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPlan;
