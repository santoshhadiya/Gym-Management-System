import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler,
} from "chart.js";

import Cards_Admin from "../../components/admin/Cards_Admin";
import TotalMembersChart_Admin from "../../components/admin/TotalMembersChart_Admin";
import MonthlyEarningsChart_Admin from "../../components/admin/MonthlyEarningsChart_Admin";
import TotalPlanBuys_Admin from "../../components/admin/TotalPlanBuys_Admin";
import RecentActivity_Admin from "../../components/admin/RecentActivity_Admin";
import BottomSectionDashbord_Admin from "../../components/admin/BottomSectionDashbord_Admin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler
);


const Dashboard = () => {

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);


  return (
    <div className=" bg-white min-h-screen font-sans">
      
      {/* Top*/}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Cards */}
          <Cards_Admin/>

          {/* Members Chart */}
         <TotalMembersChart_Admin/>

          {/* Earnings Chart */}
          <MonthlyEarningsChart_Admin/>

        </div>

        {/* Right  */}
        <div className="flex flex-col gap-8 ">
          
          {/* Total Plan Buys */}
          <TotalPlanBuys_Admin/>

          {/* Recent Activity */}
          <RecentActivity_Admin/>

        </div>
      </div>

      {/* Bottom Section */}
      <BottomSectionDashbord_Admin/>
    </div>
  );
};

export default Dashboard;