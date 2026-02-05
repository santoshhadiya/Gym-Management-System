import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav_Admin from "../../components/admin/Nav_Admin";
import Sidebar_Admin from "../../components/admin/Sidebar_Admin";
import { useTheme } from "../../context/ThemeContext"; 

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { colors, theme } = useTheme(); // Consume theme to check for light/dark mode

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

  // Define the background style based on the theme
  const backgroundStyle = {
    background: theme === 'light' 
      ? 'linear-gradient(135deg, #cde7fe90 0%, #ffffff 100%)' // Lite mode gradient
      : colors.background, // Fallback to theme context for dark mode
    color: colors.text,
    minHeight: '100vh',
    transition: 'all 0.3s ease'
  };

  return (
    <div 
      className="flex min-h-screen font-sans transition-colors duration-300"
      style={backgroundStyle}
    >
      {/* Sidebar */}
      <Sidebar_Admin/>

      {/* Main Content - Transparent background to show the parent gradient */}
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="p-6">
            <Nav_Admin />
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

export default AdminLayout;