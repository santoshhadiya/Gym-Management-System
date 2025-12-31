import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const MediaGallery = () => {
  // --- MOCK DATA ---
  const [mediaList, setMediaList] = useState([
    {
      id: 1,
      type: "image",
      url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
      caption: "Summer Body Transformation Challenge Winners",
      category: "Transformations",
      visibility: "Public",
      date: "2024-07-15",
      views: 1205,
      likes: 340,
      status: "Approved"
    },
    {
      id: 2,
      type: "image",
      url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop",
      caption: "New Cardio Equipment Arrived!",
      category: "Equipment",
      visibility: "Members Only",
      date: "2024-08-01",
      views: 850,
      likes: 120,
      status: "Approved"
    },
    {
      id: 3,
      type: "video",
      url: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder video
      caption: "HIIT Session Highlights",
      category: "Workout Sessions",
      visibility: "Public",
      date: "2024-08-05",
      views: 450,
      likes: 95,
      status: "Pending"
    },
    {
      id: 4,
      type: "image",
      url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop",
      caption: "Annual Powerlifting Meet 2024",
      category: "Gym Events",
      visibility: "Admin Only",
      date: "2024-06-20",
      views: 50,
      likes: 10,
      status: "Approved"
    }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("gallery"); // 'gallery', 'upload'
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVisibility, setFilterVisibility] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    type: "image",
    url: "",
    caption: "",
    category: "Transformations",
    visibility: "Public",
    status: "Approved"
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

  // --- ACTIONS ---
  const handleOpenModal = (media = null) => {
    if (media) {
      setFormData({ ...media });
      setIsEditing(true);
    } else {
      setFormData({
        id: null, type: "image", url: "", caption: "", 
        category: "Transformations", visibility: "Public", status: "Approved"
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.url) {
      toast.error("Please provide a valid Image/Video URL.");
      return;
    }

    const newMedia = {
      ...formData,
      id: formData.id || Date.now(),
      date: isEditing ? formData.date : new Date().toISOString().split('T')[0],
      views: isEditing ? formData.views : 0,
      likes: isEditing ? formData.likes : 0,
    };

    if (isEditing) {
      setMediaList(prev => prev.map(m => m.id === newMedia.id ? newMedia : m));
      toast.success("Media updated successfully.");
    } else {
      setMediaList([newMedia, ...mediaList]);
      toast.success("New media uploaded to gallery.");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this media?")) {
      setMediaList(prev => prev.filter(m => m.id !== id));
      toast.info("Media deleted.");
    }
  };

  const toggleApproval = (id) => {
    setMediaList(prev => prev.map(m => 
      m.id === id ? { ...m, status: m.status === "Approved" ? "Pending" : "Approved" } : m
    ));
    toast.info("Status updated.");
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
          <p className="text-sm text-gray-500 mt-1">Manage gym photos, videos, and digital assets.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload Media
        </button>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex flex-wrap gap-3 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center">
         <div className="relative flex-grow md:max-w-xs">
            <input
               type="text"
               placeholder="Search captions..."
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

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedia.map((media) => (
          <div key={media.id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            
            {/* Media Preview */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
               {media.type === "image" ? (
                  <img src={media.url} alt={media.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 group-hover:scale-105 transition-transform duration-500">
                     <video src={media.url} className="w-full h-full object-cover opacity-80" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fa-solid fa-play-circle text-4xl text-white opacity-80"></i>
                     </div>
                  </div>
               )}
               
               {/* Overlay Badges */}
               <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm ${getCategoryColor(media.category)}`}>
                     {media.category}
                  </span>
               </div>
               
               {/* Hover Actions */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button onClick={() => handleOpenModal(media)} className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer" title="Edit">
                     <i className="fa-solid fa-pen text-xs"></i>
                  </button>
                  <button onClick={() => handleDelete(media.id)} className="w-9 h-9 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Delete">
                     <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                  <button onClick={() => toggleApproval(media.id)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${media.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-white'}`} title={media.status === 'Approved' ? "Approved" : "Pending Approval"}>
                     <i className={`fa-solid ${media.status === 'Approved' ? 'fa-check' : 'fa-clock'} text-xs`}></i>
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
               <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1" title={media.caption}>{media.caption}</h3>
               <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                     <span><i className="fa-regular fa-eye"></i> {media.views}</span>
                     <span><i className="fa-regular fa-heart"></i> {media.likes}</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                     {media.visibility}
                  </span>
               </div>
            </div>
          </div>
        ))}
        {filteredMedia.length === 0 && (
           <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <i className="fa-regular fa-images text-4xl mb-3 opacity-30"></i>
              <p>No media found matching your filters.</p>
           </div>
        )}
      </div>

      {/* --- UPLOAD / EDIT MODAL --- */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{isEditing ? "Edit Media Details" : "Upload New Media"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  
                  {/* URL Input (Simulating File Upload) */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Media URL / Link</label>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           placeholder="https://..." 
                           value={formData.url}
                           onChange={(e) => setFormData({...formData, url: e.target.value})}
                           className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                        />
                        <select 
                           value={formData.type}
                           onChange={(e) => setFormData({...formData, type: e.target.value})}
                           className="w-24 px-2 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 cursor-pointer focus:outline-none"
                        >
                           <option value="image">Image</option>
                           <option value="video">Video</option>
                        </select>
                     </div>
                     <p className="text-[10px] text-gray-400 mt-1">Paste a direct image or video link.</p>
                  </div>

                  {/* Caption */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Caption / Title</label>
                     <input 
                        type="text" 
                        required
                        value={formData.caption}
                        onChange={(e) => setFormData({...formData, caption: e.target.value})}
                        placeholder="e.g. Morning Cardio Session"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                     />
                  </div>

                  {/* Category & Visibility */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                        <select 
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white cursor-pointer"
                        >
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Visibility</label>
                        <select 
                           value={formData.visibility}
                           onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white cursor-pointer"
                        >
                           {visibilities.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                     </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                     <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors cursor-pointer">
                        {isEditing ? "Update Media" : "Upload to Gallery"}
                     </button>
                  </div>

               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default MediaGallery;