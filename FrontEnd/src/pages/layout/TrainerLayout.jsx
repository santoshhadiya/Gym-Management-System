import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../context/GlobalContext';
import logo from "../../assets/logo.png";

// --- INTERNAL COMPONENT: TRAINER NAVIGATION (Top Bar) ---
const Nav_Trainer = ({ onMenuClick, trainerStatus }) => {
  return (
    <section className="w-full bg-white py-2 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#121212] hover:bg-[#FEEF75] transition-all cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-bars-staggered text-sm md:text-base"></i>
          </button>

          <div>
            <h2 className="text-lg md:text-xl font-black text-[#121212] flex items-center gap-2 md:gap-3 tracking-tight">
              Hello, Coach!
             
            </h2>
            <p className="text-[9px] md:text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em] truncate max-w-[150px] md:max-w-none">
              {trainerStatus === "Inactive" ? "Contact Admin to reactivate your access." : "Ready to transform lives today?"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications only visible to Active trainers */}
          {trainerStatus !== "Inactive" && (
            <button className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#121212] hover:bg-gray-50 transition-all relative cursor-pointer shadow-sm group shrink-0">
              <i className="fa-regular fa-bell text-base md:text-lg group-hover:rotate-12 transition-transform"></i>
              <span className="absolute top-3 right-3 md:top-3.5 md:right-3.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          )}

          <div className="flex items-center gap-4 cursor-pointer group pl-2 md:pl-4 border-l border-gray-100 ml-1 md:ml-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#CDE7FE] flex items-center justify-center text-blue-900 font-black text-sm md:text-base border-2 border-white shadow-lg group-hover:rotate-3 transition-all shrink-0">
              RM
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- INTERNAL COMPONENT: SIDEBAR ---
const Sidebar_Trainer = ({ isOpen, onClose, trainerStatus }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useGlobalContext();
  const { pathname } = useLocation();

  const isInactive = trainerStatus === "Inactive";

  const logOutTrainer = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

  const navItems = [
    { path: '/trainer', label: 'Dashboard', icon: 'fa-table-columns' },
    { path: '/trainer/profile', label: 'My Profile', icon: 'fa-user' },
    { path: '/trainer/members', label: 'Assigned Members', icon: 'fa-users', restricted: true },
    { path: '/trainer/workout-diet', label: 'Workout & Diet Plans', icon: 'fa-clipboard-list', restricted: true },
    { path: '/trainer/monitor-progress', label: 'Member Progress', icon: 'fa-chart-line', restricted: true },
    { path: '/trainer/feedbacks', label: 'Feedbacks', icon: 'fa-star', restricted: true },
   /*  { path: '/trainer/availability', label: 'My Availability', icon: 'fa-clock' }, */
/*     { path: '/trainer/payments', label: 'Payment Status', icon: 'fa-file-invoice-dollar' }, */
    { path: '/trainer/chat/member', label: 'Chat with Member', icon: 'fa-comments', restricted: true },
    { path: '/trainer/chat/owner', label: 'Chat with Owner', icon: 'fa-user-shield', restricted: true },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-[#121212]/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} `} onClick={onClose}></div>

      <aside className={`fixed lg:sticky top-0 left-0 lg:min-h-screen bg-white border-r border-gray-100 z-[70] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? "lg:w-24 px-3" : "lg:w-72 px-6"} w-72 h-screen`}>

        <button onClick={() => setCollapsed(prev => !prev)} className="absolute -right-3.5 top-10 w-8 h-8 bg-[#121212] rounded-full hidden lg:flex items-center justify-center text-[#FEEF75] shadow-lg hover:scale-110 transition-transform z-[80] cursor-pointer">
          <i className={`fa-solid fa-chevron-left text-[10px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`}></i>
        </button>

        <div className={`h-24 flex items-center transition-all duration-500 ${collapsed ? "justify-center" : "px-4"}`}>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#FEEF75] flex items-center justify-center text-[#121212] font-black text-xl shadow-md border-2 border-white">
            <img src={logo} className='p-1' alt="logo" />
          </div>
          <div className={`ml-4 transition-all duration-500 transform ${collapsed ? "opacity-0 -translate-x-10 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"}`}>
            <span className="text-xl font-black text-[#121212]">SONGAR'S <span className="text-yellow-600 text-[15px]">COACH</span></span>
          </div>
        </div>

        <div className="flex-1 px-2 space-y-1.5 pt-4 overflow-y-auto no-scrollbar">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            const isDisabled = isInactive && item.restricted;

            return (
              <NavLink
                key={idx}
                to={isDisabled ? "#" : item.path}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    toast.error("Your account is Inactive. Feature locked.");
                  } else {
                    onClose && window.innerWidth < 1024 && onClose();
                  }
                }}
                className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden
                  ${isActive ? 'bg-[#FEEF75] text-[#121212] font-black shadow-md' : 'text-gray-400 hover:bg-gray-50 hover:text-[#121212]'}
                  ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`flex justify-center shrink-0 ${collapsed ? "w-full" : "w-14"}`}>
                  <i className={`fa-solid ${item.icon} text-lg ${isActive ? 'text-[#121212]' : 'text-gray-300 group-hover:text-[#121212]'}`}></i>
                </div>
                <span className={`text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-500 ease-in-out ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}`}>
                  {item.label} {isDisabled && <i className="fa-solid fa-lock ml-2 text-[10px]"></i>}
                </span>
              </NavLink>
            );
          })}
          <div className={`mt-auto p-4 border-t border-gray-50 flex flex-col ${collapsed ? "items-center" : ""}`}>
            <button className={`flex items-center h-12 rounded-2xl transition-all duration-300 group overflow-hidden ${collapsed ? "w-12 justify-center" : "px-4 w-full hover:bg-red-50 text-gray-400 hover:text-red-500 font-black"}`} onClick={logOutTrainer}>
              <div className="shrink-0 flex justify-center w-14 transition-colors"><i className="fa-solid fa-right-from-bracket text-lg"></i></div>
              <span className={`text-[12px] font-black transition-all duration-500 uppercase tracking-widest whitespace-nowrap ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto delay-150"}`}>Logout</span>
            </button>
          </div>
        </div>

        {/* Hide Session Tracker if Inactive */}



      </aside>
    </>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const TrainerLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trainerStatus, setTrainerStatus] = useState("Active");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { api, setUser, BACKEND_URL } = useGlobalContext();

  // STATUS CHECK SYNC
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo?.token) return;

        // Fetching profile to get real-time status from DB
        const response = await fetch(`${BACKEND_URL}/api/trainers/profile`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTrainerStatus(data.status || "Active");

          // Immediate force-logout if the protect middleware fails or status is Inactive
          if (data.status === "Inactive") {
            // We allow viewing the dashboard/profile, but block others via guard
          }
        } else if (response.status === 401) {
          // Token expired or deactivated at middleware level
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } catch (err) {
        console.error("Status check failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [location.pathname, BACKEND_URL, navigate, setUser]);

  // NAVIGATION GUARD: Redirect Inactive trainers trying to access restricted pages
  const restrictedPaths = ['/trainer/members', '/trainer/workout-diet', '/trainer/monitor-progress', '/trainer/feedbacks', '/trainer/chat/member', '/trainer/chat/owner'];

  if (!loading && trainerStatus === "Inactive" && restrictedPaths.some(path => location.pathname.startsWith(path))) {
    return <Navigate to="/trainer" replace />;
  }

  return (
    <div className="flex min-h-screen  font-sans text-gray-800 overflow-x-hidden h-screen">
      <Sidebar_Trainer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} trainerStatus={trainerStatus} />
      <main className="flex-1 bg-[#ffffff] relative min-w-0 transition-all duration-500">
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
          <Nav_Trainer onMenuClick={() => setIsMobileMenuOpen(true)} trainerStatus={trainerStatus} />
          <div className="mt-8 animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TrainerLayout;