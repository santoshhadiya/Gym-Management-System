import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

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

const TotalPlanBuys_Admin = () => {
  const [timePeriod, setTimePeriod] = useState("This Year");

  // Dynamic Data Configuration
  // Format: [Basic Plan %, Premium Plan %, Yearly Plan %]
  // Note: The second value in each data pair is (100 - value) to create the 'empty' part of the ring
  const chartConfig = {
    "This Year": {
      basic: 50,
      premium: 30,
      yearly: 20
    },
    "This Month": {
      basic: 65,
      premium: 25,
      yearly: 10
    },
    "This Week": {
      basic: 40,
      premium: 45,
      yearly: 15
    }
  };

  const currentData = chartConfig[timePeriod];

  const planBuysData = {
    datasets: [
      // Outer Ring – Basic Plan
      {
        data: [currentData.basic, 100 - currentData.basic],
        backgroundColor: ["#CDE7FE", "#f1f1f1"],
        borderWidth: 0,
        radius: "100%",
        cutout: "60%",
      },

      // Middle Ring – Premium Plan
      {
        data: [currentData.premium, 100 - currentData.premium],
        backgroundColor: ["#FEEF75", "#f1f1f1"],
        borderWidth: 0,
        radius: "85%",
        cutout: "50%",
      },

      // Inner Ring – Yearly Plan
      {
        data: [currentData.yearly, 100 - currentData.yearly],
        backgroundColor: ["#D9F17F", "#f1f1f1"],
        borderWidth: 0,
        radius: "70%",
        cutout: "40%",
      },
    ],
  };

  const planBuysOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#ffffff",
        titleColor: "#000",
        bodyColor: "#555",
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            // The value is the first number in the data array for the active segment
            // Since we have pairs like [value, 100-value], we check if we are hovering the colored part
            // But simplify: just show the configured value based on dataset index
            
            if (datasetIndex === 0) return `Basic Plan: ${currentData.basic}%`;
            if (datasetIndex === 1) return `Premium Plan: ${currentData.premium}%`;
            if (datasetIndex === 2) return `Yearly Plan: ${currentData.yearly}%`;
            return '';
          },
        },
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
          <h3 className="font-semibold text-md text-gray-800">Total Plan Buys</h3>
        </div>
        <div>
          {/* Pass state and handler to dropdown */}
          <TimeDropdown selected={timePeriod} onSelect={setTimePeriod} />
        </div>
      </div>

      <div className="w-full h-[220px] items-center justify-center flex mb-6">
        <Doughnut data={planBuysData} options={planBuysOptions} />
      </div>

      <div className="space-y-4 text-sm mt-auto">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-[#b7d8f5] mt-1.5"></span>
            <div>
              <p className="font-semibold text-gray-800">Basic Plan</p>
              <p className="text-gray-400 text-xs">Most popular monthly option.</p>
            </div>
          </div>
          <p className="font-semibold text-gray-700">{currentData.basic}%</p>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-[#f7dc6f] mt-1.5"></span>
            <div>
              <p className="font-semibold text-gray-800">Premium Plan</p>
              <p className="text-gray-400 text-xs">Includes all classes & amenities.</p>
            </div>
          </div>
          <p className="font-semibold text-gray-700">{currentData.premium}%</p>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-[#c8e96b] mt-1.5"></span>
            <div>
              <p className="font-semibold text-gray-800">Yearly Plan</p>
              <p className="text-gray-400 text-xs">Best value for long-term commitment.</p>
            </div>
          </div>
          <p className="font-semibold text-gray-700">{currentData.yearly}%</p>
        </div>
      </div>
    </div>
  )
}

export default TotalPlanBuys_Admin