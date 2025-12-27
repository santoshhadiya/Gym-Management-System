import React from "react";

const FinancialReports = () => {
  // Dummy data for now (can be fetched from DB later)
  const reportData = [
    {
      month: "July 2025",
      income: 120000,
      expenses: 80000,
    },
    {
      month: "June 2025",
      income: 110000,
      expenses: 95000,
    },
    {
      month: "May 2025",
      income: 100000,
      expenses: 70000,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Financial Reports</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Month</th>
              <th className="border border-gray-300 px-4 py-2">Income (₹)</th>
              <th className="border border-gray-300 px-4 py-2">Expenses (₹)</th>
              <th className="border border-gray-300 px-4 py-2">Profit/Loss (₹)</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => {
              const profit = item.income - item.expenses;
              const status = profit >= 0 ? "Profit" : "Loss";
              return (
                <tr
                  key={index}
                  className="text-center hover:bg-gray-50 transition"
                >
                  <td className="border px-4 py-2">{item.month}</td>
                  <td className="border px-4 py-2 text-green-700 font-medium">
                    ₹{item.income.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2 text-red-700 font-medium">
                    ₹{item.expenses.toLocaleString()}
                  </td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{profit.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-sm ${
                        profit >= 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialReports;
