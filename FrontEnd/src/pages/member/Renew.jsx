import React, { useState } from 'react';

const Renew = () => {
  const [form, setForm] = useState({
    selectedPlan: '',
    duration: '',
    paymentMethod: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.selectedPlan || !form.duration || !form.paymentMethod) return;
    console.log('Renewal Request:', form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ selectedPlan: '', duration: '', paymentMethod: '' });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Renew Membership</h1>
      <p className="text-gray-600 mb-6">Choose a plan and renew your membership easily.</p>

      {submitted && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Your membership renewal request has been submitted!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plan selection */}
        <div>
          <label className="block font-medium mb-1">Select Plan</label>
          <select
            name="selectedPlan"
            value={form.selectedPlan}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Choose Plan</option>
            <option value="Basic">Basic – ₹999</option>
            <option value="Gold">Gold – ₹1500</option>
            <option value="Platinum">Platinum – ₹2000</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block font-medium mb-1">Duration</label>
          <select
            name="duration"
            value={form.duration}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Select Duration</option>
            <option value="1 Month">1 Month</option>
            <option value="3 Months">3 Months</option>
            <option value="6 Months">6 Months</option>
            <option value="12 Months">12 Months</option>
          </select>
        </div>

        {/* Payment method */}
        <div>
          <label className="block font-medium mb-1">Payment Method</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Select Payment Method</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="NetBanking">Net Banking</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Renew Membership
        </button>
      </form>
    </div>
  );
};

export default Renew;
