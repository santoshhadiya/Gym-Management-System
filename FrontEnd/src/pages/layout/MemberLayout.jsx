import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo.png";
import { useGlobalContext } from '../../context/GlobalContext';
import Nav_Member from '../../components/member/Nav_Member';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Context

// --- INTERNAL COMPONENT: SIDEBAR ---
const Sidebar_Member = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser } = useGlobalContext();
  
  // Destructure colors and theme from context
  const { theme, toggleTheme, colors } = useTheme(); 
  
  const navigate = useNavigate();
  
  const { pathname } = useLocation();

  const signOutMember = () => {
    setUser(null);
    localStorage.setItem("userInfo", JSON.stringify(null));
    navigate("/login", { replace: true });
  };

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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside 
  style={{ 
     backgroundColor: colors.sidebar,
     borderColor: colors.border 
  }}
  className={`
  fixed lg:sticky top-0 left-0 border-r z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl lg:shadow-none
  
  /* Apply fixed height and scroll ONLY on small screens */
  max-lg:h-screen max-lg:overflow-y-auto lg:min-h-screen
  
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  ${collapsed ? "lg:w-22 px-2" : "lg:w-64 px-2"}
`}>
        
        {/* Toggle Button for Desktop */}
        <button 
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3.5 top-3 w-8 h-8 rounded-full hidden lg:flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
          style={{ backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#000' }}
        >
          <i className={`fa-solid fa-chevron-left text-[10px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
        </button>

        {/* Logo Area */}
        <div className={`h-24 flex items-center transition-all duration-500 ${collapsed ? "justify-center" : "px-4 shrink-0"}`}>
          <div className="w-12 h-12 p-1.5 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border-2 shrink-0"
             style={{ backgroundColor: colors.primary, borderColor: colors.card, color: '#14532d' }}
          >
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          
          <div className={`ml-4 transition-all duration-500 transform ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
            <span className="text-xl font-black tracking-tight whitespace-nowrap" style={{ color: colors.text }}>
              SONGAR'S<span className="text-red-600"> GYM</span>
            </span>
          </div>

          <button onClick={onClose} className="lg:hidden ml-auto text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-2 space-y-1.5 pb-4">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <NavLink
                key={idx}
                to={item.path}
                end={item.path === '/member'}
                onClick={() => onClose && window.innerWidth < 1024 && onClose()}
                style={{ 
                    backgroundColor: isActive ? colors.secondary : 'transparent',
                    color: isActive ? (theme === 'dark' ? '#fff' : '#000') : colors.textMuted
                }}
                className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden hover:opacity-80`}
              >
                <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}>
                  <i className={`fa-solid ${item.icon} text-lg transition-colors`}
                     style={{ color: isActive ? (theme === 'dark' ? '#fff' : '#000') : colors.textMuted }}
                  ></i>
                </div>
                
                <span className={`text-sm font-bold whitespace-nowrap transition-all duration-500 ease-in-out
                  ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
                `}>
                  {item.name}
                </span>

                {/* Tooltip on Collapse */}
                {collapsed && (
                  <div className="fixed left-24 px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl uppercase tracking-widest text-[10px] font-bold"
                    style={{ backgroundColor: colors.card, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
        
        {/* Footer: Theme & Sign Out */}
        <div className="p-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${colors.border}` }}>
            
          {/* Theme Switcher */}
          <button 
             onClick={toggleTheme}
             className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden cursor-pointer hover:opacity-80
             ${collapsed ? "w-12 justify-center" : "px-4 w-full font-bold text-xs uppercase tracking-widest"}
           `}
             style={{ 
                backgroundColor: theme === 'light' ? '#f3f4f6' : '#1f2937', 
                color: colors.text 
             }}
          >
             <div className="shrink-0 flex justify-center w-14 transition-colors">
               <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
             </div>
             <span className={`transition-all duration-500 whitespace-nowrap
               ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}
             `}>
               {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
             </span>
          </button>

          {/* Sign Out */}
          <button 
            className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden hover:bg-red-50 text-red-500
              ${collapsed ? "w-12 justify-center" : "px-4 w-full font-bold text-xs uppercase tracking-widest"}
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

// --- MAIN LAYOUT ---
const MemberLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Use Context Colors
  const { colors } = useTheme();

  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [location]);

  return (
    // APPLY GLOBAL BACKGROUND HERE VIA STYLE
    <div 
      className="flex min-h-screen font-sans overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >

      <Sidebar_Member isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main 
         className="flex-1 relative min-w-0 transition-colors duration-300"
         style={{ backgroundColor: colors.background }} // Ensure main area also matches
      >
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
          
          <Nav_Member onMenuClick={() => setIsMobileMenuOpen(true)} />

          <div className="mt-6 animate-fade-in">
            <Outlet />
          </div>

        </div>
      </main>
      
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