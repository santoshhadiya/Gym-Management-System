import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewState, setViewState] = useState("list"); // 'list', 'form'
  const [filterAudience, setFilterAudience] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: null,
    title: "",
    message: "",
    audience: "All Users",
    priority: "Normal",
    publishDate: "",
    expiryDate: "",
    attachment: null,
    notify: false
  });
  
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
      const res = await fetch(`${BACKEND_URL}/api/announcements`, {
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

  // --- ACTIONS ---
  const handleCreate = () => {
    setFormData({
       _id: null, title: "", message: "", audience: "All Users", priority: "Normal",
       publishDate: new Date().toISOString().split('T')[0],
       expiryDate: "", attachment: null, notify: false
    });
    setIsEditing(false);
    setViewState("form");
  };

  const handleEdit = (announcement) => {
    setFormData(announcement);
    setIsEditing(true);
    setViewState("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    
    try {
        const res = await fetch(`${BACKEND_URL}/api/announcements/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error("Delete failed");
        
        toast.info("Announcement deleted");
        fetchAnnouncements();
    } catch (err) {
        toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing 
            ? `${BACKEND_URL}/api/announcements/${formData._id}` 
            : `${BACKEND_URL}/api/announcements`;
            
        const res = await fetch(url, {
            method,
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`
            },
            body: JSON.stringify(formData)
        });

        if (!res.ok) throw new Error("Operation failed");

        toast.success(isEditing ? "Updated successfully" : "Published successfully");
        setViewState("list");
        fetchAnnouncements();
    } catch (err) {
        toast.error(err.message);
    }
  };

  // --- HELPERS ---
  const getPriorityColor = (p) => {
     switch(p) {
        case "Critical": return "bg-red-100 text-red-700 border-red-200";
        case "Important": return "bg-orange-100 text-orange-700 border-orange-200";
        default: return "bg-blue-50 text-blue-600 border-blue-100";
     }
  };

  const filteredList = filterAudience === "All" 
    ? announcements 
    : announcements.filter(a => a.audience === filterAudience || a.audience === "All Users");

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Broadcast updates, news, and alerts.</p>
        </div>
        
        {viewState === 'list' && (
          <button 
             onClick={handleCreate}
             className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
             <i className="fa-solid fa-bullhorn"></i> New Announcement
          </button>
        )}
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
             <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
          </div>
      ) : (
        <>
           {viewState === 'list' ? (
              <>
                 {/* FILTERS */}
                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'Members Only', 'Trainers Only'].map(filter => (
                       <button
                          key={filter}
                          onClick={() => setFilterAudience(filter)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filterAudience === filter ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                       >
                          {filter}
                       </button>
                    ))}
                 </div>

                 {/* LIST */}
                 <div className="grid grid-cols-1 gap-4">
                    {filteredList.length > 0 ? filteredList.map(item => (
                       <div key={item.id || item._id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${item.priority === 'Critical' ? 'bg-red-500' : item.priority === 'Important' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                          
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4 pl-4">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(item.priority)}`}>
                                      {item.priority}
                                   </span>
                                   <span className="text-xs text-gray-400 font-medium">
                                      <i className="fa-solid fa-users mr-1"></i> {item.audience}
                                   </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.message}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                   <span><i className="fa-regular fa-clock mr-1"></i> Posted: {item.publishDate}</span>
                                   {item.expiryDate && <span><i className="fa-solid fa-hourglass-end mr-1"></i> Expires: {item.expiryDate}</span>}
                                   <span><i className="fa-regular fa-eye mr-1"></i> {item.views} Views</span>
                                </div>
                             </div>

                             <div className="flex gap-2 self-start md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(item)} className="p-2 bg-gray-50 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                                   <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button onClick={() => handleDelete(item.id || item._id)} className="p-2 bg-gray-50 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                   <i className="fa-solid fa-trash"></i>
                                </button>
                             </div>
                          </div>
                       </div>
                    )) : (
                       <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                          <p className="text-gray-500">No announcements found.</p>
                       </div>
                    )}
                 </div>
              </>
           ) : (
              <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-[2rem] border border-gray-200">
                 <h3 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? "Edit Announcement" : "Create New Announcement"}</h3>
                 
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                          <input 
                             required
                             type="text" 
                             value={formData.title}
                             onChange={(e) => setFormData({...formData, title: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                             placeholder="e.g. Holiday Closure"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Audience</label>
                          <select 
                             value={formData.audience}
                             onChange={(e) => setFormData({...formData, audience: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white"
                          >
                             <option>All Users</option>
                             <option>Members Only</option>
                             <option>Trainers Only</option>
                          </select>
                       </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Message</label>
                       <textarea 
                          required
                          rows="4"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm resize-none"
                          placeholder="Type your announcement details here..."
                       ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Publish Date</label>
                          <input 
                             type="date" 
                             required
                             value={formData.publishDate}
                             onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Expiry Date (Optional)</label>
                          <input 
                             type="date" 
                             value={formData.expiryDate}
                             onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Priority</label>
                          <select 
                             value={formData.priority}
                             onChange={(e) => setFormData({...formData, priority: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white"
                          >
                             <option>Normal</option>
                             <option>Important</option>
                             <option>Critical</option>
                          </select>
                       </div>
                       <div className="flex items-center gap-3 bg-white px-4 rounded-xl border border-gray-200">
                          <input 
                             type="checkbox" 
                             id="notify"
                             checked={formData.notify}
                             onChange={(e) => setFormData({...formData, notify: e.target.checked})}
                             className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor="notify" className="text-sm text-gray-600 cursor-pointer font-medium">Send Notification Alert</label>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                       <button type="button" onClick={() => setViewState("list")} className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 cursor-pointer">
                          Cancel
                       </button>
                       <button type="submit" className="flex-1 py-3 bg-[#FEEF75] text-yellow-900 rounded-xl font-bold hover:bg-yellow-300 shadow-sm cursor-pointer">
                          {isEditing ? "Update Announcement" : "Publish Now"}
                       </button>
                    </div>

                 </form>
              </div>
           )}
        </>
      )}
    </div>
  );
};

export default Announcements;