import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const AnnouncementsTrainer = () => {
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
      toast.error("Failed to load data");
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
        case "Critical": return "bg-red-100 text-red-800 border-red-200";
        case "Important": return "bg-amber-100 text-amber-800 border-amber-200";
        default: return "bg-indigo-50 text-indigo-700 border-indigo-200";
     }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Updates</h1>
          <p className="text-sm text-gray-500 mt-1">Important notices and schedule changes.</p>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
             <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
          </div>
      ) : (
         <div className="space-y-6">
            {announcements.length > 0 ? announcements.map(item => (
               <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                  
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 min-w-[80px] h-full md:h-auto border border-gray-100">
                     <span className="text-xs font-bold text-gray-400 uppercase">{new Date(item.publishDate).toLocaleString('default', { month: 'short' })}</span>
                     <span className="text-2xl font-black text-gray-800">{new Date(item.publishDate).getDate()}</span>
                  </div>

                  <div className="flex-1">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${getPriorityColor(item.priority)}`}>
                           {item.priority}
                        </span>
                     </div>
                     <p className="text-sm text-gray-600 leading-relaxed mb-4">{item.message}</p>
                     
                     <div className="flex items-center gap-4 text-xs text-gray-400">
                        {item.audience === "Trainers Only" && <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded"><i className="fa-solid fa-lock mr-1"></i> Trainers Only</span>}
                        {item.expiryDate && <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>}
                     </div>
                  </div>
               </div>
            )) : (
               <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No updates available.</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default AnnouncementsTrainer;