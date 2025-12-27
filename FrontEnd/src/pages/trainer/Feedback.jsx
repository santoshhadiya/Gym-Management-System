import React from 'react';

const Feedback = () => {
  // Sample feedback data (replace with backend data)
  const feedbackList = [
    {
      id: 1,
      member: 'Ravi Patel',
      rating: 5,
      message: 'Great training sessions! I feel much stronger.',
      date: '2025-08-01',
    },
    {
      id: 2,
      member: 'Priya Shah',
      rating: 4,
      message: 'Helpful guidance and consistent follow-ups. 👍',
      date: '2025-07-28',
    },
    {
      id: 3,
      member: 'Amit Joshi',
      rating: 3,
      message: 'Good trainer, but I’d like more stretching routines.',
      date: '2025-07-26',
    },
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Member Feedback</h1>

      {feedbackList.length === 0 ? (
        <p className="text-gray-500">No feedback received yet.</p>
      ) : (
        <div className="space-y-5">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{fb.member}</h3>
                <span className="text-sm text-gray-500">{fb.date}</span>
              </div>
              <div className="text-yellow-500 text-sm mb-2">{renderStars(fb.rating)}</div>
              <p className="text-gray-700">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
