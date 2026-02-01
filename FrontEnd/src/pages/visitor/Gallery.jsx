import React, { useState, useEffect } from 'react';
import { useGlobalContext } from "../../context/GlobalContext";

const Gallery = () => {
  const { api,BACKEND_URL } = useGlobalContext();
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

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await api.get("/media");
        // Filter: Only show Public & Approved media
        const publicItems = res.data.filter(
          item => item.visibility === "Public" && item.status === "Approved"
        );
        setMedia(publicItems);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedia();
  }, [api]);

  // --- HELPERS ---
 const getFullUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // Ensure there is exactly one slash between baseURL and url
  const separator = baseURL.endsWith('/') ? '' : '/';
  return `${baseURL}${separator}${url}`;
};;

  // Extract unique categories from data for the filter buttons
  const uniqueCategories = ["All", ...new Set(media.map(m => m.category))];

  const filteredMedia = filter === "All" 
    ? media 
    : media.filter(m => m.category === filter);

  return (
    <div className="font-sans text-gray-800 bg-white pt-20 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9F17F] text-green-900 text-xs font-bold uppercase tracking-wider mb-4">
            Visual Tour
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Inside <span className="text-[#CDE7FE]">Songar's Gym</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Experience the energy, the equipment, and the community through our lens.
          </p>
        </div>
      </section>

      {/* 2. GALLERY GRID & FILTERS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          
          {/* Filters */}
          {media.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    filter === cat 
                    ? "bg-[#CDE7FE] text-blue-900 shadow-md transform scale-105" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
             <div className="flex justify-center py-20">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-gray-300"></i>
             </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia.map((item) => (
                  <div 
                    key={item._id} 
                    className="group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === 'video' ? (
                       <div className="w-full h-full relative flex items-center justify-center bg-gray-900">
                          <video 
                             src={getFullUrl(item.url)} 
                             className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" 
                             muted 
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-all">
                                <i className="fa-solid fa-play text-lg ml-1"></i>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <img 
                          src={getFullUrl(item.url)} 
                          alt={item.caption} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                       />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FEEF75] text-yellow-900 text-[10px] font-bold uppercase tracking-wider mb-2 w-fit">
                        {item.category}
                      </span>
                      <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 line-clamp-2">
                        {item.caption}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Empty State */}
              {!isLoading && filteredMedia.length === 0 && (
                 <div className="text-center py-20 text-gray-400">
                    <i className="fa-regular fa-images text-4xl mb-4 opacity-50"></i>
                    <p>No public media found in this category.</p>
                 </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 3. LIGHTBOX MODAL */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
            onClick={() => setSelectedMedia(null)}
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div 
            className="relative max-w-5xl w-full max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl bg-black flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-grow relative flex items-center justify-center bg-black overflow-hidden">
               {selectedMedia.type === 'video' ? (
                  <video 
                     src={getFullUrl(selectedMedia.url)} 
                     controls 
                     autoPlay 
                     className="w-full h-full max-h-[75vh] object-contain"
                  />
               ) : (
                  <img 
                    src={getFullUrl(selectedMedia.url)} 
                    alt={selectedMedia.caption} 
                    className="w-full h-full max-h-[75vh] object-contain"
                  />
               )}
            </div>

            <div className="w-full p-6 bg-gradient-to-t from-gray-900 to-gray-800 text-white border-t border-gray-800">
               <h3 className="text-xl font-bold">{selectedMedia.caption}</h3>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-[#CDE7FE] text-sm font-bold uppercase tracking-wider">{selectedMedia.category}</span>
                  
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;