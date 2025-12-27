import React from "react";

const Feedbacks = () => {
  const feedbackList = [
    {
      id: 1,
      member: "Riya Patel",
      rating: 4.8,
      message: "Great trainers and equipment. Love the atmosphere!",
      date: "2025-08-01",
    },
    {
      id: 2,
      member: "Amit Sharma",
      rating: 4.2,
      message: "Good gym but music can be improved.",
      date: "2025-07-28",
    },
    {
      id: 3,
      member: "John Doe",
      rating: 5.0,
      message: "Best gym experience I’ve ever had!",
      date: "2025-07-25",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Member Feedbacks</h1>

      {feedbackList.length === 0 ? (
        <p className="text-gray-500">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className="border rounded-lg p-4 shadow-sm bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-semibold">{fb.member}</h2>
                <span className="text-sm text-gray-500">{fb.date}</span>
              </div>
              <p className="text-gray-800 mb-2">{fb.message}</p>
              <span className="text-yellow-600 font-medium">⭐ {fb.rating}/5</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
