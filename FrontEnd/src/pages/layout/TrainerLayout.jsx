import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const TrainerLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Trainer Navigation Items
  const navItems = [
    { path: '/trainer', label: 'Dashboard', icon: 'fa-table-columns' },
    { path: '/trainer/profile', label: 'My Profile', icon: 'fa-user' },
    { path: '/trainer/members', label: 'Assigned Members', icon: 'fa-users' },
    { path: '/trainer/workout-diet', label: 'Workout & Diet Plans', icon: 'fa-clipboard-list' },
    { path: '/trainer/monitor-progress', label: 'Member Progress', icon: 'fa-chart-line' },
    { path: '/trainer/feedbacks', label: 'Feedbacks', icon: 'fa-star' },
    { path: '/trainer/session-reports', label: 'Session Reports', icon: 'fa-calendar-check' },
    { path: '/trainer/performance-reports', label: 'Performance Reports', icon: 'fa-chart-pie' },
    { path: '/trainer/availability', label: 'My Availability', icon: 'fa-clock' },
    { path: '/trainer/payments', label: 'Payment Status', icon: 'fa-file-invoice-dollar' },
    { path: '/trainer/chat/member', label: 'Chat with Member', icon: 'fa-comments' },
    { path: '/trainer/chat/owner', label: 'Chat with Owner', icon: 'fa-user-shield' },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* Custom Scrollbar Styles */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CDE7FE; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #D9F17F; }
      `}</style>

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed h-full z-20 shadow-sm">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEEF75] flex items-center justify-center text-yellow-900 font-bold text-lg shadow-sm">
              <i className="fa-solid fa-stopwatch"></i>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              FitMove <span className="text-yellow-600">Trainer</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/trainer'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer group ${
                  isActive 
                    ? 'bg-[#FEEF75] text-yellow-900 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className={`w-6 flex justify-center transition-colors ${item.path === location.pathname ? 'text-yellow-800' : 'group-hover:text-yellow-600'}`}>
                 <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-50 shrink-0">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* --- MOBILE DRAWER --- */}
      <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      <aside className={`fixed top-0 left-0 w-64 h-full bg-white z-50 transform transition-transform duration-300 lg:hidden shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
           <span className="text-lg font-black text-gray-900">Menu</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
             <i className="fa-solid fa-xmark text-xl"></i>
           </button>
        </div>
        <div className="overflow-y-auto h-full pb-20 p-4 space-y-1">
           {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/trainer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-[#FEEF75] text-yellow-900' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            
            <div>
              <h1 className="text-xl font-black text-gray-900 hidden sm:block">
                Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-[#D9F17F]">Coach!</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification Bell */}
             <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-yellow-600 hover:bg-[#FEEF75]/30 transition-colors relative cursor-pointer">
                <i className="fa-regular fa-bell text-lg"></i>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>

             {/* Profile Dropdown Simulation */}
             <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer group">
                <div className="text-right hidden md:block">
                   <p className="text-sm font-bold text-gray-900">Raj Mehta</p>
                   <p className="text-xs text-gray-400">Senior Trainer</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                   RM
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default TrainerLayout;