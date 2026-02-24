import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useGlobalContext } from "../../context/GlobalContext";
import TrainerNav from "../../components/trainer/TrainerNav";

const AnnouncementsTrainer = () => {
   const { api, BACKEND_URL } = useGlobalContext();
   const [announcements, setAnnouncements] = useState([]);
   const [loading, setLoading] = useState(true);
   const [filterPriority, setFilterPriority] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");
   
   const user = JSON.parse(localStorage.getItem("userInfo"));

   // Color palette
   const paletteColors = {
      white: "#FFFFFF",
      mattBlack: "#000000",
      lightBlue: "#CDE7FE",
      lime: "#D9F17F",
      softYellow: "#FEEF75",
      gray: "#6B7280"
   };

   // --- STYLE INJECTION ---
   useEffect(() => {
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      return () => {
         if (document.head.contains(linkFA)) {
            document.head.removeChild(linkFA);
         }
      };
   }, []);

   // --- FETCH DATA ---
   const fetchAnnouncements = async () => {
      try {
         setLoading(true);
         const res = await api.get("/announcements/feed");
         setAnnouncements(res.data || []);
         toast.success("Announcements loaded");
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
   const getPriorityColor = (priority) => {
      switch(priority) {
         case "Critical":
            return { bg: paletteColors.mattBlack, color: paletteColors.white, border: paletteColors.mattBlack };
         case "Important":
            return { bg: paletteColors.softYellow, color: paletteColors.mattBlack, border: paletteColors.softYellow };
         case "Normal":
            return { bg: paletteColors.lime, color: paletteColors.mattBlack, border: paletteColors.lime };
         default:
            return { bg: paletteColors.lightBlue, color: paletteColors.mattBlack, border: paletteColors.lightBlue };
      }
   };

   const getPriorityIcon = (priority) => {
      switch(priority) {
         case "Critical": return "fa-exclamation-circle";
         case "Important": return "fa-exclamation-triangle";
         default: return "fa-info-circle";
      }
   };

   // --- FILTER LOGIC ---
   const filteredAnnouncements = announcements.filter(ann => {
      const matchPriority = filterPriority === "All" || ann.priority === filterPriority;
      const matchSearch = ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ann.message?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPriority && matchSearch;
   });

   return (
      <div style={{ backgroundColor: paletteColors.white, minHeight: "100vh" }}>
         
         
         <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: paletteColors.lime }}>
                     <i className="fa-solid fa-megaphone text-lg" style={{ color: paletteColors.mattBlack }}></i>
                  </div>
                  <div>
                     <h1 className="text-3xl font-black" style={{ color: paletteColors.mattBlack }}>
                        Announcements
                     </h1>
                     <p className="text-sm" style={{ color: paletteColors.gray }}>
                        Stay updated with important notices and schedule changes
                     </p>
                  </div>
               </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 p-4 rounded-xl  flex flex-col md:flex-row gap-4" style={{ backgroundColor: paletteColors.white,}}>
               {/* Search Input */}
               <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border-2" style={{ borderColor: paletteColors.lightBlue }}>
                  <i className="fa-solid fa-search" style={{ color: paletteColors.gray }}></i>
                  <input
                     type="text"
                     placeholder="Search announcements..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="bg-transparent outline-none flex-1 text-sm"
                     style={{ color: paletteColors.mattBlack }}
                  />
               </div>

               {/* Priority Filter */}
               <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: paletteColors.gray }}>Priority:</span>
                  <select
                     value={filterPriority}
                     onChange={(e) => setFilterPriority(e.target.value)}
                     className="px-3 py-2 rounded-lg text-xs font-bold uppercase border-2 outline-none"
                     style={{
                        backgroundColor: paletteColors.white,
                        borderColor: paletteColors.lightBlue,
                        color: paletteColors.mattBlack
                     }}
                  >
                     <option value="All">All</option>
                     <option value="Critical">Critical</option>
                     <option value="Important">Important</option>
                     <option value="Normal">Normal</option>
                  </select>
               </div>
            </div>

            {/* Announcements List */}
            {loading ? (
               <div className="flex justify-center py-20">
                  <i className="fa-solid fa-spinner fa-spin text-4xl" style={{ color: paletteColors.lime }}></i>
               </div>
            ) : filteredAnnouncements.length > 0 ? (
               <div className="space-y-4">
                  {filteredAnnouncements.map((announcement, idx) => {
                     const priorityStyle = getPriorityColor(announcement.priority);
                     return (
                        <div
                           key={announcement._id || idx}
                           className="border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group"
                           style={{
                              backgroundColor: paletteColors.white,
                              borderColor: paletteColors.lightBlue,
                              borderLeftWidth: "4px",
                              borderLeftColor: priorityStyle.bg
                           }}
                        >
                           <div className="flex items-start gap-4">
                              {/* Priority Icon */}
                              <div
                                 className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                                 style={{
                                    backgroundColor: priorityStyle.bg
                                 }}
                              >
                                 <i className={`fa-solid ${getPriorityIcon(announcement.priority)} text-lg`} style={{ color: priorityStyle.color }}></i>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="text-lg font-black" style={{ color: paletteColors.mattBlack }}>
                                       {announcement.title}
                                    </h3>
                                    <span
                                       className="px-3 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap"
                                       style={{
                                          backgroundColor: priorityStyle.bg,
                                          color: priorityStyle.color
                                       }}
                                    >
                                       {announcement.priority}
                                    </span>
                                 </div>

                                 <p className="text-sm leading-relaxed mb-4" style={{ color: paletteColors.mattBlack }}>
                                    {announcement.message}
                                 </p>

                                 {/* Footer with Date and Tags */}
                                 <div className="flex flex-wrap items-center gap-3 text-xs">
                                    {/* Date Badge */}
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: paletteColors.lightBlue, color: paletteColors.mattBlack }}>
                                       <i className="fa-solid fa-calendar"></i>
                                       <span>{new Date(announcement.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>

                                    {/* Time Badge */}
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: paletteColors.lime, color: paletteColors.mattBlack }}>
                                       <i className="fa-solid fa-clock"></i>
                                       <span>{new Date(announcement.publishDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {/* Audience Badge */}
                                    {announcement.audience === "Trainers Only" && (
                                       <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: paletteColors.softYellow, color: paletteColors.mattBlack }}>
                                          <i className="fa-solid fa-lock"></i>
                                          <span>Trainers Only</span>
                                       </div>
                                    )}

                                    {/* Expiry Badge */}
                                    {announcement.expiryDate && (
                                       <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: paletteColors.mattBlack, color: paletteColors.white }}>
                                          <i className="fa-solid fa-hourglass-end"></i>
                                          <span>Expires: {new Date(announcement.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               <div className="text-center py-20 border-2 rounded-xl" style={{ borderColor: paletteColors.lightBlue, borderStyle: "dashed" }}>
                  <i className="fa-solid fa-inbox text-5xl mb-4" style={{ color: paletteColors.lightBlue }}></i>
                  <p className="text-lg font-bold mb-2" style={{ color: paletteColors.mattBlack }}>
                     No Announcements
                  </p>
                  <p style={{ color: paletteColors.gray }}>
                     {searchQuery || filterPriority !== "All" ? "No announcements match your filters" : "No announcements available at the moment"}
                  </p>
               </div>
            )}

           
         </div>
      </div>
   );
};

export default AnnouncementsTrainer;