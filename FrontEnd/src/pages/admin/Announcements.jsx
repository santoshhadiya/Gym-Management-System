import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";
import { useGlobalContext } from "../../context/GlobalContext";

const Announcements = () => {
   const { BACKEND_URL } = useGlobalContext();
   const { colors, theme } = useTheme();
   const [announcements, setAnnouncements] = useState([]);
   const [loading, setLoading] = useState(true);

   const [viewState, setViewState] = useState("list");
   const [filterAudience, setFilterAudience] = useState("All");
   const [isEditing, setIsEditing] = useState(false);

   // Helper to get today's date string (YYYY-MM-DD)
   const getTodayString = () => new Date().toISOString().split('T')[0];

   const [formData, setFormData] = useState({
      _id: null,
      title: "",
      message: "",
      audience: "All Users",
      priority: "Normal", // Defaulting to Normal since field is removed
      publishDate: "",
      expiryDate: "",
      attachment: null,
      notify: false
   });

   const user = JSON.parse(localStorage.getItem("userInfo"));

   // --- STYLE INJECTION ---
   useEffect(() => {
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
         const res = await fetch(`${BACKEND_URL}/api/announcements`, {
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

   // --- ACTIONS ---
   const handleCreate = () => {
      setFormData({
         _id: null, 
         title: "", 
         message: "", 
         audience: "All Users", 
         priority: "Normal", // Default priority
         publishDate: getTodayString(), // Default publish date to Today
         expiryDate: "", 
         attachment: null, 
         notify: false
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

         toast.success("Announcement deleted");
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
      switch (p) {
         case "Critical": return "bg-red-100 text-red-700 border-red-200";
         case "Important": return "bg-orange-100 text-orange-700 border-orange-200";
         default: return `border-${colors.secondary} text-${colors.text}`;
      }
   };

   const filteredList = filterAudience === "All"
      ? announcements
      : announcements.filter(a => a.audience === filterAudience || a.audience === "All Users");

   return (
      <div
         className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
         style={{ color: colors.text }}
      >
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Announcements</h1>
               <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Broadcast updates, news, and alerts.</p>
            </div>

            {viewState === 'list' && (
               <button
                  onClick={handleCreate}
                  className="px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: colors.primary, color: '#111827' }}
               >
                  <i className="fa-solid fa-bullhorn"></i> New Announcement
               </button>
            )}
         </div>

         {loading ? (
            <div className="flex justify-center py-20">
               <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.border }}></i>
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
                              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all`}
                              style={{
                                 backgroundColor: filterAudience === filter ? colors.text : colors.card,
                                 color: filterAudience === filter ? colors.background : colors.textMuted,
                                 border: `1px solid ${colors.border}`
                              }}
                           >
                              {filter}
                           </button>
                        ))}
                     </div>

                     {/* LIST */}
                     <div className="grid grid-cols-1 gap-4">
                        {filteredList.length > 0 ? filteredList.map(item => (
                           <div
                              key={item.id || item._id}
                              className="rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden border"
                              style={{ backgroundColor: colors.card, borderColor: colors.border }}
                           >
                              <div
                                 className="absolute top-0 left-0 w-1 h-full"
                                 style={{ backgroundColor: item.priority === 'Critical' ? '#ef4444' : item.priority === 'Important' ? '#fb923c' : colors.secondary }}
                              ></div>

                              <div className="flex flex-col md:flex-row justify-between items-start gap-4 pl-4">
                                 <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                       <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(item.priority)}`}
                                          style={item.priority === 'Normal' ? { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text } : {}}
                                       >
                                          {item.priority}
                                       </span>
                                       <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
                                          <i className="fa-solid fa-users mr-1"></i> {item.audience}
                                       </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>{item.title}</h3>
                                    <p className="text-sm leading-relaxed mb-3" style={{ color: colors.textMuted }}>{item.message}</p>

                                    <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
                                       <span><i className="fa-regular fa-clock mr-1"></i> Posted: {item.publishDate}</span>
                                       {item.expiryDate && <span><i className="fa-solid fa-hourglass-end mr-1"></i> Expires: {item.expiryDate}</span>}
                                    </div>
                                 </div>

                                 <div className="flex gap-2 self-start md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                       onClick={() => handleEdit(item)}
                                       className="p-2 rounded-lg transition-colors"
                                       style={{ backgroundColor: colors.background, color: colors.secondary }}
                                    >
                                       <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button
                                       onClick={() => handleDelete(item.id || item._id)}
                                       className="p-2 rounded-lg text-red-600 transition-colors"
                                       style={{ backgroundColor: colors.background }}
                                    >
                                       <i className="fa-solid fa-trash"></i>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )) : (
                           <div
                              className="text-center py-16 rounded-[2rem] border border-dashed"
                              style={{ backgroundColor: colors.card, borderColor: colors.border }}
                           >
                              <p style={{ color: colors.textMuted }}>No announcements found.</p>
                           </div>
                        )}
                     </div>
                  </>
               ) : (
                  // --- FORM VIEW ---
                  <div
                     className="max-w-2xl mx-auto p-8 rounded-[2rem] border transition-colors"
                     style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  >
                     <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>{isEditing ? "Edit Announcement" : "Create New Announcement"}</h3>

                     <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Title</label>
                              <input
                                 required
                                 type="text"
                                 value={formData.title}
                                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                 className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-sm"
                                 style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                                 placeholder="e.g. Holiday Closure"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Audience</label>
                              <select
                                 value={formData.audience}
                                 onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                 className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-sm"
                                 style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                              >
                                 <option>All Users</option>
                                 <option>Members Only</option>
                                 <option>Trainers Only</option>
                              </select>
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Message</label>
                           <textarea
                              required
                              rows="4"
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-sm resize-none"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                              placeholder="Type your announcement details here..."
                           ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              {/* Expiry Date: Updated to restrict to Today or Future */}
                              <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Expiry Date (Optional)</label>
                              <input
                                 type="date"
                                 min={getTodayString()} // Prevents selecting past dates
                                 value={formData.expiryDate}
                                 onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                 className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-sm"
                                 style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                              />
                           </div>
                           
                           {/* Priority removed, only Notification Checkbox remains */}
                           <div
                              className="flex items-center gap-3 px-4 rounded-xl border transition-colors"
                              style={{ backgroundColor: colors.background, borderColor: colors.border }}
                           >
                           </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button
                              type="button"
                              onClick={() => setViewState("list")}
                              className="flex-1 py-3 border rounded-xl font-bold transition-colors cursor-pointer"
                              style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.textMuted }}
                           >
                              Cancel
                           </button>
                           <button
                              type="submit"
                              className="flex-1 py-3 rounded-xl font-bold shadow-sm cursor-pointer transition-colors"
                              style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                           >
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