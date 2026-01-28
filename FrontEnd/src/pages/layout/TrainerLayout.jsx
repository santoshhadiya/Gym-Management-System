import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';
import logo from "../../assets/logo.png";


// --- INTERNAL COMPONENT: TRAINER NAVIGATION (Top Bar) ---
const Nav_Trainer = ({ onMenuClick }) => {
  return (
    <section className="w-full bg-white rounded-[2rem] px-8 py-5 mb-8 shadow-sm border border-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between">

        {/* Left: Greeting & Mobile Toggle */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#121212] hover:bg-[#FEEF75] transition-all cursor-pointer"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>

          <div>
            <h1 className="text-2xl font-black text-[#121212] flex items-center gap-3 tracking-tight">
              Hello, Coach! <span className="text-2xl animate-bounce">🔥</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Ready to transform lives today?</p>
          </div>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-4">

          {/* Search Box (Hidden on mobile) */}
          <div className="relative hidden md:block group">
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-12 pr-6 py-3 rounded-2xl bg-gray-50 border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#FEEF75] focus:bg-white w-72 transition-all font-medium"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#121212] transition-colors">
              <i className="fa-solid fa-magnifying-glass text-sm"></i>
            </span>
          </div>

          {/* Notifications */}
          <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#121212] hover:bg-gray-50 transition-all relative cursor-pointer shadow-sm group">
            <i className="fa-regular fa-bell text-lg group-hover:rotate-12 transition-transform"></i>
            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-4 cursor-pointer group pl-4 border-l border-gray-100 ml-2">
            
            <div className="w-12 h-12 rounded-2xl bg-[#CDE7FE] flex items-center justify-center text-blue-900 font-black border-2 border-white shadow-lg group-hover:rotate-3 transition-all">
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
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useGlobalContext();
  const { pathname } = useLocation();

  const logOutTrainer = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

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
    { path: '/trainer/announcements', label: 'Announcements', icon: 'fa-comments' },

  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-[#121212]/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0  lg:min-h-screen bg-white border-r border-gray-100 z-[70] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? "lg:w-24 px-3" : "lg:w-72 px-6"}
      `}>
        
        {/* Toggle Button for Desktop */}
        <button 
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3.5 top-10 w-8 h-8 bg-[#121212] rounded-full hidden lg:flex items-center justify-center text-[#FEEF75] shadow-lg hover:scale-110 transition-transform z-[80] cursor-pointer"
        >
          <i className={`fa-solid fa-chevron-left text-[10px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
        </button>

        {/* Logo Section */}
        <div className={`h-24 flex items-center transition-all duration-500 ${collapsed ? "justify-center" : "px-4"}`}>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#FEEF75] flex items-center justify-center text-[#121212] font-black text-xl shadow-md border-2 border-white">
            <img src={logo} className='p-1'/>
          </div>
          
          <div className={`ml-4 transition-all duration-500 transform ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
            <span className="text-xl font-black text-[#121212] ">
              SONGAR'S <span className="text-yellow-600 text-[15px]">COACH</span>
            </span>
          </div>

          <button onClick={onClose} className="lg:hidden ml-auto text-gray-400 hover:text-[#121212] p-2 transition-colors">
            
          </button>
        </div>

        {/* Navigation - Grows naturally, no internal scrollbar as per request */}
        <div className="flex-1 px-2 space-y-1.5 pt-4">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <NavLink
                key={idx}
                to={item.path}
                end={item.path === '/trainer'}
                onClick={() => onClose && window.innerWidth < 1024 && onClose()}
                className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
                  ${isActive
                    ? 'bg-[#FEEF75] text-[#121212] font-black shadow-md shadow-yellow-100'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-[#121212]'
                  }`
                }
              >
                <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}>
                  <i className={`fa-solid ${item.icon} text-lg transition-transform duration-300 group-hover:scale-110 
                    ${isActive ? 'text-[#121212]' : 'text-gray-300 group-hover:text-[#121212]'}`}></i>
                </div>
                
                <span className={`text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-500 ease-in-out
                  ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
                `}>
                  {item.label}
                </span>

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="fixed left-24 bg-[#121212] text-white text-[10px] font-black py-2 px-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl uppercase tracking-widest">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Action Card - Improved Design */}
        <div className={`mt-8 px-4 transition-all duration-500 ${collapsed ? "opacity-0 scale-90 pointer-events-none h-0" : "opacity-100 scale-100 h-auto"}`}>
          <div className="bg-gradient-to-br from-[#FEEF75] to-[#D9F17F]/40 rounded-[2rem] p-5 border border-white shadow-xl shadow-yellow-50/50 relative overflow-hidden group/promo">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/30 rounded-full blur-2xl group-hover/promo:scale-150 transition-transform duration-700"></div>
            <h4 className="text-sm font-black text-[#121212] relative z-10 leading-tight">Session <br/>Tracker</h4>
            <p className="text-[10px] font-bold text-[#121212]/50 mt-1 relative z-10 uppercase tracking-wider">FitMove 3.2</p>
            <button className="mt-4 w-full py-3 bg-[#121212] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer relative z-10">
              <i className="fa-solid fa-plus text-[10px]"></i> Log Entry
            </button>
          </div>
        </div>

        {/* Logout - Bottom Sticky Area */}
        <div className={`mt-auto p-4 border-t border-gray-50 flex flex-col ${collapsed ? "items-center" : ""}`}>
          <button 
            className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
              ${collapsed ? "w-12 justify-center" : "px-4 w-full hover:bg-red-50 text-gray-400 hover:text-red-500 font-black"}
            `}
            onClick={logOutTrainer}
          >
            <div className="shrink-0 flex justify-center w-14 transition-colors">
              <i className="fa-solid fa-right-from-bracket text-lg group-hover:translate-x-1 transition-transform"></i>
            </div>
            
            <span className={`text-[12px] font-black transition-all duration-500 uppercase tracking-widest whitespace-nowrap
              ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
            `}>
              Logout
            </span>
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans text-gray-800 overflow-x-hidden">

      {/* Sidebar */}
      <Sidebar_Trainer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 bg-[#fafafa] relative min-w-0 transition-all duration-500">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">

          {/* Top Navigation Bar */}
          <Nav_Trainer onMenuClick={() => setIsMobileMenuOpen(true)} />

          {/* Page Content */}
          <div className="mt-8 animate-fade-in-up">
            <Outlet />
          </div>

        </div>
      </main>

      {/* Global Animations Style */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>

    </div>
  );
};

export default TrainerLayout;