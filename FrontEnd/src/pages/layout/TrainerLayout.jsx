import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';

// --- INTERNAL COMPONENT: TRAINER NAVIGATION (Top Bar) ---
const Nav_Trainer = ({ onMenuClick }) => {
  return (
    <section className="w-full bg-white rounded-3xl px-6 py-4 mb-6 shadow-sm border border-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between">

        {/* Left: Greeting & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:text-yellow-600 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Hello, Coach! <span className="inline-block animate-pulse">💪</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Ready to transform lives today?</p>
          </div>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* Search Box (Hidden on mobile) */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FEEF75] focus:bg-white w-64 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          {/* Notifications */}
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FEEF75] hover:text-yellow-900 hover:border-[#FEEF75] transition-all relative cursor-pointer group shadow-sm">
            <i className="fa-regular fa-bell group-hover:animate-swing"></i>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 cursor-pointer group pl-2 border-l border-gray-100">
            <div className="text-right hidden xl:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">Raj Mehta</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Senior Trainer</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-md group-hover:scale-105 transition-transform">
              RM
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- INTERNAL COMPONENT: SIDEBAR ---
const Sidebar_Trainer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, setUser } = useGlobalContext()
  const logOutTrainer = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  }
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

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="h-24 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEEF75] flex items-center justify-center text-yellow-900 font-bold text-lg shadow-sm">
              <i className="fa-solid fa-stopwatch"></i>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Songar's <span className="text-yellow-600">Trainer</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/trainer'}
              onClick={() => onClose && window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group ${isActive
                  ? 'bg-[#FEEF75] text-yellow-900 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className={`w-6 text-center transition-colors ${({ isActive }) => isActive ? 'text-yellow-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Quick Action Card */}
        <div className="p-5 shrink-0">
          <div className="bg-[#fcfdfd] border border-gray-100 rounded-2xl p-4 relative overflow-hidden group hover:border-[#FEEF75] transition-colors">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#FEEF75] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
            <h4 className="text-sm font-bold text-gray-900 relative z-10">Quick Action</h4>
            <button className="mt-3 w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-yellow-500 hover:text-white transition-colors shadow-sm cursor-pointer relative z-10 flex items-center justify-center gap-2">
              <i className="fa-solid fa-plus"></i> Log Session
            </button>
          </div>

          <button className="mt-4 w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            onClick={logOutTrainer}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>

      </aside>
    </>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const TrainerLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Inject Font Awesome & Scrollbar Styles
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans text-gray-800">

      {/* Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Sidebar */}
      <Sidebar_Trainer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1  overflow-y-auto bg-[#fafafa] custom-scrollbar relative">
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">

          {/* Top Navigation Bar */}
          <Nav_Trainer onMenuClick={() => setIsMobileMenuOpen(true)} />

          {/* Page Content */}
          <div className="mt-6 animate-fade-in-up">
            <Outlet />
          </div>

        </div>
      </main>

    </div>
  );
};

export default TrainerLayout;