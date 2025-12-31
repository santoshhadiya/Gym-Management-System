import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { ToastContainer, toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FinancialReports = () => {
  // --- MOCK DATA ---
  const [financialData, setFinancialData] = useState({
    summary: {
      totalRevenue: 1250000,
      monthlyRevenue: 120000,
      pendingDues: 45000,
      totalRefunds: 15000,
      growth: 12.5 // % growth
    },
    revenueTrend: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [90000, 95000, 100000, 110000, 105000, 115000, 120000, 125000, 130000, 128000, 135000, 140000]
    },
    planPerformance: {
      labels: ["Monthly Basic", "Quarterly Pro", "Yearly Elite"],
      data: [450000, 350000, 450000] // Total revenue per plan
    },
    paymentMethods: {
      labels: ["UPI", "Cash", "Card"],
      data: [60, 30, 10] // Percentage
    },
    paymentStatus: {
      labels: ["Paid", "Pending", "Overdue"],
      data: [350, 45, 15] // Count of members
    },
    transactions: [
      { id: "TXN-8821", date: "2024-10-25", member: "Riya Patel", amount: 12000, type: "Income", method: "UPI", recordedBy: "Admin" },
      { id: "TXN-8822", date: "2024-10-24", member: "Arjun Singh", amount: 4000, type: "Income", method: "Cash", recordedBy: "Manager" },
      { id: "REF-0012", date: "2024-10-22", member: "Amit Kumar", amount: 4000, type: "Refund", method: "Bank Transfer", recordedBy: "Admin" },
      { id: "TXN-8823", date: "2024-10-20", member: "Sneha Gupta", amount: 1500, type: "Income", method: "Card", recordedBy: "System" },
    ]
  });

  // --- STATE ---
  const [filter, setFilter] = useState("This Year"); // Today, This Month, This Year
  const [viewState, setViewState] = useState("dashboard"); // dashboard, list

  // --- STYLE INJECTION ---
  useEffect(() => {
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    // Financial Alert Check
    if (financialData.summary.pendingDues > 40000) {
      toast.warn(`High Pending Dues Detected: ₹${financialData.summary.pendingDues.toLocaleString()}`, { autoClose: 6000 });
    }

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- HELPERS ---
  const handleExport = () => {
    const headers = ["ID,Date,Member,Amount,Type,Method,RecordedBy"];
    const rows = financialData.transactions.map(t => 
      `${t.id},${t.date},${t.member},${t.amount},${t.type},${t.method},${t.recordedBy}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Financial Report Downloaded");
  };

  // --- CHART OPTIONS ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
    scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [4, 4], color: '#f0f0f0' } } }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 10 } } }
  };

  // --- DATASETS ---
  const trendData = {
    labels: financialData.revenueTrend.labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: financialData.revenueTrend.data,
      borderColor: '#D9F17F',
      backgroundColor: 'rgba(217, 241, 127, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#D9F17F',
    }]
  };

  const planData = {
    labels: financialData.planPerformance.labels,
    datasets: [{
      label: 'Revenue by Plan',
      data: financialData.planPerformance.data,
      backgroundColor: ['#CDE7FE', '#FEEF75', '#D9F17F'],
      borderRadius: 6
    }]
  };

  const methodData = {
    labels: financialData.paymentMethods.labels,
    datasets: [{
      data: financialData.paymentMethods.data,
      backgroundColor: ['#D9F17F', '#CDE7FE', '#FEEF75'],
      hoverOffset: 4
    }]
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive overview of income, dues, and trends.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
          >
            <option>Today</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>

          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

          <button 
            onClick={handleExport}
            className="px-5 py-2 bg-[#FEEF75] text-yellow-900 rounded-full text-xs font-bold shadow-sm hover:bg-yellow-300 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      {/* SUMMARY DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#f0fdf4] border border-green-100 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-sack-dollar text-6xl text-green-700"></i></div>
           <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Total Revenue</p>
           <h2 className="text-3xl font-black text-gray-900">₹{(financialData.summary.totalRevenue / 100000).toFixed(2)}L</h2>
           <p className="text-xs text-green-600 mt-2 font-bold"><i className="fa-solid fa-arrow-trend-up"></i> +{financialData.summary.growth}% vs last year</p>
        </div>

        <div className="bg-[#eff6ff] border border-blue-100 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-calendar-check text-6xl text-blue-700"></i></div>
           <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Monthly Income</p>
           <h2 className="text-3xl font-black text-gray-900">₹{(financialData.summary.monthlyRevenue / 1000).toFixed(1)}k</h2>
           <p className="text-xs text-blue-600 mt-2 font-bold">Current Month</p>
        </div>

        <div className="bg-[#fffbeb] border border-yellow-100 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-clock text-6xl text-yellow-700"></i></div>
           <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">Pending Dues</p>
           <h2 className="text-3xl font-black text-gray-900">₹{(financialData.summary.pendingDues / 1000).toFixed(1)}k</h2>
           <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><i className="fa-solid fa-triangle-exclamation"></i> Action Required</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-rotate-left text-6xl text-gray-600"></i></div>
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Refunds</p>
           <h2 className="text-3xl font-black text-gray-800">₹{(financialData.summary.totalRefunds / 1000).toFixed(1)}k</h2>
           <p className="text-xs text-gray-400 mt-2 font-bold">Processed Returns</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm xl:col-span-2">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D9F17F]/30 flex items-center justify-center text-green-700">
                 <i className="fa-solid fa-chart-line text-sm"></i>
              </div>
              Monthly Revenue Trend
           </h3>
           <div className="h-64">
              <Line data={trendData} options={commonOptions} />
           </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#CDE7FE]/30 flex items-center justify-center text-blue-700">
                 <i className="fa-solid fa-wallet text-sm"></i>
              </div>
              Payment Methods
           </h3>
           <div className="h-48">
              <Doughnut data={methodData} options={pieOptions} />
           </div>
           <p className="text-xs text-gray-400 text-center mt-4">UPI is the most preferred mode (60%)</p>
        </div>

        {/* Plan Performance */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm xl:col-span-2">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FEEF75]/30 flex items-center justify-center text-yellow-800">
                 <i className="fa-solid fa-layer-group text-sm"></i>
              </div>
              Revenue by Membership Plan
           </h3>
           <div className="h-56">
              <Bar data={planData} options={commonOptions} />
           </div>
        </div>

        {/* Collection Status */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                 <i className="fa-solid fa-file-invoice-dollar text-sm"></i>
              </div>
              Collection Status
           </h3>
           <div className="space-y-4">
              {financialData.paymentStatus.labels.map((label, idx) => (
                 <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-600">{label}</span>
                    <span className={`text-sm font-bold ${label === 'Overdue' ? 'text-red-500' : label === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                       {financialData.paymentStatus.data[idx]} Members
                    </span>
                 </div>
              ))}
           </div>
           <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-center">
              <p className="text-xs text-red-600 font-bold">
                 <i className="fa-solid fa-bell mr-1"></i> 15 Members have overdue payments
              </p>
           </div>
        </div>
      </div>

      {/* AUDIT TRAIL / RECENT TRANSACTIONS */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">Audit Trail & Recent Transactions</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">Last 30 Days</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
               <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
                  <tr>
                     <th className="px-6 py-4">Transaction ID</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Details</th>
                     <th className="px-6 py-4">Type</th>
                     <th className="px-6 py-4 text-right">Amount</th>
                     <th className="px-6 py-4 text-right">Recorded By</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {financialData.transactions.map((t) => (
                     <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{t.id}</td>
                        <td className="px-6 py-4">{t.date}</td>
                        <td className="px-6 py-4">
                           <span className="font-bold text-gray-800">{t.member}</span>
                           <span className="text-xs text-gray-400 block">{t.method}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${t.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {t.type}
                           </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                           {t.type === 'Income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-xs">
                           <i className="fa-solid fa-user-shield text-gray-300 mr-1"></i> {t.recordedBy}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default FinancialReports;