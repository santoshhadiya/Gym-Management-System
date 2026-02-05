import React, { useState, useEffect } from 'react';
import { useGlobalContext } from "../../context/GlobalContext";
import { ToastContainer, toast } from 'react-toastify';

const GalleryMember = () => {
  const { api, user } = useGlobalContext(); 
  const { BACKEND_URL, loadingIMG } = useGlobalContext();
  const baseURL = BACKEND_URL; 

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
      
      setMedia(prev => prev.map(item => 
        item._id === id ? updatedMediaItem : item
      ));

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
    const separator = baseURL.endsWith('/') ? '' : '/';
    return `${baseURL}${separator}${url}`;
  };

  const checkIsLiked = (mediaItem) => {
      if (!user || !mediaItem.likes) return false;
      return mediaItem.likes.some(like => like._id === user._id);
  };

  const uniqueCategories = ["All", ...new Set(media.map(m => m.category))];
  const filteredMedia = filter === "All" ? media : media.filter(m => m.category === filter);

  return (
    <div className="font-sans text-gray-800 pt-6 min-h-screen pb-20 bg-gray-50/50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* --- ANIMATION STYLES --- */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .anim-item { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .anim-modal { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* HEADER */}
      <div className="container mx-auto px-4 sm:px-6 mb-8 md:mb-12 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Member Gallery</h1>
        <p className="text-base text-gray-500 max-w-2xl">Exclusive access to gym events, transformation stories, and workout clips.</p>
      </div>

      {/* FILTERS */}
      <div className="container mx-auto px-4 sm:px-6 mb-8 md:mb-10">
        {media.length > 0 && (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 transform active:scale-95 ${
                  filter === cat 
                  ? "bg-black text-white shadow-lg shadow-gray-200" 
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="container mx-auto px-4 sm:px-6">
        {isLoading ? (
         <div className="fixed inset-0 flex items-center justify-center h-screen bg-white/80 backdrop-blur-sm z-50">
            <img src={loadingIMG} className='h-20 w-25 animate-pulse'/>
         </div>
         ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((item, index) => {
                const isLiked = checkIsLiked(item);
                return (
                  <div 
                    key={item._id} 
                    className="anim-item group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-gray-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedMedia(item)}
                  >
                    {/* MEDIA */}
                    {item.type === 'video' ? (
                       <div className="w-full h-full relative flex items-center justify-center bg-gray-900 group-hover:scale-105 transition-transform duration-700">
                          <video src={getFullUrl(item.url)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-play text-sm ml-1"></i>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <img src={getFullUrl(item.url)} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    
                    {/* BADGES */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    {/* OVERLAY */}
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                       <div className="text-white flex-1 min-w-0 mr-4">
                          <h3 className="font-bold text-sm truncate leading-snug">{item.caption}</h3>
                          <p className="text-[10px] text-gray-300 mt-0.5">Click to view</p>
                       </div>
                       
                       {/* TOGGLE LIKE BUTTON */}
                       <button 
                          onClick={(e) => handleLike(e, item._id)}
                          className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform"
                       >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/20'}`}>
                             <i className={`fa-solid fa-heart text-xs ${isLiked ? 'animate-pulse' : ''}`}></i>
                          </div>
                          <span className="text-[10px] font-bold text-white drop-shadow-md">{item.likes?.length || 0}</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedMedia(null)}
        >
          <button className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="anim-modal relative max-w-6xl w-full max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl bg-black flex flex-col border border-gray-800" onClick={e => e.stopPropagation()}>
             {/* Media */}
             <div className="flex-grow relative flex items-center justify-center bg-black overflow-hidden group">
                {selectedMedia.type === 'video' ? (
                   <video src={getFullUrl(selectedMedia.url)} controls autoPlay className="w-full h-full max-h-[80vh] object-contain" />
                ) : (
                   <img src={getFullUrl(selectedMedia.url)} alt={selectedMedia.caption} className="w-full h-full max-h-[80vh] object-contain" />
                )}
             </div>
             
             {/* Footer */}
             <div className="w-full p-6 bg-[#111] text-white border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="min-w-0 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{selectedMedia.category}</span>
                   </div>
                   <h3 className="text-lg font-bold">{selectedMedia.caption}</h3>
                </div>
                
                <button 
                   onClick={(e) => handleLike(e, selectedMedia._id)}
                   className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full transition-all font-bold text-sm ${checkIsLiked(selectedMedia) ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                   <i className={`fa-solid fa-heart ${checkIsLiked(selectedMedia) ? 'animate-bounce' : ''}`}></i>
                   <span>{selectedMedia.likes?.length || 0} Likes</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryMember;