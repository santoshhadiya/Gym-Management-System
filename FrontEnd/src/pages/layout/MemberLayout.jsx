import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from "../../assets/logo.png"

// --- INTERNAL COMPONENT: MEMBER NAVIGATION (Top Bar) ---
const Nav_Member = ({ onMenuClick }) => {
  return (
    <section className="w-full bg-gray-100 rounded-3xl px-6 py-4 mb-6 transition-all duration-300">
      <div className="flex items-center justify-between">
        
        {/* Left: Greeting & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-blue-600 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Hello, Member! <span className="inline-block hover:animate-wave cursor-default">👋</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Let's crush your goals today!</p>
          </div>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* Search Box (Hidden on mobile) */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] w-64 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          {/* Notifications */}
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FEEF75] hover:text-yellow-800 hover:border-yellow-200 transition-all relative cursor-pointer group shadow-sm">
            <i className="fa-regular fa-bell group-hover:animate-swing"></i>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 cursor-pointer group">
             <div className="w-10 h-10 rounded-full bg-[#D9F17F] flex items-center justify-center text-green-900 font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                JD
             </div>
             <div className="hidden xl:block text-right">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">John Doe</p>
                <p className="text-[10px] text-gray-500">Premium Member</p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- INTERNAL COMPONENT: SIDEBAR ---
const Sidebar_Member = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/member', icon: 'fa-table-columns' },
    { name: 'Profile', path: '/member/profile', icon: 'fa-user' },
    { name: 'Membership', path: '/member/membership', icon: 'fa-id-card' },
    { name: 'Plans', path: '/member/plans', icon: 'fa-layer-group' },
    { name: 'Workouts', path: '/member/workout', icon: 'fa-dumbbell' },
    { name: 'Diet Plans', path: '/member/dietPlans', icon: 'fa-utensils' },
    { name: 'Progress', path: '/member/progress', icon: 'fa-chart-line' },
    { name: 'Bookings', path: '/member/booking', icon: 'fa-calendar-check' },
    { name: 'Chat', path: '/member/chat', icon: 'fa-comments' },
    { name: 'Feedback', path: '/member/feedback', icon: 'fa-star' },
    { name: 'Payments', path: '/member/payment', icon: 'fa-credit-card' },
    { name: 'Invoices', path: '/member/invoices', icon: 'fa-file-invoice-dollar' },
    { name: 'Renew', path: '/member/renew', icon: 'fa-arrows-rotate' },
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
        fixed lg:static top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo */}
        <div className="h-24 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10  p-0.5 rounded-xl bg-[#D9F17F] flex items-center justify-center text-green-900 font-bold text-lg shadow-sm">
               <img src={logo}/>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Songar's<span className="text-[#CDE7FE] bg-clip-text  bg-gradient-to-r text-red-600"> GYM</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-gray-400 hover:text-gray-600">
             <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/member'}
              onClick={() => onClose && window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group ${
                  isActive 
                    ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <i className={`fa-solid ${item.icon} w-5 text-center transition-colors ${({isActive}) => isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`}></i>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Promo / Footer */}
        <div className="p-5 shrink-0">
           <div className="bg-[#fcfdfd] border border-gray-100 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#FEEF75] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              <h4 className="text-sm font-bold text-gray-900 relative z-10">Upgrade Plan</h4>
              <p className="text-[10px] text-gray-500 mt-1 mb-3 relative z-10">Unlock premium features & PT.</p>
              <button className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#D9F17F] hover:text-green-900 transition-colors shadow-sm cursor-pointer relative z-10">
                 View Plans
              </button>
           </div>

           <button className="mt-4 w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              <i className="fa-solid fa-right-from-bracket"></i> Sign Out
           </button>
        </div>

      </aside>
    </>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const MemberLayout = () => {
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
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      
      {/* Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Sidebar */}
      <Sidebar_Member isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1  overflow-y-auto bg-white custom-scrollbar relative">
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
            
            {/* Top Navigation Bar */}
            <Nav_Member onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            {/* Page Content */}
            <div className="mt-6 animate-fade-in">
                <Outlet />
            </div>

        </div>
      </main>

    </div>
  );
};

export default MemberLayout;