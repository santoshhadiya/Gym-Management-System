import React from 'react';

const Reviews = () => {
  const reviews = [
    {
      name: 'Neha Shah',
      stars: 5,
      feedback:
        'Absolutely love the vibe and energy here! Trainers are super supportive and the workout plans actually work. Highly recommended!',
    },
    {
      name: 'Raj Patel',
      stars: 4,
      feedback:
        'The gym is spacious, clean, and has all modern equipment. Only wish it was open a bit later at night.',
    },
    {
      name: 'Jignesh Mehta',
      stars: 5,
      feedback:
        'Best gym in Ahmedabad! I’ve lost 8kg in 3 months thanks to my personal trainer and the diet plan.',
    },
    {
      name: 'Riya Desai',
      stars: 4,
      feedback:
        'Great environment and professional trainers. Yoga classes are the best part of my week!',
    },
  ];

  const renderStars = (count) => {
    return '⭐'.repeat(count);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 px-6 py-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Member Reviews</h1>
        <p className="text-lg text-gray-600">
          Real stories and experiences from our gym members.
        </p>
      </div>

      {/* Review Cards */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="mb-2 text-yellow-500 text-lg">
              {renderStars(review.stars)}
            </div>
            <p className="text-gray-700 italic mb-4">"{review.feedback}"</p>
            <h3 className="text-md font-semibold text-gray-900 text-right">
              — {review.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
