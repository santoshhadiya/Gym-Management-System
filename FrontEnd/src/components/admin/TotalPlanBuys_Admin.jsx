import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useGlobalContext } from '../../context/GlobalContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const TotalPlanBuys_Admin = () => {
  const { api } = useGlobalContext();
  const [planStats, setPlanStats] = useState({ labels: [], data: [], percentages: [] });

  // Consistent colors for chart segments and list indicators
  const backgroundColors = ["#CDE7FE", "#FEEF75", "#D9F17F", "#e0e7ff", "#fecaca", "#a7f3d0"];

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const res = await api.get("/members");
        const members = res.data;
        
        const counts = {};
        let validTotal = 0;

        members.forEach(m => {
          const planName = m.plan?.name || "Unknown";
          
          // Filter: Do not consider "Unknown" plans in calculation
          if (planName !== "Unknown") {
            counts[planName] = (counts[planName] || 0) + 1;
            validTotal++;
          }
        });

        const keys = Object.keys(counts);
        const data = Object.values(counts);
        
        // Calculate percentage based on validTotal
        const percentages = data.map(count => 
          validTotal > 0 ? Math.round((count / validTotal) * 100) : 0
        );

        setPlanStats({ labels: keys, data: data, percentages: percentages });
      } catch (error) { console.error(error); }
    };
    fetchPlanData();
  }, [api]);

  // Fallback for empty state
  const safeData = planStats.data.length > 0 ? planStats.data : [1];
  const safeLabels = planStats.labels.length > 0 ? planStats.labels : ["No Data"];
  const chartColors = planStats.data.length > 0 ? backgroundColors : ["#f3f4f6"];

  const planBuysData = {
    labels: safeLabels,
    datasets: [{
      data: safeData,
      backgroundColor: chartColors,
      borderWidth: 0,
    }],
  };

  const planBuysOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hide default legend
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            if (label === "No Data") return "No Data";
            const value = context.raw || 0;
            const percentage = planStats.percentages[context.dataIndex];
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-cart-shopping text-sm"></i>
          </div>
          <h3 className="font-semibold text-md text-gray-800">Plan Popularity</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-[220px] items-center justify-center flex mb-6">
        <Doughnut data={planBuysData} options={planBuysOptions} />
      </div>

      {/* Printed Data Section (Percentage & Plan Name) */}
      <div className="space-y-3 mt-auto max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
        {planStats.labels.length > 0 ? (
          planStats.labels.map((label, index) => (
            <div key={label} className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: backgroundColors[index % backgroundColors.length] }}
                ></span>
                <p className="font-semibold text-gray-700 text-xs truncate">{label}</p>
              </div>
              <p className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-xs">
                {planStats.percentages[index]}%
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-xs py-4">No active plan data found.</p>
        )}
      </div>
    </div>
  )
}

export default TotalPlanBuys_Admin;