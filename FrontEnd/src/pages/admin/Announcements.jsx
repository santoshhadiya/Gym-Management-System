import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const Announcements = () => {
  // --- MOCK DATA ---
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Gym Maintenance Update",
      message: "The cardio section will be closed for maintenance on Sunday, 10th Aug from 10 AM to 2 PM.",
      audience: "All Users",
      priority: "Important",
      publishDate: "2025-08-08",
      expiryDate: "2025-08-11",
      status: "Active",
      views: 145,
      attachment: null,
      notify: true
    },
    {
      id: 2,
      title: "New Yoga Classes",
      message: "We are starting evening Yoga batches with Trainer Sneha. Register now!",
      audience: "Members Only",
      priority: "Normal",
      publishDate: "2025-08-01",
      expiryDate: "2025-08-30",
      status: "Active",
      views: 89,
      attachment: "yoga_poster.jpg",
      notify: false
    },
    {
      id: 3,
      title: "Trainer Meeting",
      message: "Monthly performance review meeting at 2 PM in the conference room.",
      audience: "Trainers Only",
      priority: "Urgent",
      publishDate: "2025-08-05",
      expiryDate: "2025-08-05",
      status: "Expired",
      views: 12,
      attachment: null,
      notify: true
    }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'form'
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAudience, setFilterAudience] = useState("All");
  
  const [formData, setFormData] = useState({
    id: null, title: "", message: "", audience: "All Users", priority: "Normal",
    publishDate: "", expiryDate: "", notify: true, showPopup: false, attachment: null
  });

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

  // --- HELPERS ---
  const getPriorityStyle = (priority) => {
    switch(priority) {
      case "Urgent": return "bg-red-50 text-red-600 border-red-200";
      case "Important": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      default: return "bg-[#CDE7FE] text-blue-900 border-blue-200";
    }
  };

  const calculateStatus = (publishDate, expiryDate) => {
    const today = new Date().toISOString().split('T')[0];
    if (expiryDate && today > expiryDate) return "Expired";
    if (publishDate > today) return "Scheduled";
    return "Active";
  };

  // --- ACTIONS ---
  const handleOpenForm = (announcement = null) => {
    if (announcement) {
      setFormData({ ...announcement });
      setIsEditing(true);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: null, title: "", message: "", audience: "All Users", priority: "Normal",
        publishDate: today, expiryDate: "", notify: true, showPopup: false, attachment: null
      });
      setIsEditing(false);
    }
    setViewState("form");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Title and Message are required!");
      return;
    }

    const status = calculateStatus(formData.publishDate, formData.expiryDate);
    const newEntry = { 
      ...formData, 
      status: status,
      views: isEditing ? formData.views : 0 
    };

    if (isEditing) {
      setAnnouncements(prev => prev.map(a => a.id === formData.id ? newEntry : a));
      toast.success("Announcement updated successfully.");
    } else {
      setAnnouncements([{ ...newEntry, id: Date.now() }, ...announcements]);
      if (formData.notify) toast.info(`Notification sent to ${formData.audience}`);
      else toast.success("Announcement created.");
    }
    setViewState("list");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.info("Announcement deleted.");
    }
  };

  // --- FILTERING ---
  const filteredList = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience = filterAudience === "All" || a.audience.includes(filterAudience);
    return matchesSearch && matchesAudience;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage announcements, notices, and alerts.</p>
        </div>
        
        {viewState === 'list' && (
          <button 
            onClick={() => handleOpenForm()}
            className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-bullhorn"></i> New Announcement
          </button>
        )}
        {viewState === 'form' && (
          <button 
            onClick={() => setViewState("list")}
            className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Back to List
          </button>
        )}
      </div>

      {/* --- LIST VIEW --- */}
      {viewState === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center">
             <div className="relative flex-grow md:max-w-xs">
                <input
                   type="text"
                   placeholder="Search updates..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
             </div>
             
             <div className="flex gap-2 overflow-x-auto">
                {['All', 'Members', 'Trainers'].map(aud => (
                   <button
                      key={aud}
                      onClick={() => setFilterAudience(aud)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${filterAudience === aud ? 'bg-[#CDE7FE] text-blue-900 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                   >
                      {aud}
                   </button>
                ))}
             </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredList.map(item => (
                <div key={item.id} className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col ${item.status === 'Expired' ? 'border-gray-100 opacity-70' : 'border-gray-200'}`}>
                   
                   {/* Header badges */}
                   <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyle(item.priority)}`}>
                         {item.priority}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.status === 'Active' ? 'bg-green-50 text-green-700' : item.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                         {item.status}
                      </span>
                   </div>

                   {/* Content */}
                   <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{item.title}</h3>
                   <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow">{item.message}</p>

                   {/* Attachment indicator */}
                   {item.attachment && (
                      <div className="mb-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg w-fit">
                         <i className="fa-solid fa-paperclip"></i> Attachment
                      </div>
                   )}

                   {/* Footer Stats */}
                   <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                         <span title="Views"><i className="fa-regular fa-eye mr-1"></i> {item.views}</span>
                         <span title="Audience"><i className="fa-solid fa-users mr-1"></i> {item.audience.split(" ")[0]}</span>
                      </div>
                      <span>{item.publishDate}</span>
                   </div>

                   {/* Actions (Hover) */}
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm">
                      <button onClick={() => handleOpenForm(item)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-50 text-blue-600 cursor-pointer">
                         <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-red-500 cursor-pointer">
                         <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                   </div>
                </div>
             ))}
             {filteredList.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                   <p>No announcements found.</p>
                </div>
             )}
          </div>
        </>
      )}

      {/* --- FORM VIEW --- */}
      {viewState === 'form' && (
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-3xl border border-gray-200">
           <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? "Edit Announcement" : "Create New Announcement"}</h2>
           
           <form onSubmit={handleSave} className="space-y-6">
              
              {/* Title */}
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Subject / Title</label>
                 <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 font-medium"
                    placeholder="e.g. Holiday Notice"
                 />
              </div>

              {/* Message */}
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Message Content</label>
                 <textarea 
                    required 
                    rows="4"
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                    placeholder="Type your message here..."
                 ></textarea>
              </div>

              {/* Audience & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Target Audience</label>
                    <div className="flex gap-2">
                       {['All Users', 'Members Only', 'Trainers Only'].map(aud => (
                          <button
                             key={aud}
                             type="button"
                             onClick={() => setFormData({...formData, audience: aud})}
                             className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${formData.audience === aud ? 'bg-[#CDE7FE] text-blue-900 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                          >
                             {aud.split(" ")[0]}
                          </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Priority Level</label>
                    <div className="flex gap-2">
                       {['Normal', 'Important', 'Urgent'].map(prio => (
                          <button
                             key={prio}
                             type="button"
                             onClick={() => setFormData({...formData, priority: prio})}
                             className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${formData.priority === prio ? getPriorityStyle(prio) : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                          >
                             {prio}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Publish Date</label>
                    <input 
                       type="date" 
                       required 
                       value={formData.publishDate} 
                       onChange={e => setFormData({...formData, publishDate: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Expiry Date (Optional)</label>
                    <input 
                       type="date" 
                       value={formData.expiryDate} 
                       onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer"
                    />
                 </div>
              </div>

              {/* Advanced Options */}
              <div className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
                 <h4 className="text-xs font-bold text-gray-400 uppercase">Visibility & Notifications</h4>
                 
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Send In-App Notification</span>
                    <input 
                       type="checkbox" 
                       checked={formData.notify} 
                       onChange={e => setFormData({...formData, notify: e.target.checked})}
                       className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Show as Dashboard Popup</span>
                    <input 
                       type="checkbox" 
                       checked={formData.showPopup} 
                       onChange={e => setFormData({...formData, showPopup: e.target.checked})}
                       className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                 </div>

                 <div className="pt-2">
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors w-full justify-center text-sm text-gray-500">
                       <i className="fa-solid fa-cloud-arrow-up"></i>
                       {formData.attachment ? "Attachment Uploaded" : "Upload Image / PDF"}
                       <input type="file" className="hidden" onChange={() => setFormData({...formData, attachment: "file_uploaded"})} />
                    </label>
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

    </div>
  );
};

export default Announcements;