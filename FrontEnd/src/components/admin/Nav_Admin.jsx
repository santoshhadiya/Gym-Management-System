import React, { useEffect } from 'react';
import { useTheme } from "../../context/ThemeContext"; // Import Context

const Nav_Admin = () => {
  const { colors, theme } = useTheme(); // Consume Theme

  // Load Font Awesome dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section 
      className="w-full rounded-2xl py-4 shadow-sm transition-colors duration-300"
      style={{ backgroundColor: colors.card }}
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
             style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}>

          {/* Search Box */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search anything"
              className="pl-10 pr-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all shadow-sm"
              style={{ 
                 backgroundColor: colors.background, 
                 borderColor: colors.border,
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
             {/* Optional Badge for unread notifications */}
             <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
            
            <i className="fa-regular fa-bell text-black text-lg"></i>
          </div>

        </div>

      </div>
    </section>
  )
}

export default Nav_Admin;