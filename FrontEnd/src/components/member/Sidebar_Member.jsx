import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo.png";
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar_Member = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { setUser, api } = useGlobalContext();
  const { theme, toggleTheme, colors } = useTheme(); 
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // --- NEW: PLAN VALIDATION STATE ---
  const [hasActivePlan, setHasActivePlan] = useState(true); // Default true to avoid flicker
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const res = await api.get("/members/profile");
        const expiryDate = res.data.expiryDate ? new Date(res.data.expiryDate) : null;
        const today = new Date();
        
        // Member is active only if they have a plan and it hasn't expired
        if (!res.data.plan || (expiryDate && expiryDate < today)) {
          setHasActivePlan(false);
        } else {
          setHasActivePlan(true);
        }
      } catch (error) {
        setHasActivePlan(false);
      } finally {
        setLoading(false);
      }
    };
    checkMembership();
  }, [api, pathname]); // Re-check on navigation to stay updated

  const signOutMember = () => {
    setUser(null);
    localStorage.setItem("userInfo", JSON.stringify(null));
    navigate("/login", { replace: true });
  };

  // --- UPDATED: CONDITIONAL MENU ITEMS ---
  const allMenuItems = [
    { name: "Dashboard", path: "/member", icon: "fa-solid fa-table-columns", public: false },
    { name: "Profile", path: "/member/profile", icon: "fa-regular fa-user", public: true },
    { name: "Membership", path: "/member/membership", icon: "fa-regular fa-id-card", public: true },
    { name: "Plans", path: "/member/plans", icon: "fa-solid fa-layer-group", public: true },
    { name: "Workouts & Diet Plans", path: "/member/workout", icon: "fa-solid fa-dumbbell", public: false },
    { name: "Progress", path: "/member/progress", icon: "fa-solid fa-chart-line", public: false },
    { name: "Bookings", path: "/member/booking", icon: "fa-regular fa-calendar-check", public: false },
    { name: "Chat", path: "/member/chat", icon: "fa-regular fa-comments", public: false },
    { name: "Announcements", path: "/member/announcements", icon: "fa-regular fa-bell", public: false },
    { name: "Feedback", path: "/member/feedback", icon: "fa-solid fa-star-half-stroke", public: false },
    { name: "Invoices", path: "/member/invoices", icon: "fa-solid fa-file-invoice-dollar", public: true },
    { name: "Gallery", path: "/member/gallery", icon: "fa-regular fa-images", public: true },
    { name: "Attendance History", path: "/member/attendance-history", icon: "fa-solid fa-clipboard-list", public: false },
    { name: "Scan Attendance", path: "/member/scan-attendance", icon: "fa-solid fa-qrcode", public: false },
  ];

  // Filter based on plan status
  const menuItems = allMenuItems.filter(item => hasActivePlan || item.public);

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}></div>
      <aside style={{ backgroundColor: colors.sidebar, borderColor: colors.border }} className={`fixed lg:sticky top-0 left-0 border-r z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl lg:shadow-none max-lg:h-screen max-lg:overflow-y-auto lg:min-h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? "lg:w-22 px-2" : "lg:w-64 px-2"}`}>
        
        {/* Toggle Button */}
        <button onClick={() => setCollapsed(prev => !prev)} className="absolute -right-3.5 top-3 w-8 h-8 rounded-full hidden lg:flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer" style={{ backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#000' }}>
          <i className={`fa-solid fa-chevron-left text-[10px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
        </button>

        {/* Logo Section */}
        <div className={`h-24 flex items-center transition-all duration-500 ${collapsed ? "justify-center" : "px-4 shrink-0"}`}>
          <div className="w-12 h-12 p-1.5 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border-2 shrink-0" style={{ backgroundColor: colors.primary, borderColor: colors.card, color: '#14532d' }}>
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div className={`ml-4 transition-all duration-500 transform ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
            <span className="text-xl font-black tracking-tight whitespace-nowrap" style={{ color: colors.text }}>SONGAR'S<span className="text-red-600"> GYM</span></span>
          </div>
        </div>

        {/* --- NAVIGATION --- */}
        <div className="flex-1 px-2 space-y-1.5 pb-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <NavLink key={idx} to={item.path} end={item.path === '/member'} onClick={() => onClose && window.innerWidth < 1024 && onClose()} style={{ backgroundColor: isActive ? colors.secondary : 'transparent', color: isActive ? (theme === 'dark' ? '#fff' : '#000') : colors.textMuted }} className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden hover:opacity-80`}>
                <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}><i className={`fa-solid ${item.icon} text-lg transition-colors`}></i></div>
                <span className={`text-sm font-bold whitespace-nowrap transition-all duration-500 ease-in-out ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}`}>{item.name}</span>
              </NavLink>
            );
          })}

          {/* Locked Message for Non-Members */}
          {!hasActivePlan && !loading && (
            <div className={`mt-6 p-4 rounded-2xl bg-orange-50 border border-orange-100 transition-all ${collapsed ? 'hidden' : 'block'}`}>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Membership Required</p>
              <p className="text-[11px] text-orange-800 font-medium leading-relaxed">Some features are locked. Purchase a plan to unlock training tools.</p>
              <button onClick={() => navigate('/member/plans')} className="mt-3 text-[10px] font-bold text-orange-900 underline hover:no-underline">Go to Plans →</button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button onClick={toggleTheme} className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden cursor-pointer hover:opacity-80 ${collapsed ? "w-12 justify-center" : "px-4 w-full font-bold text-xs uppercase tracking-widest"}`} style={{ backgroundColor: theme === 'light' ? '#f3f4f6' : '#1f2937', color: colors.text }}>
            <div className="shrink-0 flex justify-center w-14 transition-colors"><i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i></div>
            <span className={`transition-all duration-500 whitespace-nowrap ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}`}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden hover:bg-red-50 text-red-500 ${collapsed ? "w-12 justify-center" : "px-4 w-full font-bold text-xs uppercase tracking-widest"}`} onClick={signOutMember}>
            <div className="shrink-0 flex justify-center w-14 transition-colors"><i className="fa-solid fa-right-from-bracket text-lg"></i></div>
            <span className={`transition-all duration-500 whitespace-nowrap ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}`}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar_Member;