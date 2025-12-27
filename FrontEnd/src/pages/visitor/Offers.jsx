import React from 'react';

const Offers = () => {
  const offers = [
    {
      title: '🎉 New Year Special',
      description: 'Get 25% off on all annual plans. Limited time offer!',
      validTill: 'Valid till January 15, 2026',
      badge: 'Best Value',
    },
    {
      title: '💪 Refer & Earn',
      description: 'Refer a friend and both of you get ₹300 off your next renewal.',
      validTill: 'Ongoing',
      badge: 'Popular',
    },
    {
      title: '🔥 Summer Fitness Blast',
      description: 'Buy 3-month plan and get 1 month absolutely free.',
      validTill: 'Valid till August 31, 2025',
      badge: 'Limited Time',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 px-6 py-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Special Offers & Discounts</h1>
        <p className="text-lg text-gray-600">
          Grab these exciting offers to kickstart or boost your fitness journey at Songar’s Gym!
        </p>
      </div>

      {/* Offers Grid */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {offers.map((offer, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600 hover:shadow-lg transition"
          >
            <div className="mb-2 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">{offer.title}</h2>
              <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                {offer.badge}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{offer.description}</p>
            <p className="text-sm text-gray-500">{offer.validTill}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-lg font-medium mb-4">Ready to claim your offer?</p>
        <a
          href="/visitor/contact"
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg transition"
        >
          Contact Us Now
        </a>
      </div>
    </div>
  );
};

export default Offers;
