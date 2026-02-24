import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";

const TrainerNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useGlobalContext();
  const [user, setLocalUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Color palette
  const colors = {
    white: "#FFFFFF",
    mattBlack: "#000000",
    lightBlue: "#CDE7FE",
    lime: "#D9F17F",
    softYellow: "#FEEF75",
    gray: "#6B7280"
  };

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
  };

  const navLinks = [
    { path: "/trainer/dashboard", label: "Dashboard", icon: "fa-chart-line" },
    { path: "/trainer/clients", label: "Clients", icon: "fa-users" },
    { path: "/trainer/sessions", label: "Sessions", icon: "fa-calendar-check" },
    { path: "/trainer/workout-diet", label: "Workouts", icon: "fa-dumbbell" },
    { path: "/trainer/announcements", label: "Announcements", icon: "fa-megaphone" }
  ];

  return (
    <nav 
      className="w-full py-4 px-6 shadow-lg sticky top-0 z-50 transition-all duration-300"
      style={{ 
        backgroundColor: colors.white,
        borderBottom: `2px solid ${colors.lightBlue}`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          
          {/* Left: Logo/Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('/trainer/dashboard')}>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: colors.mattBlack }}
            >
              <i className="fa-solid fa-dumbbell"></i>
            </div>
            <div>
              <h2 className="font-black text-lg" style={{ color: colors.mattBlack }}>
                Coach
              </h2>
              <p className="text-xs" style={{ color: colors.gray }}>
                Trainer Hub
              </p>
            </div>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigateTo(link.path)}
                  className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                  style={{
                    backgroundColor: isActive ? colors.lime : "transparent",
                    color: isActive ? colors.mattBlack : colors.gray,
                    border: `1px solid ${isActive ? colors.lime : colors.lightBlue}`,
                    opacity: isActive ? 1 : 0.7
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = colors.lightBlue;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <i className={`fa-solid ${link.icon} text-xs`}></i>
                  <span className="hidden sm:inline">{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Profile & Actions */}
          <div className="flex items-center gap-4">
            
            {/* Trainer Profile Section */}
            <div 
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
              style={{
                backgroundColor: colors.lightBlue,
                borderColor: colors.lightBlue,
                opacity: 0.95
              }}
              onClick={() => navigateTo('/trainer/profile')}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: colors.mattBlack }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: colors.mattBlack }}
                  >
                    {user?.name?.charAt(0) || "T"}
                  </div>
                )}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold" style={{ color: colors.mattBlack }}>
                  {user?.name || "Coach"}
                </p>
                <p className="text-[10px]" style={{ color: colors.gray }}>
                  Trainer
                </p>
              </div>
            </div>

            {/* Notification Icon */}
            <button 
              className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-md"
              style={{
                backgroundColor: colors.softYellow,
                color: colors.mattBlack
              }}
              title="Notifications"
            >
              <i className="fa-solid fa-bell text-lg"></i>
              <span 
                className="absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: colors.mattBlack }}
              ></span>
            </button>

            {/* Desktop Logout Button */}
            <button 
              onClick={logoutTrainer}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300"
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
              <i className="fa-solid fa-power-off text-sm"></i>
              <span>Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: colors.lightBlue,
                color: colors.mattBlack
              }}
            >
              <i className={`fa-solid ${menuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-2 border-t-2" style={{ borderColor: colors.lightBlue }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigateTo(link.path)}
                  className="w-full px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all text-left flex items-center gap-3"
                  style={{
                    backgroundColor: isActive ? colors.lime : colors.lightBlue,
                    color: colors.mattBlack,
                    opacity: isActive ? 1 : 0.75
                  }}
                >
                  <i className={`fa-solid ${link.icon}`}></i>
                  {link.label}
                </button>
              );
            })}
            
            <button 
              onClick={() => {
                navigateTo('/trainer/profile');
              }}
              className="w-full px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-3"
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
              className="w-full px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-3"
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
  );
};

export default TrainerNav;
