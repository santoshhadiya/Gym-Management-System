import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom Stylish Dropdown Component
const TimeDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["This Year", "This Month", "This Week"];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border outline-none
          ${isOpen 
            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-2 ring-blue-100/50' 
            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <span>{selected}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible Backdrop to handle outside clicks */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Menu Container */}
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1.5 space-y-0.5">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between group
                    ${selected === option 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {option}
                  {selected === option && (
                    <i className="fa-solid fa-check text-blue-500 text-[10px]"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MonthlyEarningsChart_Admin = () => {
  const [timePeriod, setTimePeriod] = useState("This Year");

  // Dynamic Data Configuration
  const chartConfig = {
    "This Year": {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [2800, 3500, 4800, 7500, 8200, 9200, 8800, 9500, 10200, 11000, 11500, 12500],
    },
    "This Month": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [2100, 2400, 2800, 3200], // Weekly earnings
    },
    "This Week": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [350, 420, 380, 500, 650, 800, 750], // Daily earnings
    }
  };

  const currentConfig = chartConfig[timePeriod];

  // Calculate dynamic total for display
  const totalEarnings = useMemo(() => {
    return currentConfig.data.reduce((a, b) => a + b, 0);
  }, [currentConfig]);

  const earningsData = {
    labels: currentConfig.labels,
    datasets: [
      {
        label: "Earnings",
        data: currentConfig.data,
        borderColor: "#70a6d6",
        backgroundColor: "rgba(111,168,220,0.25)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#CDE7FE",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const earningsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#000",
        bodyColor: "#555",
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value >= 1000 ? value / 1000 + 'k' : value}`,
        },
        grid: {
          color: "#eee",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-indian-rupee-sign text-sm"></i>
          </div>
          <h3 className="font-semibold text-gray-800 text-md">
            {timePeriod === "This Week" ? "Weekly Earnings" : timePeriod === "This Month" ? "Monthly Earnings" : "Yearly Earnings"}
          </h3>
        </div>
        
        {/* Pass state and handler to dropdown */}
        <TimeDropdown selected={timePeriod} onSelect={setTimePeriod} />
      </div>

      <p className="text-sm text-gray-500 mb-6 pl-10">
        Total Earnings: <span className="font-semibold text-gray-900">₹{totalEarnings.toLocaleString()}</span> • 15% <i className="fa-solid fa-arrow-trend-up text-[#FEEF75]"></i> increase from last period
      </p>
      
      <div className="h-[300px] w-full">
        <Line data={earningsData} options={earningsOptions} />
      </div>
    </div>
  )
}

export default MonthlyEarningsChart_Admin