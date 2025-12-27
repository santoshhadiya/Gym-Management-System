import React from 'react';

const Invoices = () => {
  const invoices = [
    {
      id: 'INV001',
      date: '2025-06-10',
      amount: 1500,
      method: 'UPI',
      status: 'Paid',
    },
    {
      id: 'INV002',
      date: '2025-07-10',
      amount: 1500,
      method: 'Card',
      status: 'Paid',
    },
    {
      id: 'INV003',
      date: '2025-08-10',
      amount: 1500,
      method: 'Pending',
      status: 'Unpaid',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Your Invoices</h1>
      <p className="text-gray-600 mb-4">Track your membership payments and download receipts.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Invoice #</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Amount (₹)</th>
              <th className="py-2 px-4">Payment Method</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="py-2 px-4">{invoice.id}</td>
                <td className="py-2 px-4">{invoice.date}</td>
                <td className="py-2 px-4">₹{invoice.amount}</td>
                <td className="py-2 px-4">{invoice.method}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <button className="text-sm text-blue-600 hover:underline" disabled={invoice.status !== 'Paid'}>
                    {invoice.status === 'Paid' ? 'Download' : 'Pending'}
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
