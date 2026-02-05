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
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

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
  const { colors, theme } = useTheme(); // Access custom colors and current theme

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
    // Note: react-toastify link removed as it is no longer used
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
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
  }, [api]);

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
    if (!transactions.length) return { trend: { labels: [], data: [] }, plans: { labels: [], data: [] }, methods: { labels: [], data: [] } };

    // Standardize "Now" to local midnight for accurate range comparisons
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let filteredTxns = [];
    let trendLabels = [];
    let trendData = [];

    // 1. FILTER DATA & SETUP AXIS
    if (graphFilter === "Today") {
      trendLabels = ["6 AM", "10 AM", "2 PM", "6 PM", "10 PM"];
      trendData = new Array(5).fill(0);
      
      filteredTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear() && 
               d.getMonth() === now.getMonth() && 
               d.getDate() === now.getDate();
      });

      filteredTxns.forEach(t => {
        if (!["Paid", "Success"].includes(t.status)) return;
        const h = new Date(t.date).getHours();
        if (h >= 6 && h < 10) trendData[0] += Number(t.amount);
        else if (h >= 10 && h < 14) trendData[1] += Number(t.amount);
        else if (h >= 14 && h < 18) trendData[2] += Number(t.amount);
        else if (h >= 18 && h < 22) trendData[3] += Number(t.amount);
        else trendData[4] += Number(t.amount); 
      });

    } else if (graphFilter === "This Week") {
      trendLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      trendData = new Array(7).fill(0);
      
      // Calculate start of current week (Sunday)
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfWeekTime = startOfWeek.getTime();

      filteredTxns = transactions.filter(t => new Date(t.date).getTime() >= startOfWeekTime);
      
      filteredTxns.forEach(t => {
        if (["Paid", "Success"].includes(t.status)) {
           const dayIndex = new Date(t.date).getDay();
           trendData[dayIndex] += Number(t.amount);
        }
      });

    } else if (graphFilter === "This Month") {
      trendLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      trendData = new Array(5).fill(0);
      
      filteredTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      filteredTxns.forEach(t => {
        if (["Paid", "Success"].includes(t.status)) {
           const dayOfMonth = new Date(t.date).getDate();
           const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);
           trendData[weekIdx] += Number(t.amount);
        }
      });

    } else if (graphFilter === "This Year") {
      trendLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      trendData = new Array(12).fill(0);
      
      filteredTxns = transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
      
      filteredTxns.forEach(t => {
        if (["Paid", "Success"].includes(t.status)) {
           const monthIdx = new Date(t.date).getMonth();
           trendData[monthIdx] += Number(t.amount);
        }
      });

    } else if (graphFilter === "All Time") {
      const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort();
      trendLabels = years.map(String);
      trendData = new Array(years.length).fill(0);
      
      filteredTxns = transactions;
      
      filteredTxns.forEach(t => {
        if (["Paid", "Success"].includes(t.status)) {
           const yr = new Date(t.date).getFullYear();
           const idx = years.indexOf(yr);
           if(idx > -1) trendData[idx] += Number(t.amount);
        }
      });
    }

    // 2. AGGREGATE PLANS & METHODS
    const planMap = {};
    const methodMap = {};
    filteredTxns.forEach(t => {
       if (["Paid", "Success"].includes(t.status)) {
          const pName = t.plan || "Unknown";
          const mName = t.method || "Other";
          planMap[pName] = (planMap[pName] || 0) + Number(t.amount);
          methodMap[mName] = (methodMap[mName] || 0) + 1;
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
    plugins: { 
        legend: { 
            position: 'bottom', 
            labels: { 
                usePointStyle: true, 
                boxWidth: 8,
                color: colors.text // Dynamic text color
            } 
        } 
    },
    scales: { 
        x: { 
            grid: { display: false },
            ticks: { color: colors.textMuted } // Dynamic tick color
        }, 
        y: { 
            grid: { 
                borderDash: [4, 4], 
                color: colors.border // Dynamic grid color
            },
            ticks: { color: colors.textMuted }
        } 
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { 
            position: 'right', 
            labels: { 
                usePointStyle: true, 
                boxWidth: 10,
                color: colors.text 
            } 
        } 
    }
  };

  const trendDataset = {
    labels: chartData.trend.labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: chartData.trend.data,
      borderColor: colors.primary, // Use Lime Green
      backgroundColor: theme === 'dark' ? 'rgba(217, 241, 127, 0.1)' : 'rgba(217, 241, 127, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: colors.background,
      pointBorderColor: colors.primary,
    }]
  };

  const planDataset = {
    labels: chartData.plans.labels,
    datasets: [{
      label: 'Revenue by Plan',
      data: chartData.plans.data,
      backgroundColor: [colors.secondary, colors.accent, colors.primary, colors.border], // Theme palette
      borderRadius: 6
    }]
  };

  const methodDataset = {
    labels: chartData.methods.labels,
    datasets: [{
      data: chartData.methods.data,
      backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.border],
      hoverOffset: 4
    }]
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen" style={{ backgroundColor: colors.background }}>
           <i className="fa-solid fa-circle-notch fa-spin text-4xl" style={{ color: colors.border }}></i>
        </div>
     );
  }

  return (
    <div 
      className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
      style={{  color: colors.text }}
    >
      {/* HEADER & TOP STATS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Financial Reports</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Overview of your business performance.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="px-5 py-3 rounded-2xl border transition-colors" style={{ backgroundColor: theme === 'dark' ? colors.card : '#f0fdf4', borderColor: theme === 'dark' ? colors.border : '#dcfce7' }}>
              <p className="text-xs font-bold uppercase" style={{ color: colors.primary }}>Total Revenue</p>
              <p className="text-xl font-black" style={{ color: colors.text }}>₹{stats.totalRevenue.toLocaleString()}</p>
           </div>
           <div className="px-5 py-3 rounded-2xl border transition-colors" style={{ backgroundColor: theme === 'dark' ? colors.card : '#eff6ff', borderColor: theme === 'dark' ? colors.border : '#dbeafe' }}>
              <p className="text-xs font-bold uppercase" style={{ color: colors.secondary }}>This Month</p>
              <p className="text-xl font-black" style={{ color: colors.text }}>₹{stats.monthlyRevenue.toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* CHARTS SECTION WITH FILTER */}
      <div className="mb-8">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: colors.text }}>
               <i className="fa-solid fa-chart-pie" style={{ color: colors.secondary }}></i> Analytics
            </h3>
            <div className="p-1 rounded-xl border flex transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               {["Today", "This Week", "This Month", "This Year", "All Time"].map(period => (
                  <button
                     key={period}
                     onClick={() => setGraphFilter(period)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${graphFilter === period ? 'shadow' : 'hover:opacity-80'}`}
                     style={{ 
                        backgroundColor: graphFilter === period ? colors.background : 'transparent',
                        color: graphFilter === period ? colors.secondary : colors.textMuted 
                     }}
                  >
                     {period}
                  </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <div className="p-6 rounded-3xl border shadow-sm xl:col-span-2 transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <h4 className="font-bold mb-4 text-sm" style={{ color: colors.text }}>Revenue Trend ({graphFilter})</h4>
               <div className="h-64">
                  <Line data={trendDataset} options={commonOptions} />
               </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6 rounded-3xl border shadow-sm transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <h4 className="font-bold mb-4 text-sm" style={{ color: colors.text }}>Payment Methods</h4>
               <div className="h-48">
                  {chartData.methods.data.length > 0 ? (
                     <Doughnut data={methodDataset} options={pieOptions} />
                  ) : (
                     <div className="h-full flex items-center justify-center text-xs" style={{ color: colors.textMuted }}>No data for this period</div>
                  )}
               </div>
            </div>

            {/* Plan Performance */}
            <div className="p-6 rounded-3xl border shadow-sm xl:col-span-3 transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <h4 className="font-bold mb-4 text-sm" style={{ color: colors.text }}>Revenue by Plan ({graphFilter})</h4>
               <div className="h-56">
                  {chartData.plans.data.length > 0 ? (
                     <Bar data={planDataset} options={commonOptions} />
                  ) : (
                     <div className="h-full flex items-center justify-center text-xs" style={{ color: colors.textMuted }}>No data for this period</div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* TRANSACTION HISTORY WITH DATE FILTERS */}
      <div className="rounded-3xl shadow-sm overflow-hidden border transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
         <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: colors.border }}>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Transaction History</h3>
            
            <div className="flex flex-wrap items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                  <span className="text-xs font-bold" style={{ color: colors.textMuted }}>From</span>
                  <input 
                     type="date" 
                     value={historyFrom}
                     onChange={(e) => setHistoryFrom(e.target.value)}
                     className="bg-transparent text-xs font-bold outline-none"
                     style={{ color: colors.text }}
                  />
               </div>
               <div className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                  <span className="text-xs font-bold" style={{ color: colors.textMuted }}>To</span>
                  <input 
                     type="date" 
                     value={historyTo}
                     onChange={(e) => setHistoryTo(e.target.value)}
                     className="bg-transparent text-xs font-bold outline-none"
                     style={{ color: colors.text }}
                  />
               </div>
               <button 
                  onClick={handleExport}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
               >
                  <i className="fa-solid fa-download mr-1"></i> Export
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" style={{ color: colors.text }}>
               <thead className="font-semibold uppercase text-xs" style={{ backgroundColor: theme === 'dark' ? colors.sidebar : '#f8f9fa' }}>
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
               <tbody className="divide-y" style={{ divideColor: colors.border }}>
                  {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                     <tr key={t._id} className="transition-colors hover:opacity-80">
                        <td className="px-6 py-4 font-mono text-xs" style={{ color: colors.textMuted }}>{t.id}</td>
                        <td className="px-6 py-4">{t.date}</td>
                        <td className="px-6 py-4 font-bold" style={{ color: colors.text }}>{t.member}</td>
                        <td className="px-6 py-4 text-xs">{t.plan}</td>
                        <td className="px-6 py-4 text-xs">{t.method}</td>
                        <td className="px-6 py-4 text-right font-bold" style={{ color: colors.text }}>
                           ₹{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span 
                             className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                             style={{ 
                                backgroundColor: (t.status === 'Paid' || t.status === 'Success') ? colors.primary : '#fee2e2',
                                color: (t.status === 'Paid' || t.status === 'Success') ? '#111827' : '#ef4444',
                                borderColor: (t.status === 'Paid' || t.status === 'Success') ? colors.primary : '#fecaca'
                             }}
                           >
                              {t.status}
                           </span>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan="7" className="px-6 py-12 text-center" style={{ color: colors.textMuted }}>
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