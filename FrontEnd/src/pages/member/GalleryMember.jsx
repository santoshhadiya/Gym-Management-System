import React, { useState, useEffect } from 'react';
import { useGlobalContext } from "../../context/GlobalContext";
import { ToastContainer, toast } from 'react-toastify';

const GalleryMember = () => {
  const { api, user } = useGlobalContext(); // Assuming 'user' object is available in context
  const baseURL = "http://localhost:5000/"; 

  // --- STATE ---
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- INJECT STYLES ---
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(linkToast);
    };
  }, []);

  // --- FETCH DATA ---
  const fetchMedia = async () => {
    try {
      const res = await api.get("/media");
      const memberItems = res.data.filter(
        item => (item.visibility === "Public" || item.visibility === "Members Only") && item.status === "Approved"
      );
      setMedia(memberItems);
    } catch (err) {
      console.error("Failed to load gallery", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [api]);

  // --- ACTIONS ---
  const handleLike = async (e, id) => {
    e.stopPropagation(); 
    try {
      const res = await api.put(`/media/${id}/like`);
      const updatedMediaItem = res.data;
      
      // Update local state with the new media object from backend (which has updated likes array)
      setMedia(prev => prev.map(item => 
        item._id === id ? updatedMediaItem : item
      ));

      // Also update selectedMedia if it's open
      if (selectedMedia && selectedMedia._id === id) {
         setSelectedMedia(updatedMediaItem);
      }
      
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  // --- HELPERS ---
  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${baseURL}${url}`;
  };

  // Check if current user liked the media
  const checkIsLiked = (mediaItem) => {
      if (!user || !mediaItem.likes) return false;
      // Media.likes is an array of populated objects, so we check _id
      return mediaItem.likes.some(like => like._id === user._id);
  };

  const uniqueCategories = ["All", ...new Set(media.map(m => m.category))];
  const filteredMedia = filter === "All" ? media : media.filter(m => m.category === filter);

  return (
    <div className="font-sans text-gray-800  pt-6 min-h-screen pb-20">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER */}
      {/* Changed: Adjusted padding and margin for mobile */}
      <div className="container mx-auto px-4 sm:px-6 mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Member Gallery</h1>
        <p className="text-sm md:text-base text-gray-500">Exclusive access to gym events, transformation stories, and workout clips.</p>
      </div>

      {/* FILTERS */}
      {/* Changed: Adjusted padding */}
      <div className="container mx-auto px-4 sm:px-6 mb-6 md:mb-8">
        {media.length > 0 && (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  filter === cat 
                  ? "bg-[#CDE7FE] text-blue-900 border-blue-200 shadow-sm" 
                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GRID */}
      {/* Changed: Adjusted padding and grid gap */}
      <div className="container mx-auto px-4 sm:px-6">
        {isLoading ? (
           <div className="flex justify-center py-20">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gray-300"></i>
           </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredMedia.map((item) => {
                const isLiked = checkIsLiked(item);
                return (
                  <div 
                    key={item._id} 
                    className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {/* MEDIA */}
                    {item.type === 'video' ? (
                       <div className="w-full h-full relative flex items-center justify-center bg-gray-900">
                          <video src={getFullUrl(item.url)} className="w-full h-full object-cover opacity-80" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                <i className="fa-solid fa-play text-sm ml-0.5"></i>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <img src={getFullUrl(item.url)} alt={item.caption} className="w-full h-full object-cover" />
                    )}
                    
                    {/* BADGES */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-800 shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    {/* OVERLAY */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between">
                       <div className="text-white flex-1 min-w-0 mr-2">
                          <h3 className="font-bold text-sm truncate">{item.caption}</h3>
                          
                       </div>
                       
                       {/* TOGGLE LIKE BUTTON */}
                       <button 
                          onClick={(e) => handleLike(e, item._id)}
                          className="flex flex-col items-center justify-center gap-0.5 group/btn"
                       >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'}`}>
                             <i className={`fa-solid fa-heart text-xs ${isLiked ? 'animate-pulse' : ''}`}></i>
                          </div>
                          <span className="text-[10px] font-bold text-white shadow-sm">{item.likes?.length || 0}</span>
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-black flex flex-col" onClick={e => e.stopPropagation()}>
             {/* Media */}
             <div className="flex-grow relative flex items-center justify-center bg-black overflow-hidden">
                {selectedMedia.type === 'video' ? (
                   <video src={getFullUrl(selectedMedia.url)} controls autoPlay className="w-full h-full max-h-[80vh] object-contain" />
                ) : (
                   <img src={getFullUrl(selectedMedia.url)} alt={selectedMedia.caption} className="w-full h-full max-h-[80vh] object-contain" />
                )}
             </div>
             
             {/* Footer */}
             {/* Changed: Adjusted padding and added gap for mobile layout */}
             <div className="w-full p-4 md:p-6 bg-[#1a1a1a] text-white border-t border-gray-800 flex justify-between items-center gap-4">
                <div className="min-w-0">
                   <h3 className="text-base md:text-lg font-bold truncate">{selectedMedia.caption}</h3>
                   <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="text-[#CDE7FE] font-bold uppercase tracking-wider">{selectedMedia.category}</span>
                   </div>
                </div>
                
                <button 
                   onClick={(e) => handleLike(e, selectedMedia._id)}
                   className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${checkIsLiked(selectedMedia) ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                >
                   <i className="fa-solid fa-heart"></i>
                   <span className="font-bold">{selectedMedia.likes?.length || 0}</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryMember;