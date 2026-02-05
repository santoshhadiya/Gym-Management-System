import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const TimeDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { colors, theme } = useTheme(); // Access custom colors and theme
  const options = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border outline-none`}
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
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between group`}
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

const TotalMembersChart_Admin = () => {
  const { api } = useGlobalContext();
  const { colors } = useTheme(); // Access custom colors
  const [members, setMembers] = useState([]);
  const [timePeriod, setTimePeriod] = useState("This Week");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/members");
        setMembers(res.data);
      } catch (error) { console.error(error); }
    };
    fetchMembers();
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
      members.forEach(m => {
        if (!m.joinDate) return;
        const d = new Date(m.joinDate);
        if (d.getFullYear() === currentYear) data[d.getMonth()] += 1;
      });

    } else if (timePeriod === "This Month") {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      data = new Array(daysInMonth).fill(0);
      members.forEach(m => {
        if (!m.joinDate) return;
        const d = new Date(m.joinDate);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          data[d.getDate() - 1] += 1;
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

      members.forEach(m => {
        if (!m.joinDate) return;
        const d = new Date(m.joinDate);
        if (d >= startOfWeek && d <= endOfWeek) data[d.getDay()] += 1;
      });

    } else if (timePeriod === "Today") {
      labels = ["0-4", "4-8", "8-12", "12-16", "16-20", "20-24"];
      data = new Array(6).fill(0);
      members.forEach(m => {
        if (!m.joinDate) return;
        const d = new Date(m.joinDate);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === currentDate) {
          const hour = d.getHours();
          data[Math.floor(hour / 4)] += 1;
        }
      });
    }

    return { labels, data };
  }, [members, timePeriod]);

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: "New Members",
      data: chartData.data,
      backgroundColor: [colors.secondary], // Soft Blue
      hoverBackgroundColor: colors.accent, // Yellow
      borderRadius: 8,
      barThickness: 'flex',
      maxBarThickness: 30, 
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
        borderWidth: 1,
        padding: 10,
        displayColors: false,
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.textMuted }}>
            <i className="fa-solid fa-users text-sm"></i>
          </div>
          <h3 className="font-semibold text-md" style={{ color: colors.text }}>Member Growth</h3>
        </div>
        <TimeDropdown selected={timePeriod} onSelect={setTimePeriod} />
      </div>
      <div className="h-[300px] w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

export default TotalMembersChart_Admin;