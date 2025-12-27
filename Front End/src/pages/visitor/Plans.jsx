import React from 'react';

const Plans = () => {
  const pricingPlans = [
    {
      title: 'Basic Plan',
      price: '₹799/month',
      features: [
        'Access to gym equipment',
        'Locker & Shower access',
        '1 free personal training session',
      ],
      highlight: false,
    },
    {
      title: 'Standard Plan',
      price: '₹1999/quarter',
      features: [
        'Unlimited gym access',
        'Group classes (Zumba/Yoga)',
        'Nutrition consultation',
        'Locker & Shower access',
      ],
      highlight: true,
    },
    {
      title: 'Premium Plan',
      price: '₹6999/year',
      features: [
        'All Standard Plan features',
        'Weekly personal training',
        'Steam & Sauna (when available)',
        'Priority Support & Discounts',
      ],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Membership Plans</h1>
        <p className="text-lg text-gray-600">Choose a plan that fits your fitness goals</p>
      </div>

      {/* Plan Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pricingPlans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-xl border shadow-lg p-6 transition hover:scale-105 ${
              plan.highlight ? 'border-red-600 bg-red-50' : 'bg-white'
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h2>
            <p className="text-xl text-red-600 font-semibold mb-4">{plan.price}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <button className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
