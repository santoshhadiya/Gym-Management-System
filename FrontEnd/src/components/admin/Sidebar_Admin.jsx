import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import logo from "../../assets/logo.png"

const Sidebar_Admin = () => {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "fa-solid fa-table-columns" }, 
    { name: "Manage Members", path: "/admin/members", icon: "fa-regular fa-user" },
    { name: "Manage Trainers", path: "/admin/trainers", icon: "fa-solid fa-user-tie" },
    { name: "Membership Plans", path: "/admin/membership-plans", icon: "fa-regular fa-id-card" },
    { name: "Payments", path: "/admin/payments", icon: "fa-regular fa-credit-card" },
    { name: "Payment History", path: "/admin/payment-history", icon: "fa-solid fa-clock-rotate-left" },
    { name: "Assign Trainers", path: "/admin/assign-trainers", icon: "fa-solid fa-user-plus" },
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
    { name: "Chat with Members", path: "/admin/chat-members", icon: "fa-regular fa-comments" },
    { name: "Chat with Trainers", path: "/admin/chat-trainers", icon: "fa-regular fa-comment-dots" },
    { name: "View Feedback", path: "/admin/feedbacks", icon: "fa-regular fa-star" },
    { name: "Update Sessions", path: "/admin/update-session", icon: "fa-solid fa-rotate" },
  ];
  return (
    <aside className="w-60   overflow-auto mt-4 ml-4 bg-white border rounded-4xl border-gray-200 flex flex-col px-5 py-6">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-4  px-2 bg-gray-100 p-2 rounded-4xl">
          <div className="w-10 h-10  flex items-center justify-center">
             {/* Un-filled / Light Gray Icon */}
             <img src={logo}/>
          </div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">
            Songar's GYM
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-all duration-200 group
                ${
                  pathname === item.path
                    ? "bg-[#D9F17F] text-gray-900 font-semibold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              {/* Icon Container - Fixed width for alignment */}
              <div className="w-5 flex justify-center">
                 <i className={`${item.icon} text-base ${pathname === item.path ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"}`}></i>
              </div>
              
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Promo Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-6 relative overflow-hidden group">
           {/* Decorative Background Icon */}
           <i className="fa-solid fa-chart-line absolute -right-2 -bottom-2 text-6xl text-blue-100 opacity-50 group-hover:scale-110 transition-transform"></i>
           
          <h3 className="font-semibold text-gray-800 relative z-10">
            Track. Analyze. Succeed.
          </h3>
          <p className="text-xs text-gray-500 mt-2 relative z-10 leading-relaxed">
            Monitor progress, goals and achieve results faster.
          </p>
          <button className="mt-4 w-full bg-white border border-blue-200 rounded-full py-2 text-xs font-semibold text-blue-600 shadow-sm hover:shadow-md transition-all relative z-10">
            Upgrade FitMove 3.2
          </button>
        </div>

        {/* Logout */}
        <button className="mt-6 flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-500 transition-colors group">
          <div className="w-5 flex justify-center">
            <i className="fa-solid fa-arrow-right-from-bracket group-hover:translate-x-1 transition-transform"></i>
          </div>
          <span className="font-medium">Logout</span>
        </button>

      </aside>
  )
}

export default Sidebar_Admin