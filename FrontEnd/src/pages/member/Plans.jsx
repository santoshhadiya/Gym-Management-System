import React from 'react';

const Plans = () => {
  const plans = [
    {
      name: 'Basic',
      price: 999,
      duration: '1 Month',
      features: [
        'Gym Access (6AM – 10PM)',
        'Standard Equipment Use',
        'Locker Access',
      ],
    },
    {
      name: 'Gold',
      price: 1500,
      duration: '1 Month',
      features: [
        'All Basic Features',
        '1 Free Diet Consultation',
        'Priority Trainer Scheduling',
        'Access to Group Classes',
      ],
    },
    {
      name: 'Platinum',
      price: 2000,
      duration: '1 Month',
      features: [
        'All Gold Features',
        'Weekly Progress Tracking',
        'Personalized Diet Plan',
        'Unlimited Trainer Support',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-8 text-center">Choose Your Membership Plan</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{plan.name} Plan</h2>
            <p className="text-gray-600 mb-4">{plan.duration}</p>
            <p className="text-3xl font-bold text-red-600 mb-4">₹{plan.price}</p>

            <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
