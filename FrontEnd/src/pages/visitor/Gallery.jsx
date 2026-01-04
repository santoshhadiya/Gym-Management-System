import React, { useState, useEffect } from 'react';

const Gallery = () => {
  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  // Mock Image Data with Categories
  const images = [
    { id: 1, category: "Interior", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop", title: "Main Workout Floor" },
    { id: 2, category: "Interior", url: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop", title: "Cardio Section" },
    { id: 3, category: "Events", url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop", title: "Summer Workshop" },
    { id: 4, category: "Transformations", url: "https://images.unsplash.com/photo-1583454110550-0ec6bf8a75f1?q=80&w=1470&auto=format&fit=crop", title: "Member Progress" },
    { id: 5, category: "Interior", url: "https://images.unsplash.com/photo-1594737625785-cd4475f8fc0e?q=80&w=1470&auto=format&fit=crop", title: "Free Weights Area" },
    { id: 6, category: "Events", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop", title: "CrossFit Competition" },
    { id: 7, category: "Transformations", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop", title: "Before & After" },
    { id: 8, category: "Interior", url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop", title: "Yoga Studio" },
    { id: 9, category: "Events", url: "https://images.unsplash.com/photo-1552674605-469523f54050?q=80&w=1470&auto=format&fit=crop", title: "Community Run" },
  ];

  const filteredImages = filter === "All" ? images : images.filter(img => img.category === filter);

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      
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
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["All", "Interior", "Events", "Transformations"].map((cat) => (
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

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className="group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                <img 
                  src={image.url} 
                  alt={image.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FEEF75] text-yellow-900 text-[10px] font-bold uppercase tracking-wider mb-2 w-fit">
                    {image.category}
                  </span>
                  <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {image.title}
                  </h3>
                </div>
                
                {/* Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                   <i className="fa-solid fa-expand"></i>
                </div>
              </div>
            ))}
          </div>
          
          {filteredImages.length === 0 && (
             <div className="text-center py-20 text-gray-400">
                <i className="fa-regular fa-images text-4xl mb-4 opacity-50"></i>
                <p>No images found in this category.</p>
             </div>
          )}
        </div>
      </section>

      {/* 3. LIGHTBOX MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
            onClick={() => setSelectedImage(null)}
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div 
            className="relative max-w-5xl w-full max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title} 
              className="w-full h-full object-contain bg-black"
            />
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
               <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
               <p className="text-gray-300 text-sm">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;