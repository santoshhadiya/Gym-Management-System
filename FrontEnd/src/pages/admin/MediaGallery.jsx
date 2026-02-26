import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

const MediaGallery = () => {
  const { api,BACKEND_URL } = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme
 
  const baseURL = BACKEND_URL;

  // --- STATE ---
  const [mediaList, setMediaList] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVisibility, setFilterVisibility] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit/Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Likes Modal State
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [selectedMediaLikes, setSelectedMediaLikes] = useState([]);
  
  // Form & File State
  const [formData, setFormData] = useState({
    id: null, caption: "", category: "Gym Events", visibility: "Public", type: "image"
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/media");
      setMediaList(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load media gallery.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // --- HELPERS ---
  const categories = ["General","Transformations", "Gym Events", "Equipment", "Workot Sessions"];
  const visibilities = ["Public", "Members Only", "Admin Only"];

  const getCategoryColor = (cat) => {
    switch(cat) {
      case "Transformations": return { backgroundColor: colors.primary, color: '#111827' };
      case "Gym Events": return { backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' };
      case "Equipment": return { backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#1e3a8a' };
      default: return { backgroundColor: colors.border, color: colors.textMuted };
    }
  };
const getFullUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // Ensure there is exactly one slash between baseURL and url
  const separator = baseURL.endsWith('/') ? '' : '/';
  return `${baseURL}${separator}${url}`;
};

  // --- ACTIONS ---
  const handleOpenModal = (media = null) => {
    if (media) {
      setFormData({ 
        id: media._id, 
        caption: media.caption, 
        category: media.category, 
        visibility: media.visibility, 
        type: media.type 
      });
      setPreviewUrl(getFullUrl(media.url));
      setSelectedFile(null);
      setIsEditing(true);
    } else {
      setFormData({
        id: null, caption: "", category: "Gym Events", visibility: "Public", type: "image"
      });
      setPreviewUrl("");
      setSelectedFile(null);
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleOpenLikes = (media) => {
    setSelectedMediaLikes(media.likes || []); 
    setShowLikesModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (file.type.startsWith("video")) {
        setFormData({ ...formData, type: "video" });
      } else {
        setFormData({ ...formData, type: "image" });
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/media/${formData.id}`, {
          caption: formData.caption,
          category: formData.category,
          visibility: formData.visibility
        });
        toast.success("Media updated.");
      } else {
        if (!selectedFile) {
           toast.error("Please select a file.");
           return;
        }
        const data = new FormData();
        data.append("file", selectedFile);
        data.append("caption", formData.caption);
        data.append("category", formData.category);
        data.append("visibility", formData.visibility);
        data.append("type", formData.type);

        await api.post("/media", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Media uploaded.");
      }
      setShowModal(false);
      fetchMedia(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this media?")) {
      try {
        await api.delete(`/media/${id}`);
        toast.success("Media deleted.");
        fetchMedia();
      } catch (error) {
        toast.error("Failed to delete.");
      }
    }
  };

  const toggleApproval = async (media) => {
    try {
      const newStatus = media.status === "Approved" ? "Pending" : "Approved";
      await api.put(`/media/${media._id}`, { status: newStatus });
      toast.success(`Status: ${newStatus}`);
      fetchMedia();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  // --- FILTERING ---
  const filteredMedia = mediaList.filter(m => {
    const matchesSearch = m.caption.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || m.category === filterCategory;
    const matchesVisibility = filterVisibility === "All" || m.visibility === filterVisibility;
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  return (
    <div 
      className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
      style={{  color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Media Gallery</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Manage gym assets and track engagement.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: '#111827' }}
        >
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload Media
        </button>
      </div>

      {/* FILTERS */}
      <div 
        className="flex flex-wrap gap-3 mb-8 p-2 rounded-2xl border items-center transition-colors"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
         <div className="relative flex-grow md:max-w-xs">
            <input
               type="text"
               placeholder="Search..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
               style={{ 
                 backgroundColor: colors.background, 
                 borderColor: colors.border, 
                 color: colors.text,
                 '--tw-ring-color': colors.secondary 
               }}
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
         </div>
         
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <select 
               value={filterCategory} 
               onChange={(e) => setFilterCategory(e.target.value)}
               className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 cursor-pointer transition-colors"
               style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border, '--tw-ring-color': colors.secondary }}
            >
               <option value="All">All Categories</option>
               {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select 
               value={filterVisibility} 
               onChange={(e) => setFilterVisibility(e.target.value)}
               className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 cursor-pointer transition-colors"
               style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border, '--tw-ring-color': colors.secondary }}
            >
               <option value="All">All Visibility</option>
               {visibilities.map(vis => <option key={vis} value={vis}>{vis}</option>)}
            </select>
         </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.border }}></i>
        </div>
      ) : (
        /* GALLERY GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((media) => (
            <div 
              key={media._id} 
              className="group border rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              {/* Media Preview */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden" style={{ backgroundColor: colors.background }}>
                 {media.type === "image" ? (
                    <img src={getFullUrl(media.url)} alt={media.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 group-hover:scale-105 transition-transform duration-500">
                       <video src={getFullUrl(media.url)} className="w-full h-full object-cover opacity-80" muted />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fa-solid fa-play-circle text-4xl text-white opacity-80"></i>
                       </div>
                    </div>
                 )}
                 
                 <div className="absolute top-3 left-3 flex gap-2">
                    <span 
                      className="px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                      style={getCategoryColor(media.category)}
                    >
                       {media.category}
                    </span>
                 </div>
                 
                 {/* Hover Actions */}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px] p-4">
                    <button onClick={() => handleOpenModal(media)} className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors" title="Edit">
                       <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onClick={() => handleDelete(media._id)} className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors" title="Delete">
                       <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                    <button onClick={() => toggleApproval(media)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${media.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-white'}`} title="Status">
                       <i className={`fa-solid ${media.status === 'Approved' ? 'fa-check' : 'fa-clock'} text-xs`}></i>
                    </button>
                    <button onClick={() => handleOpenLikes(media)} className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors" title="View Likes">
                       <i className="fa-solid fa-heart text-xs"></i>
                    </button>
                 </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                 <h3 className="font-bold text-sm mb-1 line-clamp-1" title={media.caption} style={{ color: colors.text }}>{media.caption}</h3>
                 <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div className="flex items-center gap-3 text-xs" style={{ color: colors.textMuted }}>
                       <span><i className="fa-regular fa-eye"></i> {media.views || 0}</span>
                       <span className="font-bold" style={{ color: '#ec4899' }}><i className="fa-solid fa-heart"></i> {media.likes?.length || 0}</span>
                    </div>
                    <span 
                      className="text-[10px] font-medium px-2 py-0.5 rounded transition-colors"
                      style={{ backgroundColor: colors.background, color: colors.textMuted }}
                    >
                       {media.visibility}
                    </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- UPLOAD / EDIT MODAL --- */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
              className="rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              style={{ backgroundColor: colors.card }}
            >
               <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                  <h3 className="font-bold" style={{ color: colors.text }}>{isEditing ? "Edit Media" : "Upload Media"}</h3>
                  <button onClick={() => setShowModal(false)} style={{ color: colors.textMuted }}>
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  {!isEditing && (
                    <div>
                       <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Select File</label>
                       <input 
                          type="file" 
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold cursor-pointer transition-colors"
                          style={{ 
                            color: colors.textMuted,
                            '--file-bg': colors.secondary,
                            '--file-text': theme === 'dark' ? '#fff' : '#1e3a8a'
                          }}
                        />
                        <style>{`
                            input[type="file"]::file-selector-button {
                                background-color: ${colors.secondary};
                                color: ${theme === 'dark' ? '#fff' : '#1e3a8a'};
                            }
                            input[type="file"]::file-selector-button:hover {
                                opacity: 0.8;
                            }
                        `}</style>
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                     <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Caption</label>
                     <input 
                        type="text" 
                        required
                        value={formData.caption}
                        onChange={(e) => setFormData({...formData, caption: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-colors text-sm"
                        style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                     />
                  </div>

                  {/* Cat & Vis */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Category</label>
                        <select 
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                           className="w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-colors text-sm"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                        >
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Visibility</label>
                        <select 
                           value={formData.visibility}
                           onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                           className="w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-colors text-sm"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                        >
                           {visibilities.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                     </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 font-bold rounded-xl shadow-sm mt-4 transition-colors"
                    style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                  >
                     {isEditing ? "Update" : "Upload"}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* --- LIKES VIEW MODAL --- */}
      {showLikesModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div 
              className="rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] transition-colors"
              style={{ backgroundColor: colors.card }}
            >
               <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                  <h3 className="font-bold" style={{ color: colors.text }}>Liked By ({selectedMediaLikes.length})</h3>
                  <button onClick={() => setShowLikesModal(false)} style={{ color: colors.textMuted }}>
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <div className="p-4 overflow-y-auto">
                  {selectedMediaLikes.length > 0 ? (
                     <div className="space-y-3">
                        {selectedMediaLikes.map((user) => (
                           <div 
                             key={user._id} 
                             className="flex items-center gap-3 p-2 rounded-xl transition-colors"
                             style={{ backgroundColor: colors.background }}
                           >
                              <img 
                                 src={user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                 alt={user.name} 
                                 className="w-10 h-10 rounded-full object-cover border"
                                 style={{ borderColor: colors.border }}
                              />
                              <div>
                                 <p className="text-sm font-bold" style={{ color: colors.text }}>{user.name}</p>
                                 <p className="text-xs" style={{ color: colors.textMuted }}>{user.email}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-8" style={{ color: colors.textMuted }}>
                        <i className="fa-regular fa-heart text-3xl mb-2 opacity-50"></i>
                        <p className="text-sm">No likes yet.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MediaGallery;