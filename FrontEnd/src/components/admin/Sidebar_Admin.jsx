import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";

const Sidebar_Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useGlobalContext();
  const { theme, toggleTheme, colors } = useTheme();

  const logOutAdmin = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

  // Helper to convert hex to RGBA for transparency
  const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "fa-solid fa-table-columns" },
    { name: "Manage Members", path: "/admin/members", icon: "fa-regular fa-user" },
    { name: "Manage Trainers", path: "/admin/trainers", icon: "fa-solid fa-user-tie" },
    { name: "Membership Plans", path: "/admin/membership-plans", icon: "fa-regular fa-id-card" },
    { name: "Payment History", path: "/admin/payment-history", icon: "fa-solid fa-clock-rotate-left" },
    { name: "Financial Reports", path: "/admin/financial-reports", icon: "fa-solid fa-chart-pie" },
    { name: "Assign Trainers", path: "/admin/assign-trainers", icon: "fa-solid fa-user-plus" },
    { name: "Performance Reports", path: "/admin/performance-reports", icon: "fa-regular fa-file-lines" },
    { name: "Verify Accounts", path: "/admin/verify-accounts", icon: "fa-regular fa-square-check" },
    { name: "Staff Schedules", path: "/admin/staff-schedules", icon: "fa-regular fa-calendar" },
    { name: "Manage Bookings", path: "/admin/bookings", icon: "fa-regular fa-calendar-check" },
    { name: "Announcements", path: "/admin/announcements", icon: "fa-regular fa-bell" },
    { name: "Media Gallery", path: "/admin/media-gallery", icon: "fa-regular fa-images" },
    { name: "Manage Offers", path: "/admin/offers", icon: "fa-solid fa-percent" },
    { name: "Equipment Tracking", path: "/admin/equipment-tracking", icon: "fa-solid fa-dumbbell" },
    { name: "Monitor Progress", path: "/admin/monitor-progress", icon: "fa-solid fa-chart-line" },
    { name: "Sessions", path: "/admin/update-session", icon: "fa-solid fa-rotate" },
    { name: "Chat with Trainers", path: "/admin/chat-trainers", icon: "fa-regular fa-comment-dots" },
    { name: "View Inquiry", path: "/admin/view-inquiry", icon: "fa-solid fa-circle-question" },
    { name: "View Feedback", path: "/admin/feedbacks", icon: "fa-solid fa-message" },
    { name: "Attendance QR", path: "/admin/attendance-qr", icon: "fa-solid fa-qrcode" },
    { name: "Attendance", path: "/admin/attendance", icon: "fa-solid fa-clipboard-user" },
    { name: "Gym Schedule", path: "/admin/manage-gym-schedule", icon: "fa-solid fa-user-tie" },
    { name: "Create Admin", path: "/admin/create-admin", icon: "fa-solid fa-user-tie" },
    { name: "Session QR", path: "/admin/session-qr", icon: "fa-solid fa-user-tie" },
    { name: "Settings", path: "/admin/profile", icon: "fa-solid fa-user-tie" },

  ];

  return (
    <aside
      className={`
        ${collapsed ? "w-20 px-2" : "w-60 px-4"}
        h-screen
        min-h-screen border-r flex flex-col pt-4 pb-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl relative z-50
      `}
      style={{
        backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
        borderColor: getTransparentColor(colors.border, 0.2),
        backdropFilter: 'blur(16px)', // Blur effect
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        className="absolute -right-3 top-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
        style={{ backgroundColor: colors.primary, color: '#111' }}
      >
        <i className={`fa-solid fa-chevron-left text-[10px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
      </button>

      {/* Header / Brand */}
      <div className={`flex items-center mb-2 overflow-hidden transition-all duration-500 ${collapsed ? "justify-center" : "px-2"}`}>


        <div className={`transition-all duration-500 transform flex gap-4 ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
          <div className="shrink-0 w-12 h-12 p-1.5 rounded-2xl flex items-center justify-center border shadow-sm"
            style={{ backgroundColor: getTransparentColor(colors.background, 0.5), borderColor: colors.border }}>
            <img src={logo} className="w-full h-full object-contain" alt="logo" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight leading-none whitespace-nowrap" style={{ color: colors.text }}>
              SONGAR'S
            </h2>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1 whitespace-nowrap" style={{ color: colors.textMuted }}>
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 pr-2 overflow-y-auto no-scrollbar">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
                ${isActive ? 'font-black shadow-md' : 'hover:bg-opacity-50'}
              `}
              style={{
                backgroundColor: isActive ? colors.primary : 'transparent',
                color: isActive ? '#111827' : colors.textMuted
              }}
            >
              <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}>
                <i className={`${item.icon} text-lg transition-transform duration-300 group-hover:scale-110`}
                  style={{ color: isActive ? '#111827' : colors.textMuted }}></i>
              </div>

              <span className={`text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-500 ease-in-out
                ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
              `}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <div className={`mt-4 pt-6 border-t flex flex-col gap-3 ${collapsed ? "items-center" : "px-2"}`} style={{ borderColor: colors.border }}>


          <button
            onClick={toggleTheme}
            className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden cursor-pointer hover:opacity-80
             ${collapsed ? "w-12 justify-center" : "px-4 w-full font-bold text-xs uppercase tracking-widest"}
           `}
            style={{
              backgroundColor: theme === 'light' ? 'rgba(243, 244, 246, 0.5)' : 'rgba(31, 41, 55, 0.5)',
              color: colors.text
            }}
          >
            <div className="shrink-0 flex justify-center w-14 transition-colors">
              <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun text-yellow-400'} text-lg`}></i>
            </div>
            <span className={`transition-all duration-500 whitespace-nowrap
               ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
             `}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>


          <button
            onClick={logOutAdmin}
            className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden hover:bg-red-50 text-gray-400 hover:text-red-500
            ${collapsed ? "w-12 justify-center" : "px-4 w-full"}
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
      </nav>



    </aside>
  );
};

export default Sidebar_Admin;