import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

ChartJS.register(ArcElement, Tooltip, Legend);

const TotalPlanBuys_Admin = () => {
  const { api } = useGlobalContext();
  const { colors } = useTheme(); //
  const [planStats, setPlanStats] = useState({ labels: [], data: [], percentages: [] });

  // Use Theme Palette
  const backgroundColors = [colors.secondary, colors.accent, colors.primary, colors.border, "#e0e7ff", "#fecaca"];

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const res = await api.get("/members");
        const members = res.data;
        const counts = {};
        let validTotal = 0;

        members.forEach(m => {
          const planName = m.plan?.name || "Unknown";
          if (planName !== "Unknown") {
            counts[planName] = (counts[planName] || 0) + 1;
            validTotal++;
          }
        });

        const keys = Object.keys(counts);
        const data = Object.values(counts);
        const percentages = data.map(count => validTotal > 0 ? Math.round((count / validTotal) * 100) : 0);
        setPlanStats({ labels: keys, data: data, percentages: percentages });
      } catch (error) { console.error(error); }
    };
    fetchPlanData();
  }, [api]);

  const safeData = planStats.data.length > 0 ? planStats.data : [1];
  const safeLabels = planStats.labels.length > 0 ? planStats.labels : ["No Data"];
  const chartColors = planStats.data.length > 0 ? backgroundColors : [colors.border];

  const planBuysData = {
    labels: safeLabels,
    datasets: [{ data: safeData, backgroundColor: chartColors, borderWidth: 0 }],
  };

  const planBuysOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
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
        className="border rounded-3xl p-4 shadow-sm h-full flex flex-col transition-colors"
        style={{
              backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
              borderColor: getTransparentColor(colors.border, 0.2),
              backdropFilter: 'blur(16px)', // Blur effect
              WebkitBackdropFilter: 'blur(16px)'
            }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.textMuted }}>
            <i className="fa-solid fa-cart-shopping text-sm"></i>
          </div>
          <h3 className="font-semibold text-md" style={{ color: colors.text }}>Plan Popularity</h3>
        </div>
      </div>

      <div className="w-full h-[220px] items-center justify-center flex mb-6">
        <Doughnut data={planBuysData} options={planBuysOptions} />
      </div>

      <div className="space-y-3 mt-auto max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
        {planStats.labels.length > 0 ? (
          planStats.labels.map((label, index) => (
            <div key={label} className="flex justify-between items-center p-2 rounded-xl transition-colors hover:opacity-80">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: backgroundColors[index % backgroundColors.length] }}
                ></span>
                <p className="font-semibold text-xs truncate" style={{ color: colors.text }}>{label}</p>
              </div>
              <p className="font-bold px-2 py-1 rounded-md text-xs" style={{ backgroundColor: colors.background, color: colors.text }}>
                {planStats.percentages[index]}%
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-xs py-4" style={{ color: colors.textMuted }}>No active plan data found.</p>
        )}
      </div>
    </div>
  )
}

export default TotalPlanBuys_Admin;