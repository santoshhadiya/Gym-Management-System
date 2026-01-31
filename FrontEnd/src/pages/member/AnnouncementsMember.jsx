import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast'; // Updated Toast
import { useTheme } from "../../context/ThemeContext"; // Import Context

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const AnnouncementsMember = () => {
  const { colors, theme } = useTheme(); // Consume Theme
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // --- STYLE INJECTION ---
  useEffect(() => {
    // Only injecting FontAwesome, removed Toastify CSS
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- FETCH DATA ---
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/announcements/feed`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      if (!res.ok) throw new Error("Failed to load announcements");
      
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAnnouncements();
  }, []);

  // --- HELPERS ---
  const getPriorityStyles = (p) => {
     switch(p) {
        case "Critical": 
           return theme === 'dark' 
              ? "bg-red-900/20 text-red-400 border-red-900/30" 
              : "bg-red-50 text-red-600 border-red-100";
        case "Important": 
           return theme === 'dark' 
              ? "bg-orange-900/20 text-orange-400 border-orange-900/30" 
              : "bg-orange-50 text-orange-600 border-orange-100";
        default: 
           return theme === 'dark' 
              ? "bg-blue-900/20 text-blue-400 border-blue-900/30" 
              : "bg-blue-50 text-blue-600 border-blue-100";
     }
  };

  const getStripeColor = (p) => {
     if (p === 'Critical') return 'bg-red-500';
     if (p === 'Important') return 'bg-orange-400';
     return 'bg-blue-400';
  };

  return (
    <div 
      className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen relative"
      style={{ backgroundColor: colors.background, borderColor: colors.border }}
    >
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Announcements</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Stay updated with the latest gym news.</p>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
             <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.textMuted }}></i>
          </div>
      ) : (
         <div className="grid grid-cols-1 gap-6">
            {announcements.length > 0 ? announcements.map(item => (
               <div 
                  key={item._id} 
                  className="rounded-2xl p-6 hover:shadow-lg transition-all relative overflow-hidden border"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${getStripeColor(item.priority)}`}></div>
                  
                  <div className="pl-4">
                     <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getPriorityStyles(item.priority)}`}>
                           {item.priority}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}>
                           <i className="fa-regular fa-clock"></i> {new Date(item.publishDate).toLocaleDateString()}
                        </span>
                     </div>
                     
                     <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>{item.title}</h3>
                     <p className="text-sm leading-relaxed" style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>{item.message}</p>
                     
                     {item.expiryDate && (
                        <div className="mt-4 pt-3 border-t text-xs flex items-center gap-2"
                             style={{ borderColor: colors.border, color: colors.textMuted }}>
                           <i className="fa-solid fa-hourglass-end"></i> Valid until: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                     )}
                  </div>
               </div>
            )) : (
               <div className="text-center py-20 rounded-[2rem] border border-dashed"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <i className="fa-solid fa-bullhorn text-4xl mb-3" style={{ color: colors.textMuted }}></i>
                  <p style={{ color: colors.textMuted }}>No new announcements.</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default AnnouncementsMember;