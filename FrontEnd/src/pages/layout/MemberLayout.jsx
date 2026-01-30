import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo.png"
import { useGlobalContext } from '../../context/GlobalContext';
import Nav_Member from '../../components/member/Nav_Member';

// --- INTERNAL COMPONENT: MEMBER NAVIGATION (Top Bar) ---


// --- INTERNAL COMPONENT: SIDEBAR ---
const Sidebar_Member = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser } = useGlobalContext()
  const navigate = useNavigate()
  const { pathname } = useLocation();

  const signOutMember = () => {
    setUser(null)
    localStorage.setItem("userInfo", JSON.stringify(null));
    navigate("/login", { replace: true });
  }

const menuItems = [
  { name: "Dashboard", path: "/member", icon: "fa-solid fa-table-columns" },

  { name: "Profile", path: "/member/profile", icon: "fa-regular fa-user" },

  { name: "Membership", path: "/member/membership", icon: "fa-regular fa-id-card" },

  { name: "Plans", path: "/member/plans", icon: "fa-solid fa-layer-group" },

  { name: "Workouts & Diet Plans", path: "/member/workout", icon: "fa-solid fa-dumbbell" },

  { name: "Progress", path: "/member/progress", icon: "fa-solid fa-chart-line" },

  { name: "Bookings", path: "/member/booking", icon: "fa-regular fa-calendar-check" },

  { name: "Chat", path: "/member/chat", icon: "fa-regular fa-comments" },

  { name: "Announcements", path: "/member/announcements", icon: "fa-regular fa-bell" },

  { name: "Feedback", path: "/member/feedback", icon: "fa-solid fa-star-half-stroke" },

  { name: "Payments", path: "/member/payment", icon: "fa-regular fa-credit-card" },

  { name: "Invoices", path: "/member/invoices", icon: "fa-solid fa-file-invoice-dollar" },

  { name: "Gallery", path: "/member/gallery", icon: "fa-regular fa-images" },

  { name: "Renew", path: "/member/renew", icon: "fa-solid fa-rotate-right" },

  { name: "Attendance History", path: "/member/attendance-history", icon: "fa-solid fa-clipboard-list" },

  { name: "Scan Attendance", path: "/member/scan-attendance", icon: "fa-solid fa-qrcode" },
];


  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-[#121212]/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 min-h-screen bg-white border-r border-gray-100 z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? "lg:w-22 px-2" : "lg:w-64 px-2"}
      `}>
        
        {/* Toggle Button for Desktop */}
        <button 
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3.5 top-3 w-8 h-8 bg-[#CDE7FE] rounded-full hidden lg:flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
        >
          <i className={`fa-solid fa-chevron-left text-[10px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
        </button>

        {/* Logo */}
        <div className={`h-24 flex items-center transition-all duration-500 ${collapsed ? "justify-center" : "px-4 shrink-0"}`}>
          <div className="w-12 h-12 p-1.5 rounded-xl bg-[#D9F17F] flex items-center justify-center text-green-900 font-bold text-lg shadow-sm border-2 border-white shrink-0">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          
          <div className={`ml-4 transition-all duration-500 transform ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
            <span className="text-xl font-black text-gray-900 tracking-tight whitespace-nowrap">
              SONGAR'S<span className="text-red-600"> GYM</span>
            </span>
          </div>

          <button onClick={onClose} className="lg:hidden ml-auto text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation - Grows with page, no internal scroll */}
        <div className="flex-1 px-2 space-y-1.5  pb-4">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <NavLink
                key={idx}
                to={item.path}
                end={item.path === '/member'}
                onClick={() => onClose && window.innerWidth < 1024 && onClose()}
                className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
                  ${isActive
                    ? 'bg-[#CDE7FE] text-black font-bold shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}>
                  <i className={`fa-solid ${item.icon} text-lg transition-colors 
                    ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`}></i>
                </div>
                
                <span className={`text-sm font-bold whitespace-nowrap transition-all duration-500 ease-in-out
                  ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
                `}>
                  {item.name}
                </span>

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="fixed left-24 bg-[#121212] text-white text-[10px] font-bold py-2 px-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl uppercase tracking-widest">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Promo / Upgrade Card - Sticky at bottom */}
        <div className={`mt-auto p-4 transition-all duration-500 ${collapsed ? "opacity-0 scale-90 pointer-events-none h-0 p-0" : "opacity-100 scale-100 h-auto"}`}>
          <div className="bg-[#fcfdfd] border border-gray-100 rounded-3xl p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#FEEF75] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
            <h4 className="text-sm font-black text-gray-900 relative z-10">Upgrade Plan</h4>
            <p className="text-[10px] text-gray-500 mt-1 mb-4 relative z-10 font-bold leading-tight">Unlock premium features <br/> & Personal Training.</p>
            <button className="w-full py-2.5 bg-[#121212] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#D9F17F] hover:text-green-900 transition-all shadow-md cursor-pointer relative z-10">
              View Plans
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className={`p-4 border-t border-gray-50 flex flex-col ${collapsed ? "items-center" : ""}`}>
          <button 
            className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
              ${collapsed ? "w-12 justify-center" : "px-4 w-full hover:bg-red-50 text-red-500 font-bold text-xs uppercase tracking-widest"}
            `}
            onClick={signOutMember}
          >
            <div className="shrink-0 flex justify-center w-14 transition-colors">
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </div>
            
            <span className={`transition-all duration-500 whitespace-nowrap
              ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
            `}>
              Sign Out
            </span>
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
    <div className="flex min-h-screen bg-white font-sans text-gray-800 overflow-x-hidden">

      {/* Sidebar */}
      <Sidebar_Member isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 bg-white relative min-w-0">
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">

          {/* Top Navigation Bar */}
          <Nav_Member onMenuClick={() => setIsMobileMenuOpen(true)} />

          {/* Page Content */}
          <div className="mt-6 animate-fade-in">
            <Outlet />
          </div>

        </div>
      </main>

      {/* Global Animations Style */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>

    </div>
  );
};

export default MemberLayout;