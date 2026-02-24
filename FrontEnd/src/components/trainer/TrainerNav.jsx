import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";

const TrainerNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useGlobalContext();
  const [user, setLocalUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Color palette
  const colors = {
    white: "#FFFFFF",
    mattBlack: "#000000",
    lightBlue: "#CDE7FE",
    lime: "#D9F17F",
    softYellow: "#FEEF75",
    gray: "#6B7280"
  };

  // Mock notifications
  const notifications = [
    { id: 1, text: "New session booking from John Doe", time: "5 mins ago", type: "booking" },
    { id: 2, text: "Member completed workout plan", time: "1 hour ago", type: "progress" },
    { id: 3, text: "Feedback received from Sarah", time: "2 hours ago", type: "feedback" }
  ];

  // Mock quick stats
  const quickStats = [
    { label: "Today's Sessions", value: "3", icon: "fa-calendar-check", color: colors.lime },
    { label: "Active Clients", value: "12", icon: "fa-users", color: colors.lightBlue },
    { label: "Pending Approval", value: "2", icon: "fa-hourglass-end", color: colors.softYellow }
  ];

  useEffect(() => {
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLocalUser(userInfo);

    return () => {
      if (document.head.contains(linkFA)) {
        document.head.removeChild(linkFA);
      }
    };
  }, []);

  const logoutTrainer = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

  const navigateTo = (path) => {
    navigate(path);
    setMenuOpen(false);
    setShowNotifications(false);
  };

  const navLinks = [
   ];

  return (
    <>
      {/* Main Navigation Bar */}
      <nav 
        className="w-full py-1 px-4 md:px-6 sticky top-0 z-40 transition-all duration-300 backdrop-blur-sm"
        style={{ 
          backgroundColor: colors.white,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Logo/Branding */}
            <div 
              className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
              onClick={() => navigateTo('/trainer/dashboard')}
            >
              <div 
                className="w-10 md:w-11 h-10 md:h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: colors.mattBlack }}
              >
                <i className="fa-solid fa-dumbbell"></i>
              </div>
              <div className="hidden sm:block">
                <h2 className="font-black text-base md:text-lg leading-tight" style={{ color: colors.mattBlack }}>
                  Coach
                </h2>
                
              </div>
            </div>

          
            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              
              {/* Trainer Profile Section */}
              <div 
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md group"
                
                onClick={() => navigateTo('/trainer/profile')}
                title="View Profile"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ borderColor: colors.mattBlack }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: colors.mattBlack }}
                    >
                      {user?.name?.charAt(0) || "T"}
                    </div>
                  )}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold leading-tight" style={{ color: colors.mattBlack }}>
                    {user?.name || "Coach"}
                  </p>
                  <p className="text-[9px]" style={{ color: colors.gray }}>
                    Trainer
                  </p>
                </div>
              </div>

             

              {/* Desktop Logout Button */}
              <button 
                onClick={logoutTrainer}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all duration-300 group"
                style={{
                  backgroundColor: colors.mattBlack,
                  color: colors.white,
                  border: `2px solid ${colors.mattBlack}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.mattBlack;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.mattBlack;
                  e.currentTarget.style.color = colors.white;
                }}
                title="Logout"
              >
                <i className="fa-solid fa-power-off"></i>
                <span className="hidden md:inline">Logout</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: menuOpen ? colors.lime : colors.lightBlue,
                  color: colors.mattBlack
                }}
                title="Menu"
              >
                <i className={`fa-solid ${menuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-2 border-t-2 pt-4 animate-in fade-in slide-in-from-top-2" style={{ borderColor: colors.lightBlue }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigateTo(link.path)}
                    className="w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-left flex items-center gap-3 group"
                    style={{
                      backgroundColor: isActive ? colors.lime : colors.lightBlue,
                      color: colors.mattBlack,
                      opacity: isActive ? 1 : 0.75
                    }}
                  >
                    <i className={`fa-solid ${link.icon} group-hover:scale-110 transition-transform duration-300`}></i>
                    {link.label}
                  </button>
                );
              })}
              
              <button 
                onClick={() => navigateTo('/trainer/profile')}
                className="w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3"
                style={{
                  backgroundColor: colors.softYellow,
                  color: colors.mattBlack
                }}
              >
                <i className="fa-solid fa-user"></i>
                Profile
              </button>

              <button 
                onClick={logoutTrainer}
                className="w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3"
                style={{
                  backgroundColor: colors.mattBlack,
                  color: colors.white
                }}
              >
                <i className="fa-solid fa-power-off"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 lg:hidden z-30"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default TrainerNav;
