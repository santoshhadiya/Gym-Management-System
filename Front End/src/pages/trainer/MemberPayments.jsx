import React, { useState } from 'react';

const MemberPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const payments = [
    {
      id: 1,
      name: 'Ravi Patel',
      amount: 1200,
      method: 'UPI',
      status: 'Paid',
      date: '2025-08-01',
    },
    {
      id: 2,
      name: 'Priya Shah',
      amount: 1000,
      method: 'Cash',
      status: 'Pending',
      date: '2025-07-25',
    },
    {
      id: 3,
      name: 'Amit Joshi',
      amount: 1500,
      method: 'Card',
      status: 'Paid',
      date: '2025-07-15',
    },
  ];

  const filteredPayments = payments.filter((payment) =>
    payment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Member Payment Details</h1>

      <input
        type="text"
        placeholder="Search by member name..."
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-md text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Amount (₹)</th>
              <th className="py-2 px-3 text-left">Payment Method</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => (
              <tr key={payment.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">{payment.name}</td>
                <td className="py-2 px-3">₹{payment.amount}</td>
                <td className="py-2 px-3">{payment.method}</td>
                <td
                  className={`py-2 px-3 font-medium ${
                    payment.status === 'Paid' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {payment.status}
                </td>
                <td className="py-2 px-3">{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No matching payments found.</p>
      )}
    </div>
  );
};

export default MemberPayments;
