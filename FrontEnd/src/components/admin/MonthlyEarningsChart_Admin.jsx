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
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

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
  const { colors, theme } = useTheme(); // Access custom colors and current theme
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
  const { api } = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme
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
      labels = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
      const hourlyData = new Array(24).fill(0);
      
      payments.forEach(p => {
        const d = new Date(p.date);  
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === currentDate && p.status === "Paid") {
           hourlyData[d.getHours()] += Number(p.amount);
        }
      });

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
      borderColor: colors.primary, // Lime Green
      backgroundColor: theme === 'dark' ? 'rgba(217, 241, 127, 0.1)' : 'rgba(217, 241, 127, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: colors.background,
      pointBorderColor: colors.primary,
      pointRadius: 5,
      pointHoverRadius: 7,
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
            bodyColor: colors.textMuted,
            borderColor: colors.border,
            borderWidth: 1
        }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: colors.border },
        ticks: { color: colors.textMuted }
      },
      x: { 
        grid: { display: false },
        ticks: { color: colors.textMuted }
      },
    },
  };

  return (
    <div 
        className="w-full border rounded-3xl p-6 shadow-sm transition-colors duration-300"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.textMuted }}>
            <i className="fa-solid fa-indian-rupee-sign text-sm"></i>
          </div>
          <h3 className="font-semibold text-md" style={{ color: colors.text }}>Earnings Analysis</h3>
        </div>
        <TimeDropdown selected={timePeriod} onSelect={setTimePeriod} />
      </div>

      <p className="text-sm mb-6 pl-10" style={{ color: colors.textMuted }}>
        Total: <span className="font-semibold" style={{ color: colors.text }}>₹{totalEarnings.toLocaleString()}</span>
      </p>
      
      <div className="h-[300px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default MonthlyEarningsChart_Admin;