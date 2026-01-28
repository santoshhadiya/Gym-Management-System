import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const AnnouncementsMember = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // --- STYLE INJECTION ---
  useEffect(() => {
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkToast);
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
  const getPriorityColor = (p) => {
     switch(p) {
        case "Critical": return "bg-red-50 text-red-600 border-red-100";
        case "Important": return "bg-orange-50 text-orange-600 border-orange-100";
        default: return "bg-blue-50 text-blue-600 border-blue-100";
     }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with the latest gym news.</p>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
             <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
          </div>
      ) : (
         <div className="grid grid-cols-1 gap-6">
            {announcements.length > 0 ? announcements.map(item => (
               <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${item.priority === 'Critical' ? 'bg-red-500' : item.priority === 'Important' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                  
                  <div className="pl-4">
                     <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getPriorityColor(item.priority)}`}>
                           {item.priority}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                           <i className="fa-regular fa-clock"></i> {new Date(item.publishDate).toLocaleDateString()}
                        </span>
                     </div>
                     
                     <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                     <p className="text-sm text-gray-600 leading-relaxed">{item.message}</p>
                     
                     {item.expiryDate && (
                        <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400 flex items-center gap-2">
                           <i className="fa-solid fa-hourglass-end"></i> Valid until: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                     )}
                  </div>
               </div>
            )) : (
               <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <i className="fa-solid fa-bullhorn text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No new announcements.</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default AnnouncementsMember;