import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext"; 
import { useGlobalContext } from "../../context/GlobalContext";

const Nav_Admin = () => {
  const { colors, theme, toggleTheme } = useTheme(); 
  const { setUser } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const logOutAdmin = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

  // Helper to convert hex to RGBA for transparency
  const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <section 
      className="w-full rounded-2xl py-2  transition-all duration-300 top-0 z-50 backdrop-blur-md"
      style={{ 
        backgroundColor: getTransparentColor(colors.card, 0.6), 
        border: `1px solid ${getTransparentColor(colors.border, 0.3)}`, 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)' 
      }}
    >
      <div className="flex items-center justify-between px-6">

        {/* Left: Greeting */}
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: colors.text }}>
            Hello, Admin! 
          </h1>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Welcome and Let’s do some workout today!
          </p>
        </div>

        {/* Right: Actions (Theme, Notification, Logout) */}
        <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-4xl border-4 border-gray-50">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-4xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{ 
                backgroundColor: getTransparentColor(colors.background, 0.5),
                border: `1px solid ${getTransparentColor(colors.border, 0.4)}`,
                color: colors.text
            }}
            title="Toggle Theme"
          >
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun text-yellow-400'} text-lg`}></i>
          </button>

          {/* Notification */}
          {/* <div className="w-10 h-10 rounded-4xl flex items-center justify-center cursor-pointer hover:shadow-md transition-all relative"
               style={{ backgroundColor: colors.primary }}>
             <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            <i className="fa-regular fa-bell text-black text-lg"></i>
          </div> */}

          {/* Logout Button */}
          <button
            onClick={logOutAdmin}
            className="flex items-center gap-2 px-4 py-2 rounded-4xl transition-all duration-300 group hover:bg-red-500 hover:text-white cursor-pointer"
            style={{ 
                backgroundColor: getTransparentColor(colors.background, 0.5),
                border: `1px solid ${getTransparentColor(colors.border, 0.4)}`,
                color: colors.text
            }}
          >
            <i className="fa-solid fa-power-off text-sm group-hover:rotate-90 transition-transform duration-300"></i>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Logout</span>
          </button>

        </div>

      </div>
    </section>
  );
};

export default Nav_Admin;