import React, { useEffect } from 'react';
import { useTheme } from "../../context/ThemeContext"; 

const Nav_Admin = () => {
  const { colors, theme } = useTheme(); 

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Helper to convert hex to RGBA for transparency
  const getTransparentColor = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <section 
      className="w-full rounded-2xl py-4 shadow-sm transition-all duration-300 sticky top-0 z-50 backdrop-blur-md"
      style={{ 
        backgroundColor: getTransparentColor(colors.card, 0.6), // 60% opacity
        border: `1px solid ${getTransparentColor(colors.border, 0.3)}`, // Light transparent border
        backdropFilter: 'blur(12px)', // Standard blur effect
        WebkitBackdropFilter: 'blur(12px)' // Safari support
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

        {/* Right: Search & Notification */}
        <div className={`flex items-center gap-4 p-2 px-3 rounded-full transition-colors`}
             style={{ backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)' }}>

          {/* Search Box */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search anything"
              className="pl-10 pr-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all shadow-sm"
              style={{ 
                 backgroundColor: getTransparentColor(colors.background, 0.5), 
                 borderColor: getTransparentColor(colors.border, 0.5),
                 color: colors.text
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          {/* Notification */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md transition-all relative"
               style={{ backgroundColor: colors.primary }}>
             <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
            
            <i className="fa-regular fa-bell text-black text-lg"></i>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Nav_Admin;