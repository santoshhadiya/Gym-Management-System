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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

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
  const { api } = useGlobalContext();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    transactionCount: 0,
    growth: 0
  });

  const [chartData, setChartData] = useState({
    trend: { labels: [], data: [] },
    plans: { labels: [], data: [] },
    methods: { labels: [], data: [] }
  });

  const [filter, setFilter] = useState("This Year"); 

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

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- FETCH & PROCESS DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payments/all");
        const data = res.data; // Array of transactions

        setTransactions(data);
        processAnalytics(data);
      } catch (error) {
        console.error("Financial Data Error:", error);
        toast.error("Failed to load financial reports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processAnalytics = (data) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Summary Stats
    let totalRev = 0;
    let monthRev = 0;
    
    // 2. Chart Helpers
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrend = new Array(12).fill(0);
    const planMap = {};
    const methodMap = {};

    data.forEach(t => {
       // Assuming backend sends date in 'YYYY-MM-DD'
       const tDate = new Date(t.date); 
       const amount = Number(t.amount);

       // Filter: Only count 'Success' / 'Paid' (Backend returns 'Paid' status string based on logic)
       if (t.status === "Paid" || t.status === "Success") {
          totalRev += amount;

          // Monthly Revenue
          if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
             monthRev += amount;
          }

          // Trend Data (Current Year)
          if (tDate.getFullYear() === currentYear) {
             monthlyTrend[tDate.getMonth()] += amount;
          }

          // Plan Performance
          const planName = t.plan || "Unknown";
          planMap[planName] = (planMap[planName] || 0) + amount;

          // Payment Methods (Count)
          const method = t.method || "Other";
          methodMap[method] = (methodMap[method] || 0) + 1;
       }
    });

    setStats({
       totalRevenue: totalRev,
       monthlyRevenue: monthRev,
       transactionCount: data.length,
       growth: 0 // Requires historical data comparison, leaving 0 or implementing logic if needed
    });

    setChartData({
       trend: {
          labels: months,
          data: monthlyTrend
       },
       plans: {
          labels: Object.keys(planMap),
          data: Object.values(planMap)
       },
       methods: {
          labels: Object.keys(methodMap),
          data: Object.values(methodMap)
       }
    });
  };

  // --- HELPERS ---
  const handleExport = () => {
    const headers = ["ID,Date,Member,Plan,Amount,Method,Status"];
    const rows = transactions.map(t => 
      `${t.id},${t.date},${t.member},${t.plan},${t.amount},${t.method},${t.status}`
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

  // --- DATASETS BUILDERS ---
  const trendDataset = {
    labels: chartData.trend.labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: chartData.trend.data,
      borderColor: '#D9F17F',
      backgroundColor: 'rgba(217, 241, 127, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#D9F17F',
    }]
  };

  const planDataset = {
    labels: chartData.plans.labels,
    datasets: [{
      label: 'Revenue by Plan',
      data: chartData.plans.data,
      backgroundColor: ['#CDE7FE', '#FEEF75', '#D9F17F', '#e0e7ff'],
      borderRadius: 6
    }]
  };

  const methodDataset = {
    labels: chartData.methods.labels,
    datasets: [{
      data: chartData.methods.data,
      backgroundColor: ['#D9F17F', '#CDE7FE', '#FEEF75', '#f3f4f6'],
      hoverOffset: 4
    }]
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen bg-white">
           <i className="fa-solid fa-circle-notch fa-spin text-4xl text-gray-300"></i>
        </div>
     );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive overview of income and trends.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
          >
            <option>This Year</option>
            {/* Additional filters can be implemented in processAnalytics if needed */}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-[#f0fdf4] border border-green-100 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-sack-dollar text-6xl text-green-700"></i></div>
           <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Total Revenue</p>
           <h2 className="text-3xl font-black text-gray-900">₹{stats.totalRevenue.toLocaleString()}</h2>
           <p className="text-xs text-green-600 mt-2 font-bold">All time earnings</p>
        </div>

        {/* Monthly Income */}
        <div className="bg-[#eff6ff] border border-blue-100 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-calendar-check text-6xl text-blue-700"></i></div>
           <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Monthly Income</p>
           <h2 className="text-3xl font-black text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</h2>
           <p className="text-xs text-blue-600 mt-2 font-bold">Current Month</p>
        </div>

        {/* Total Transactions (Replaced Pending Dues/Refunds) */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><i className="fa-solid fa-receipt text-6xl text-gray-600"></i></div>
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Transactions</p>
           <h2 className="text-3xl font-black text-gray-800">{stats.transactionCount}</h2>
           <p className="text-xs text-gray-400 mt-2 font-bold">Processed Payments</p>
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
              Monthly Revenue Trend (Current Year)
           </h3>
           <div className="h-64">
              <Line data={trendDataset} options={commonOptions} />
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
              <Doughnut data={methodDataset} options={pieOptions} />
           </div>
           <p className="text-xs text-gray-400 text-center mt-4">Distribution by transaction count</p>
        </div>

        {/* Plan Performance (Full Width on Mobile/Tablet) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm xl:col-span-3">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FEEF75]/30 flex items-center justify-center text-yellow-800">
                 <i className="fa-solid fa-layer-group text-sm"></i>
              </div>
              Revenue by Membership Plan
           </h3>
           <div className="h-56">
              <Bar data={planDataset} options={commonOptions} />
           </div>
        </div>
      </div>

      {/* AUDIT TRAIL / RECENT TRANSACTIONS */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">Latest</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
               <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
                  <tr>
                     <th className="px-6 py-4">ID</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Member</th>
                     <th className="px-6 py-4">Plan</th>
                     <th className="px-6 py-4">Method</th>
                     <th className="px-6 py-4 text-right">Amount</th>
                     <th className="px-6 py-4 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {transactions.map((t) => (
                     <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{t.id}</td>
                        <td className="px-6 py-4">{t.date}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{t.member}</td>
                        <td className="px-6 py-4 text-xs">{t.plan}</td>
                        <td className="px-6 py-4 text-xs">{t.method}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                           ₹{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${t.status === 'Paid' || t.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {t.status}
                           </span>
                        </td>
                     </tr>
                  ))}
                  {transactions.length === 0 && (
                     <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">No transactions found.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default FinancialReports;