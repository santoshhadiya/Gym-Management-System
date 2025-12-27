import React, { useState } from 'react';

const Payment = () => {
  const [form, setForm] = useState({
    plan: '',
    amount: '',
    method: '',
  });

  const [paid, setPaid] = useState(false);

  const plans = [
    { label: 'Basic Plan – ₹999/month', value: 'Basic', amount: 999 },
    { label: 'Gold Plan – ₹1500/month', value: 'Gold', amount: 1500 },
    { label: 'Platinum Plan – ₹2000/month', value: 'Platinum', amount: 2000 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      amount: name === 'plan' ? plans.find(p => p.value === value)?.amount || '' : prev.amount,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.plan || !form.method) return;
    console.log('Payment Info:', form);
    setPaid(true);
    setTimeout(() => setPaid(false), 3000);
    setForm({ plan: '', amount: '', method: '' });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Make a Payment</h1>
      <p className="text-gray-600 mb-6">Choose your plan and complete payment securely.</p>

      {paid && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Payment successful! Your membership will be updated shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection */}
        <div>
          <label className="block mb-1 font-medium">Select Plan</label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            required
          >
            <option value="">Choose Plan</option>
            {plans.map((plan, idx) => (
              <option key={idx} value={plan.value}>{plan.label}</option>
            ))}
          </select>
        </div>

        {/* Amount Display */}
        <div>
          <label className="block mb-1 font-medium">Amount (₹)</label>
          <input
            type="text"
            value={form.amount}
            readOnly
            className="w-full border px-3 py-2 rounded-lg bg-gray-100 text-gray-700"
            placeholder="₹"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block mb-1 font-medium">Payment Method</label>
          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            required
          >
            <option value="">Choose Payment Method</option>
            <option value="UPI">UPI</option>
            <option value="Card">Credit/Debit Card</option>
            <option value="NetBanking">Net Banking</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default Payment;
