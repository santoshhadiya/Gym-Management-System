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
import { useTheme } from '../../context/ThemeContext';

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
  const { colors, theme } = useTheme();
  const options = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border outline-none"
        style={{ 
            backgroundColor: isOpen ? colors.secondary : colors.card, 
            borderColor: colors.border,
            color: isOpen ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.text 
        }}
      >
        <span>{selected}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: isOpen ? (theme === 'dark' ? '#fff' : colors.secondary) : colors.textMuted }}></i>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute right-0 top-full mt-2 w-40 rounded-2xl shadow-xl border overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in-95 duration-100"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className="p-1.5 space-y-0.5">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => { onSelect(option); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between group"
                  style={{ 
                    backgroundColor: selected === option ? colors.secondary : 'transparent',
                    color: selected === option ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.text 
                  }}
                >
                  {option}
                  {selected === option && <i className="fa-solid fa-check text-[10px]"></i>}
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
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const { colors, theme } = useTheme();
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

    let labels = [];
    let data = [];

    // Filter payments based on status first to clean up logic
    const paidPayments = payments.filter(p => p.status === "Paid" || p.status === "Success");

    if (timePeriod === "This Year") {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      data = new Array(12).fill(0);
      paidPayments.forEach(p => {
        const d = new Date(p.date);
        if (d.getFullYear() === currentYear) {
          data[d.getMonth()] += Number(p.amount);
        }
      });

    } else if (timePeriod === "This Month") {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      data = new Array(daysInMonth).fill(0);
      
      paidPayments.forEach(p => {
        const d = new Date(p.date);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          data[d.getDate() - 1] += Number(p.amount);
        }
      });

    } else if (timePeriod === "This Week") {
      labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      data = new Array(7).fill(0);
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      paidPayments.forEach(p => {
        const d = new Date(p.date);
        if (d >= startOfWeek && d <= endOfWeek) {
          data[d.getDay()] += Number(p.amount);
        }
      });

    } else if (timePeriod === "Today") {
      // Robust "Today" labels: Showing blocks of time throughout the day
      labels = ["Morning", "Noon", "Afternoon", "Evening", "Night", "Late Night"];
      const hourlyBuckets = new Array(6).fill(0); // 4-hour chunks
      
      paidPayments.forEach(p => {
        const d = new Date(p.date);  
        // Use toDateString for robust "same day" comparison ignoring timezones
        if (d.toDateString() === now.toDateString()) {
           const hour = d.getHours();
           // Bucketing logic:
           if (hour >= 5 && hour < 9) hourlyBuckets[0] += Number(p.amount); // Morning
           else if (hour >= 9 && hour < 13) hourlyBuckets[1] += Number(p.amount); // Noon
           else if (hour >= 13 && hour < 17) hourlyBuckets[2] += Number(p.amount); // Afternoon
           else if (hour >= 17 && hour < 21) hourlyBuckets[3] += Number(p.amount); // Evening
           else if (hour >= 21 || hour < 1) hourlyBuckets[4] += Number(p.amount); // Night
           else hourlyBuckets[5] += Number(p.amount); // Late Night
        }
      });

      data = hourlyBuckets;
    }

    return { labels, data };
  }, [payments, timePeriod]);

  const totalEarnings = chartData.data.reduce((a, b) => a + b, 0);

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: "Earnings",
      data: chartData.data,
      borderColor: colors.primary,
      backgroundColor: theme === 'dark' ? 'rgba(217, 241, 127, 0.1)' : 'rgba(217, 241, 127, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: colors.background,
      pointBorderColor: colors.primary,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        tooltip: {
            backgroundColor: colors.card,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
                label: function(context) {
                    return `₹${context.raw.toLocaleString()}`;
                }
            }
        }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: colors.border, borderDash: [5, 5] },
        ticks: { 
            color: colors.textMuted,
            callback: (value) => value > 0 ? `₹${value}` : value
        }
      },
      x: { 
        grid: { display: false },
        ticks: { color: colors.textMuted }
      },
    },
  };
 const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  return (
    <div 
        className="w-full border rounded-3xl p-6 shadow-sm transition-colors duration-300"
       style={{
              backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
              borderColor: getTransparentColor(colors.border, 0.2),
              backdropFilter: 'blur(16px)', // Blur effect
              WebkitBackdropFilter: 'blur(16px)'
            }}
    >
      <div className="flex justify-between items-start mb-1" >
        <div className="flex items-center gap-2" >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.textMuted }} >
            <i className="fa-solid fa-chart-line text-sm"></i>
          </div>
          <h3 className="font-semibold text-md" style={{ color: colors.text }}>Revenue Stream</h3>
        </div>
        <TimeDropdown selected={timePeriod} onSelect={setTimePeriod} />
      </div>

      <p className="text-sm mb-6 pl-10" style={{ color: colors.textMuted }}>
        Current Period: <span className="font-semibold" style={{ color: colors.primary }}>₹{totalEarnings.toLocaleString()}</span>
      </p>
      
      <div className="h-[300px] w-full" >
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default MonthlyEarningsChart_Admin;