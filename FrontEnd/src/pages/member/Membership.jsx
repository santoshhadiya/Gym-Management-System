import React from 'react';

const Membership = () => {
  const membershipData = {
    type: 'Gold Plan',
    startDate: '2025-06-01',
    endDate: '2025-09-01',
    status: 'Active',
    sessionsRemaining: 8,
    benefits: [
      'Unlimited Gym Access',
      'Free Diet Consultation',
      'Priority Trainer Support',
      'Access to Group Classes',
    ],
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Your Membership</h1>
      <p className="text-gray-600 mb-6">
        Here are the details of your active gym membership.
      </p>

      {/* Membership Info Card */}
      <div className="bg-gray-100 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{membershipData.type}</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Start Date:</strong> {membershipData.startDate}</p>
          <p><strong>End Date:</strong> {membershipData.endDate}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold 
              ${membershipData.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
              }`}>
              {membershipData.status}
            </span>
          </p>
          <p><strong>Sessions Left:</strong> {membershipData.sessionsRemaining}</p>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Your Plan Benefits:</h3>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {membershipData.benefits.map((benefit, idx) => (
            <li key={idx}>{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Membership;
