import React from 'react';

const Feedbacks = () => {
  const feedbackData = [
    {
      id: 1,
      member: 'Ravi Patel',
      rating: 5,
      comment: 'Excellent sessions, I feel great!',
      date: '2025-08-01',
    },
    {
      id: 2,
      member: 'Priya Shah',
      rating: 4,
      comment: 'Very professional and helpful guidance.',
      date: '2025-07-30',
    },
    {
      id: 3,
      member: 'Amit Joshi',
      rating: 3,
      comment: 'Good training, but would like more stretching tips.',
      date: '2025-07-28',
    },
  ];

  const renderStars = (count) => {
    return (
      <span className="text-yellow-500">
        {'★'.repeat(count)}
        {'☆'.repeat(5 - count)}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">All Member Feedbacks</h1>

      {feedbackData.length === 0 ? (
        <p className="text-gray-600">No feedback received yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbackData.map((fb) => (
            <div
              key={fb.id}
              className="p-4 border rounded-lg bg-gray-50 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800">{fb.member}</h3>
                <span className="text-sm text-gray-500">{fb.date}</span>
              </div>
              <div className="mb-2 text-sm">{renderStars(fb.rating)}</div>
              <p className="text-gray-700 text-sm">{fb.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
