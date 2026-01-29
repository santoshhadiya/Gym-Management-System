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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const TimeDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border outline-none ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-2 ring-blue-100/50' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
        <span>{selected}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}></i>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1.5 space-y-0.5">
              {options.map((option) => (
                <button key={option} onClick={() => { onSelect(option); setIsOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between group ${selected === option ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
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

const TotalMembersChart_Admin = () => {
  const { api } = useGlobalContext();
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
      // 4-hour blocks
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
      backgroundColor: ["#CDE7FE"],
      hoverBackgroundColor: "#FEEF75",
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
        backgroundColor: "#fff", titleColor: "#000", bodyColor: "#555", borderColor: "#ddd", borderWidth: 1, padding: 10, displayColors: false,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#eee" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-users text-sm"></i>
          </div>
          <h3 className="font-semibold text-gray-800 text-md">Member Growth</h3>
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