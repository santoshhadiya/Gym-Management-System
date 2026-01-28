import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"
import { useGlobalContext } from "../../context/GlobalContext";



const Sidebar_Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useGlobalContext();

  const logOutAdmin = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "fa-solid fa-table-columns" },
    { name: "Manage Members", path: "/admin/members", icon: "fa-regular fa-user" },
    { name: "Manage Trainers", path: "/admin/trainers", icon: "fa-solid fa-user-tie" },
    { name: "Membership Plans", path: "/admin/membership-plans", icon: "fa-regular fa-id-card" },
   /*  { name: "Payments", path: "/admin/payments", icon: "fa-regular fa-credit-card" }, */
    { name: "Payment History", path: "/admin/payment-history", icon: "fa-solid fa-clock-rotate-left" },
    { name: "Assign Trainers", path: "/admin/assign-trainers", icon: "fa-solid fa-user-plus" },
    /* { name: "Chat with Members", path: "/admin/chat-members", icon: "fa-regular fa-comments" }, */
    { name: "Performance Reports", path: "/admin/performance-reports", icon: "fa-regular fa-file-lines" },
    { name: "Verify Accounts", path: "/admin/verify-accounts", icon: "fa-regular fa-square-check" },
    { name: "Staff Schedules", path: "/admin/staff-schedules", icon: "fa-regular fa-calendar" },
    { name: "Manage Bookings", path: "/admin/bookings", icon: "fa-regular fa-calendar-check" },
    { name: "Announcements", path: "/admin/announcements", icon: "fa-regular fa-bell" },
    { name: "Financial Reports", path: "/admin/financial-reports", icon: "fa-solid fa-chart-pie" },
    { name: "Media Gallery", path: "/admin/media-gallery", icon: "fa-regular fa-images" },
    { name: "Manage Offers", path: "/admin/offers", icon: "fa-solid fa-percent" },
    { name: "Equipment Tracking", path: "/admin/equipment-tracking", icon: "fa-solid fa-dumbbell" },
    { name: "Monitor Progress", path: "/admin/monitor-progress", icon: "fa-solid fa-stairs" },
    { name: "Chat with Trainers", path: "/admin/chat-trainers", icon: "fa-regular fa-comment-dots" },
    { name: "View Inquiry", path: "/admin/view-inquiry", icon: "fa-regular fa-star" },
    { name: "View Feedback", path: "/admin/feedbacks", icon: "fa-regular fa-star" },
    { name: "Update Sessions", path: "/admin/update-session", icon: "fa-solid fa-rotate" },
  ];

  return (
    <aside
      className={`
        ${collapsed ? "w-20 px-2" : "w-60 px-4"}
        min-h-screen bg-white border-r border-gray-100
        flex flex-col py-8 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        shadow-xl shadow-gray-200/40 relative group/sidebar
      `}
    >
      {/* Sidebar Toggle Button - Floating Style */}
      <button 
        onClick={() => setCollapsed(prev => !prev)}
        className="absolute -right-3 top-10 w-8 h-8 bg-[#D9F17F] rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
      >
        <i className={`fa-solid fa-chevron-left transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
      </button>

      {/* Header / Brand */}
      <div className={`flex items-center mb-10 overflow-hidden transition-all duration-500 ${collapsed ? "justify-center" : "px-2"}`}>
        <div className="shrink-0 w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center p-2 shadow-sm">
          <img src={logo} className="w-full h-full object-contain opacity-90" alt="logo" />
        </div>
        
        <div className={`ml-4 transition-all duration-500 transform ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
          <h2 className="text-lg font-black text-[#121212] tracking-tight leading-none whitespace-nowrap">
            SONGAR'S
          </h2>
          <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-1 whitespace-nowrap">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-2 pr-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
                ${isActive
                  ? "bg-[#D9F17F] text-[#121212] font-black shadow-md shadow-[#D9F17F]/30"
                  : "text-gray-400 hover:bg-gray-50 hover:text-[#121212]"
                }
              `}
            >
              <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}>
                <i
                  className={`${item.icon} text-lg transition-transform duration-300 group-hover:scale-110
                    ${isActive ? "text-[#121212]" : "text-gray-300 group-hover:text-[#121212]"}
                  `}
                ></i>
              </div>

              <span className={`text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-500 ease-in-out
                ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
              `}>
                {item.name}
              </span>

              {/* Tooltip for Collapsed state */}
              {collapsed && (
                <div className="fixed left-24 bg-[#121212] text-white text-[10px] font-bold py-2 px-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade / Promo Section */}
      <div className={`mt-12 p-5 bg-gradient-to-br from-[#CDE7FE] to-[#D9F17F]/40 rounded-[2rem] border border-white relative overflow-hidden group/promo transition-all duration-500 hover:shadow-xl hover:shadow-blue-100/50
        ${collapsed ? "opacity-0 scale-90 pointer-events-none h-0 p-0 mt-0" : "opacity-100 scale-100 h-auto"}
      `}>
        <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-white/40 rounded-full blur-2xl group-hover/promo:scale-150 transition-transform duration-700"></div>
        <h3 className="font-black text-[#121212] text-sm leading-tight whitespace-nowrap">
          FitMove 3.2 <br/> Ready
        </h3>
        <p className="text-[#121212]/50 text-[10px] mt-2 font-bold uppercase tracking-wider whitespace-nowrap">
          Enhanced Analytics
        </p>
        <button className="mt-4 w-full bg-[#121212] text-white rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all hover:-translate-y-0.5 whitespace-nowrap">
          Update Now
        </button>
      </div>

      {/* User Footer / Logout */}
      <div className={`mt-8 pt-6 border-t border-gray-100 flex flex-col ${collapsed ? "items-center" : ""}`}>
        <button
          onClick={logOutAdmin}
          className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
            ${collapsed ? "w-12 justify-center" : "px-4 w-full hover:bg-red-50 text-gray-400 hover:text-red-500"}
          `}
        >
          <div className="shrink-0 flex justify-center w-14 transition-colors">
            <i className="fa-solid fa-arrow-right-from-bracket text-lg group-hover:translate-x-1 transition-transform"></i>
          </div>

          <span className={`text-sm font-black transition-all duration-500 uppercase tracking-widest whitespace-nowrap
            ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
          `}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar_Admin;