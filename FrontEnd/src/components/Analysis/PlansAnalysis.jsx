import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PlansAnalysis = () => {
  // --- STATE FOR FILTERS ---
  // Active filters (used by charts)
  const [activeFilters, setActiveFilters] = useState({
    dateRange: "Yearly",
    plan: "All Plans",
    trainer: "All Trainers"
  });

  // Temporary filters (bound to inputs, waiting for "Apply")
  const [tempFilters, setTempFilters] = useState({
    dateRange: "Yearly",
    plan: "All Plans",
    trainer: "All Trainers"
  });

  const [isLoading, setIsLoading] = useState(false);

  const [goBack,setGoBack]=useState(false)
  // Handle Apply Button Click
  const handleApplyFilters = () => {
    setIsLoading(true);
    // Simulate data fetching delay
    setTimeout(() => {
      setActiveFilters(tempFilters);
      setIsLoading(false);
    }, 600);
  };

  // --- CHART DATA CONFIGURATION ---

  // Common Colors
  const colors = {
    blue: "#CDE7FE",
    yellow: "#FEEF75",
    lime: "#D9F17F",
    darkBlue: "#70a6d6",
    darkYellow: "#d4c028",
    darkLime: "#8db50b",
    gray: "#f3f4f6",
    text: "#374151"
  };

  // MOCK DATA GENERATORS (To simulate filter changes)
  // In a real app, these would depend on 'activeFilters'
  const getMultiplier = () => activeFilters.dateRange === "Monthly" ? 0.3 : activeFilters.dateRange === "Quarterly" ? 0.8 : 1;

  // 1. Plan Popularity (Doughnut)
  const planPopularityData = {
    labels: ["Basic Monthly", "Quarterly Pro", "Yearly Elite"],
    datasets: [
      {
        data: [120 * getMultiplier(), 85 * getMultiplier(), 45 * getMultiplier()],
        backgroundColor: [colors.blue, colors.yellow, colors.lime],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // 2. Revenue by Plan (Bar)
  const revenueData = {
    labels: ["Basic", "Quarterly", "Yearly", "Student"],
    datasets: [
      {
        label: "Total Revenue (₹)",
        data: [180000, 340000, 540000, 10000].map(v => v * getMultiplier()),
        backgroundColor: [colors.blue, colors.yellow, colors.lime, "#e5e7eb"],
        borderRadius: 8,
      },
    ],
  };

  // 3. Monthly Purchase Trend (Line)
  const purchaseTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    datasets: [
      {
        label: "New Subscriptions",
        data: [45, 52, 48, 60, 55, 68, 72, 80].map(v => v * getMultiplier()),
        borderColor: "#70a6d6", 
        backgroundColor: "rgba(205, 231, 254, 0.4)", 
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#70a6d6",
      },
    ],
  };

  // 4. Active vs Expired (Doughnut)
  const activeExpiredData = {
    labels: ["Active Members", "Expired Members"],
    datasets: [
      {
        data: [350, 120],
        backgroundColor: [colors.lime, "#e5e7eb"],
        hoverOffset: 4,
      },
    ],
  };

  // 5. Retention Rate (Bar - Grouped)
  const retentionData = {
    labels: ["Basic", "Quarterly", "Yearly"],
    datasets: [
      {
        label: "Renewed",
        data: [60, 40, 25],
        backgroundColor: colors.lime,
        borderRadius: 4,
      },
      {
        label: "Dropped",
        data: [20, 10, 5],
        backgroundColor: "#fee2e2", 
        borderRadius: 4,
      },
    ],
  };

  // 6. Plan Duration Comparison (Bar)
  const durationComparisonData = {
    labels: ["Short Term", "Mid Term", "Long Term"],
    datasets: [{
      label: "Members",
      data: [150, 90, 45],
      backgroundColor: [colors.blue, colors.yellow, colors.lime],
      borderRadius: 8,
      barThickness: 'flex', // Allow flex sizing
      maxBarThickness: 50,
    }]
  };

  // 7. Discount Impact (Bar)
  const discountImpactData = {
    labels: ["No Discount", "Offer Period"],
    datasets: [{
      label: "Sales Count",
      data: [45, 95],
      backgroundColor: ["#e5e7eb", colors.yellow],
      borderRadius: 8,
    }]
  };

  // 8. Trainer Load by Plan (Stacked Bar)
  const trainerLoadData = {
    labels: ["Raj Mehta", "Sneha Rathi", "Vikram Singh"],
    datasets: [
      {
        label: "Basic",
        data: [10, 15, 5],
        backgroundColor: colors.blue,
      },
      {
        label: "Quarterly",
        data: [5, 8, 12],
        backgroundColor: colors.yellow,
      },
      {
        label: "Yearly",
        data: [2, 5, 8],
        backgroundColor: colors.lime,
      },
    ],
  };

  // 9. Plan vs Attendance (Bar)
  const attendanceCorrelationData = {
    labels: ["Basic", "Quarterly", "Yearly"],
    datasets: [{
      label: "Avg. Weekly Visits",
      data: [2.5, 3.8, 4.5],
      backgroundColor: colors.darkBlue,
      borderRadius: 6,
    }]
  };

  // 10. Forecast (Line)
  const forecastData = {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "Projected Growth",
      data: [80, 85, 92, 105, 120],
      borderColor: colors.darkLime,
      backgroundColor: "transparent",
      borderDash: [5, 5],
      tension: 0.3,
      pointRadius: 4,
    }]
  };

  // --- CHART OPTIONS (Common) ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // Critical for responsive resizing
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { borderDash: [4, 4], color: '#f0f0f0' }, beginAtZero: true }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } } // Moved legend to bottom for better space usage in narrow columns
    }
  };

  // --- RENDER ---
  return (
    <div className="w-full bg-white min-h-screen p-4  font-sans">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        
        
        {/* Filters */}
        <div className="w-full xl:w-auto flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 items-center">
          <div className="flex-1 min-w-[120px]">
             <select 
               value={tempFilters.dateRange}
               onChange={(e) => setTempFilters({...tempFilters, dateRange: e.target.value})}
               className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none text-sm font-medium focus:ring-2 focus:ring-[#CDE7FE] outline-none cursor-pointer text-gray-700"
             >
               <option>Monthly</option>
               <option>Quarterly</option>
               <option>Yearly</option>
             </select>
          </div>
          
         


          <button 
            onClick={handleApplyFilters}
            disabled={isLoading}
            className={`px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${isLoading ? 'bg-gray-100 text-gray-400' : 'bg-[#FEEF75] text-yellow-900 hover:bg-yellow-300'}`}
          >
            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-filter"></i>}
            Apply
          </button>
        </div>
      </div>

      {/* --- MAIN DASHBOARD LAYOUT --- */}
      {/* Changed to max 3 cols on largest screens, and 2 cols on desktops, to prevent squishing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* 1. Plan Popularity */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Most Popular Plan</h3>
            <div className="w-8 h-8 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-600">
               <i className="fa-solid fa-crown text-xs"></i>
            </div>
          </div>
          {/* Increased Height for better visibility */}
          <div className="h-64 relative flex-1">
             <Doughnut data={planPopularityData} options={pieOptions} />
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-800 border border-blue-100 flex items-start gap-2">
            <i className="fa-solid fa-lightbulb mt-0.5 min-w-[12px]"></i>
            <span><strong>Insight:</strong> "Basic Monthly" is the preferred choice for 48% of new joiners.</span>
          </div>
        </div>

        {/* 2. Revenue (Span 2 cols on Large screens for better width) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Revenue Distribution</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg whitespace-nowrap">+12% vs last month</span>
          </div>
          {/* Increased Height */}
          <div className="h-64">
             <Bar data={revenueData} options={commonOptions} />
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <i className="fa-solid fa-arrow-trend-up text-[#D9F17F] mr-1"></i>
            Yearly Elite Plan contributes <strong>50%</strong> of total revenue despite fewer users.
          </div>
        </div>

        {/* 4. Active vs Expired */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Health Check</h3>
            <div className="w-8 h-8 rounded-full bg-[#D9F17F] flex items-center justify-center text-green-800">
               <i className="fa-solid fa-heart-pulse text-xs"></i>
            </div>
          </div>
          <div className="h-64 flex-1">
             <Doughnut data={activeExpiredData} options={{...pieOptions, plugins: { legend: { position: 'bottom' }}}} />
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-xs text-yellow-800 border border-yellow-100 flex items-start gap-2">
            <i className="fa-solid fa-triangle-exclamation mt-0.5 min-w-[12px]"></i>
            <span><strong>Action:</strong> 120 Expired members. Launch renewal campaign?</span>
          </div>
        </div>

         {/* 3. Purchase Trend */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Monthly Purchase Trend</h3>
            <div className="h-64">
              <Line data={purchaseTrendData} options={commonOptions} />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Consistent growth observed in Q2.</p>
         </div>

         {/* 5. Retention Rate */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Retention by Plan</h3>
            <div className="h-64">
              <Bar data={retentionData} options={commonOptions} />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Basic plan has highest churn rate (25%).</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         {/* 6. Duration Comparison */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Plan Duration Preference</h3>
            <div className="h-56">
               <Bar data={durationComparisonData} options={commonOptions} />
            </div>
            <div className="mt-3 p-2 bg-[#FEEF75]/20 rounded-lg text-xs text-gray-600 text-center">
               Promote "Yearly Elite" to shift users from Short Term.
            </div>
         </div>

         {/* 7. Discount Impact */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-0">
             <h3 className="font-bold text-gray-800 text-sm mb-4">Discount Impact</h3>
             <div className="h-56">
                <Bar data={discountImpactData} options={commonOptions} />
             </div>
             <p className="text-xs text-green-600 font-bold mt-2 text-center">Offers boost sales by 110%!</p>
         </div>

         {/* 8. Trainer Load */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-0">
             <h3 className="font-bold text-gray-800 text-sm mb-4">Trainer Load</h3>
             <div className="h-56">
                <Bar data={trainerLoadData} options={{
                  ...commonOptions, 
                  scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, display: false } }
                }} />
             </div>
             <p className="text-xs text-gray-400 mt-2 text-center">Sneha has a balanced mix of clients.</p>
         </div>
      </div>

      {/* Advanced Analysis Section */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
         <i className="fa-solid fa-chart-pie text-blue-500"></i> Advanced Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* 9. Engagement */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-0">
             <h3 className="font-bold text-gray-800 text-sm mb-4">Avg. Weekly Visits</h3>
             <div className="h-56">
                <Bar data={attendanceCorrelationData} options={commonOptions} />
             </div>
             <p className="text-xs text-gray-400 mt-2 text-center">Yearly members visit 2x more often.</p>
         </div>

         {/* 10. Forecast */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 bg-gradient-to-br from-white to-[#f0fdf4] min-w-0">
             <h3 className="font-bold text-gray-800 text-sm mb-4 flex justify-between">
                Growth Forecast
                <i className="fa-solid fa-wand-magic-sparkles text-[#D9F17F]"></i>
             </h3>
             <div className="h-56">
                <Line data={forecastData} options={commonOptions} />
             </div>
             <p className="text-xs text-gray-500 mt-2 text-center">Expected to reach 120 new/mo by Dec.</p>
         </div>

      </div>
    </div>
  );
};

export default PlansAnalysis;