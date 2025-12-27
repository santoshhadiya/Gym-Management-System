import React, { useState } from 'react';

const Feedback = () => {
  const [form, setForm] = useState({
    rating: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.rating || !form.message) return;

    // Simulate feedback submission
    console.log('Submitted Feedback:', form);
    setSubmitted(true);

    // Reset form
    setForm({ rating: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Give Your Feedback</h1>
      <p className="text-gray-600 mb-6">
        Your opinion helps us improve! Please share your experience.
      </p>

      {submitted && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          🎉 Thank you! Your feedback has been submitted.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-1">Rating</label>
          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Select rating</option>
            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
            <option value="4">⭐⭐⭐⭐ - Good</option>
            <option value="3">⭐⭐⭐ - Average</option>
            <option value="2">⭐⭐ - Poor</option>
            <option value="1">⭐ - Very Poor</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold mb-1">Your Comments</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Write your feedback here..."
            className="w-full border px-3 py-2 rounded-lg"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;
