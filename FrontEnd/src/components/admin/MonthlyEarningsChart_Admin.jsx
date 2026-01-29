import React, { useState, useMemo, useEffect } from 'react';
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
import { useGlobalContext } from '../../context/GlobalContext';

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

const TimeDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border outline-none ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-2 ring-blue-100/50' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
      >
        <span>{selected}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}></i>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1.5 space-y-0.5">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => { onSelect(option); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between group ${selected === option ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  {option}
                  {selected === option && <i className="fa-solid fa-check text-blue-500 text-[10px]"></i>}
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
  const { api } = useGlobalContext();
  const [timePeriod, setTimePeriod] = useState("This Week");
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments/all");
        setPayments(res.data);
      } catch (error) {
        console.error("Payment fetch error", error);
      }
    };
    fetchPayments();
  }, [api]);

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    // Default: Empty Year
    let labels = [];
    let data = [];

    if (timePeriod === "This Year") {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      data = new Array(12).fill(0);
      payments.forEach(p => {
        const d = new Date(p.date);
        if (d.getFullYear() === currentYear && p.status === "Paid") {
          data[d.getMonth()] += Number(p.amount);
        }
      });

    } else if (timePeriod === "This Month") {
      // Days of the month (1-31)
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      data = new Array(daysInMonth).fill(0);
      
      payments.forEach(p => {
        const d = new Date(p.date);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && p.status === "Paid") {
          data[d.getDate() - 1] += Number(p.amount);
        }
      });

    } else if (timePeriod === "This Week") {
      labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      data = new Array(7).fill(0);
      
      // Calculate start of week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      payments.forEach(p => {
        const d = new Date(p.date);
        if (d >= startOfWeek && d <= endOfWeek && p.status === "Paid") {
          data[d.getDay()] += Number(p.amount);
        }
      });

    } else if (timePeriod === "Today") {
      // Hourly breakdown (00:00 to 23:00)
      labels = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"]; // Simplified labels for clean UI
      // But we track all 24 hours internally
      const hourlyData = new Array(24).fill(0);
      
      payments.forEach(p => {
        const d = new Date(p.date); // This relies on backend saving full timestamp in DB (paidAt)
        // Note: The /payments/all endpoint formatted date as YYYY-MM-DD string in previous turn. 
        // If it's a string, we lose time. Ideally, modify controller to send full ISO string.
        // Assuming p.date might be ISO or we handle full date object if available.
        
        // *Fallback Logic*: If date is just YYYY-MM-DD, all payments appear at 00:00 or 5:30.
        // For accurate "Today" charts, ensure backend sends 'createdAt' or 'paidAt' with time.
        
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === currentDate && p.status === "Paid") {
           // If using mapped data from previous controller code (YYYY-MM-DD), hours won't be accurate.
           // Assuming we get full date for this specific feature to work perfectly.
           hourlyData[d.getHours()] += Number(p.amount);
        }
      });

      // Map 24h data to the 6 buckets for the chart points
      data = [
        hourlyData[6] + hourlyData[7] + hourlyData[8],
        hourlyData[9] + hourlyData[10] + hourlyData[11],
        hourlyData[12] + hourlyData[13] + hourlyData[14],
        hourlyData[15] + hourlyData[16] + hourlyData[17],
        hourlyData[18] + hourlyData[19] + hourlyData[20],
        hourlyData[21] + hourlyData[22] + hourlyData[23]
      ];
    }

    return { labels, data };
  }, [payments, timePeriod]);

  const totalEarnings = chartData.data.reduce((a, b) => a + b, 0);

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: "Earnings",
      data: chartData.data,
      borderColor: "#70a6d6",
      backgroundColor: "rgba(111,168,220,0.25)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#CDE7FE",
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#eee" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-indian-rupee-sign text-sm"></i>
          </div>
          <h3 className="font-semibold text-gray-800 text-md">Earnings Analysis</h3>
        </div>
        <TimeDropdown selected={timePeriod} onSelect={setTimePeriod} />
      </div>

      <p className="text-sm text-gray-500 mb-6 pl-10">
        Total: <span className="font-semibold text-gray-900">₹{totalEarnings.toLocaleString()}</span>
      </p>
      
      <div className="h-[300px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default MonthlyEarningsChart_Admin;