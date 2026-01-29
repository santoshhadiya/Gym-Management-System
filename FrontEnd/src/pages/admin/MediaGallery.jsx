import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

const MediaGallery = () => {
  const { api } = useGlobalContext();
  const baseURL = "http://localhost:5000/";

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
  const categories = ["Transformations", "Gym Events", "Equipment", "Workout Sessions"];
  const visibilities = ["Public", "Members Only", "Admin Only"];

  const getCategoryColor = (cat) => {
    switch(cat) {
      case "Transformations": return "bg-[#D9F17F] text-green-900";
      case "Gym Events": return "bg-[#FEEF75] text-yellow-900";
      case "Equipment": return "bg-[#CDE7FE] text-blue-900";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${baseURL}${url}`;
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
    setSelectedMediaLikes(media.likes || []); // Pass the array of users
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
        toast.info("Media deleted.");
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
      toast.info(`Status: ${newStatus}`);
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
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage gym assets and track engagement.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload Media
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center">
         <div className="relative flex-grow md:max-w-xs">
            <input
               type="text"
               placeholder="Search..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
         </div>
         
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <select 
               value={filterCategory} 
               onChange={(e) => setFilterCategory(e.target.value)}
               className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
            >
               <option value="All">All Categories</option>
               {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select 
               value={filterVisibility} 
               onChange={(e) => setFilterVisibility(e.target.value)}
               className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
            >
               <option value="All">All Visibility</option>
               {visibilities.map(vis => <option key={vis} value={vis}>{vis}</option>)}
            </select>
         </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gray-300"></i>
        </div>
      ) : (
        /* GALLERY GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((media) => (
            <div key={media._id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
              
              {/* Media Preview */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
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
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm ${getCategoryColor(media.category)}`}>
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
                    
                    {/* View Likes Button */}
                    <button onClick={() => handleOpenLikes(media)} className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors" title="View Likes">
                       <i className="fa-solid fa-heart text-xs"></i>
                    </button>
                 </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                 <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1" title={media.caption}>{media.caption}</h3>
                 <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                       <span><i className="fa-regular fa-eye"></i> {media.views || 0}</span>
                       <span className="text-pink-500 font-bold"><i className="fa-solid fa-heart"></i> {media.likes?.length || 0}</span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
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
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{isEditing ? "Edit Media" : "Upload Media"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  {!isEditing && (
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Select File</label>
                       <input 
                          type="file" 
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#CDE7FE] file:text-blue-900 hover:file:bg-blue-200 cursor-pointer"
                       />
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Caption</label>
                     <input 
                        type="text" 
                        required
                        value={formData.caption}
                        onChange={(e) => setFormData({...formData, caption: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                     />
                  </div>

                  {/* Cat & Vis */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                        <select 
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white"
                        >
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Visibility</label>
                        <select 
                           value={formData.visibility}
                           onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white"
                        >
                           {visibilities.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                     </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm mt-4">
                     {isEditing ? "Update" : "Upload"}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* --- LIKES VIEW MODAL (NEW) --- */}
      {showLikesModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Liked By ({selectedMediaLikes.length})</h3>
                  <button onClick={() => setShowLikesModal(false)} className="text-gray-400 hover:text-gray-600">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <div className="p-4 overflow-y-auto">
                  {selectedMediaLikes.length > 0 ? (
                     <div className="space-y-3">
                        {selectedMediaLikes.map((user) => (
                           <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                              <img 
                                 src={user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                 alt={user.name} 
                                 className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                 <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-8 text-gray-400">
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