import React, { useState, useEffect, useMemo } from "react";
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
  
  // Analytics Filter State
  const [graphFilter, setGraphFilter] = useState("This Week");
  
  // Transaction History Filter State
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    transactionCount: 0,
  });

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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payments/all");
        const data = res.data; 
        setTransactions(data);
        
        // Initial Global Stats (Independent of filters)
        calculateGlobalStats(data);
        
      } catch (error) {
        console.error("Financial Data Error:", error);
        toast.error("Failed to load financial reports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- CALCULATE GLOBAL STATS ---
  const calculateGlobalStats = (data) => {
    const now = new Date();
    let totalRev = 0;
    let monthRev = 0;

    data.forEach(t => {
       const tDate = new Date(t.date); 
       const amount = Number(t.amount);
       if (t.status === "Paid" || t.status === "Success") {
          totalRev += amount;
          if (tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()) {
             monthRev += amount;
          }
       }
    });

    setStats({
       totalRevenue: totalRev,
       monthlyRevenue: monthRev,
       transactionCount: data.length,
    });
  };

  // --- DYNAMIC CHART DATA GENERATION ---
  const chartData = useMemo(() => {
    if (!transactions.length) return { trend: {}, plans: {}, methods: {} };

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    let filteredTxns = [];
    let trendLabels = [];
    let trendData = [];

    // 1. FILTER DATA & SETUP AXIS
    if (graphFilter === "Today") {
      trendLabels = ["6 AM", "10 AM", "2 PM", "6 PM", "10 PM"];
      trendData = new Array(5).fill(0); // 4-hour blocks
      
      filteredTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getDate() === currentDate && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      filteredTxns.forEach(t => {
        if (t.status !== "Paid" && t.status !== "Success") return;
        const h = new Date(t.date).getHours();
        if (h >= 6 && h < 10) trendData[0] += t.amount;
        else if (h >= 10 && h < 14) trendData[1] += t.amount;
        else if (h >= 14 && h < 18) trendData[2] += t.amount;
        else if (h >= 18 && h < 22) trendData[3] += t.amount;
        else if (h >= 22 || h < 2) trendData[4] += t.amount; 
      });

    } else if (graphFilter === "This Week") {
      trendLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      trendData = new Array(7).fill(0);
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      filteredTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= startOfWeek && d <= endOfWeek;
      });

      filteredTxns.forEach(t => {
        if (t.status === "Paid" || t.status === "Success") {
           trendData[new Date(t.date).getDay()] += t.amount;
        }
      });

    } else if (graphFilter === "This Month") {
      // Divide into 4 weeks roughly
      trendLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      trendData = new Array(5).fill(0);

      filteredTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      filteredTxns.forEach(t => {
        if (t.status === "Paid" || t.status === "Success") {
           const d = new Date(t.date).getDate();
           const week = Math.floor((d - 1) / 7);
           trendData[week] += t.amount;
        }
      });

    } else if (graphFilter === "This Year") {
      trendLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      trendData = new Array(12).fill(0);

      filteredTxns = transactions.filter(t => new Date(t.date).getFullYear() === currentYear);

      filteredTxns.forEach(t => {
        if (t.status === "Paid" || t.status === "Success") {
           trendData[new Date(t.date).getMonth()] += t.amount;
        }
      });

    } else if (graphFilter === "All Time") {
      // Group by Year
      const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort();
      trendLabels = years;
      trendData = new Array(years.length).fill(0);
      
      filteredTxns = transactions; // All data

      filteredTxns.forEach(t => {
        if (t.status === "Paid" || t.status === "Success") {
           const idx = years.indexOf(new Date(t.date).getFullYear());
           if(idx > -1) trendData[idx] += t.amount;
        }
      });
    }

    // 2. AGGREGATE FOR PIE/BAR (Using Filtered Data)
    const planMap = {};
    const methodMap = {};

    filteredTxns.forEach(t => {
       if (t.status === "Paid" || t.status === "Success") {
          // Plan
          const plan = t.plan || "Unknown";
          planMap[plan] = (planMap[plan] || 0) + t.amount;
          
          // Method (Count)
          const method = t.method || "Other";
          methodMap[method] = (methodMap[method] || 0) + 1;
       }
    });

    return {
      trend: { labels: trendLabels, data: trendData },
      plans: { labels: Object.keys(planMap), data: Object.values(planMap) },
      methods: { labels: Object.keys(methodMap), data: Object.values(methodMap) }
    };

  }, [transactions, graphFilter]);


  // --- TRANSACTION LIST FILTERING ---
  const filteredTransactions = transactions.filter(t => {
    if (!historyFrom && !historyTo) return true;
    
    const tDate = new Date(t.date).setHours(0,0,0,0);
    const from = historyFrom ? new Date(historyFrom).setHours(0,0,0,0) : null;
    const to = historyTo ? new Date(historyTo).setHours(0,0,0,0) : null;

    if (from && to) return tDate >= from && tDate <= to;
    if (from) return tDate >= from;
    if (to) return tDate <= to;
    return true;
  });


  // --- HELPERS ---
  const handleExport = () => {
    const headers = ["ID,Date,Member,Plan,Amount,Method,Status"];
    const rows = filteredTransactions.map(t => 
      `${t.id},${t.date},${t.member},${t.plan},${t.amount},${t.method},${t.status}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Filtered Data Downloaded");
  };

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

      {/* HEADER & TOP STATS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your business performance.</p>
        </div>
        
        {/* Global Summary Cards (Static) */}
        <div className="flex gap-4">
           <div className="px-5 py-3 bg-[#f0fdf4] border border-green-100 rounded-2xl">
              <p className="text-xs text-green-600 font-bold uppercase">Total Revenue</p>
              <p className="text-xl font-black text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
           </div>
           <div className="px-5 py-3 bg-[#eff6ff] border border-blue-100 rounded-2xl">
              <p className="text-xs text-blue-600 font-bold uppercase">This Month</p>
              <p className="text-xl font-black text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* CHARTS SECTION WITH FILTER */}
      <div className="mb-8">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
               <i className="fa-solid fa-chart-pie text-[#CDE7FE]"></i> Analytics
            </h3>
            <div className="bg-gray-50 p-1 rounded-xl border border-gray-100 flex">
               {["Today", "This Week", "This Month", "This Year", "All Time"].map(period => (
                  <button
                     key={period}
                     onClick={() => setGraphFilter(period)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${graphFilter === period ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     {period}
                  </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm xl:col-span-2">
               <h4 className="font-bold text-gray-700 mb-4 text-sm">Revenue Trend ({graphFilter})</h4>
               <div className="h-64">
                  <Line data={trendDataset} options={commonOptions} />
               </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h4 className="font-bold text-gray-700 mb-4 text-sm">Payment Methods</h4>
               <div className="h-48">
                  {chartData.methods.data.length > 0 ? (
                     <Doughnut data={methodDataset} options={pieOptions} />
                  ) : (
                     <div className="h-full flex items-center justify-center text-gray-400 text-xs">No data for this period</div>
                  )}
               </div>
            </div>

            {/* Plan Performance */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm xl:col-span-3">
               <h4 className="font-bold text-gray-700 mb-4 text-sm">Revenue by Plan ({graphFilter})</h4>
               <div className="h-56">
                  {chartData.plans.data.length > 0 ? (
                     <Bar data={planDataset} options={commonOptions} />
                  ) : (
                     <div className="h-full flex items-center justify-center text-gray-400 text-xs">No data for this period</div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* TRANSACTION HISTORY WITH DATE FILTERS */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
            
            <div className="flex flex-wrap items-center gap-2">
               <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500">From</span>
                  <input 
                     type="date" 
                     value={historyFrom}
                     onChange={(e) => setHistoryFrom(e.target.value)}
                     className="bg-transparent text-xs font-bold text-gray-700 outline-none"
                  />
               </div>
               <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500">To</span>
                  <input 
                     type="date" 
                     value={historyTo}
                     onChange={(e) => setHistoryTo(e.target.value)}
                     className="bg-transparent text-xs font-bold text-gray-700 outline-none"
                  />
               </div>
               <button 
                  onClick={handleExport}
                  className="px-4 py-2 bg-[#FEEF75] text-yellow-900 rounded-xl text-xs font-bold hover:bg-yellow-300 transition-colors"
               >
                  <i className="fa-solid fa-download mr-1"></i> Export
               </button>
            </div>
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
                  {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
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
                  )) : (
                     <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                           No transactions found for the selected dates.
                        </td>
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