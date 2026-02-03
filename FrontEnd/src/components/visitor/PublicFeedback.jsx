import React, { useEffect, useState } from 'react';
import { useGlobalContext } from "../../context/GlobalContext";
import { motion, AnimatePresence } from 'framer-motion';

const PublicFeedback = () => {
  const { BACKEND_URL } = useGlobalContext();
  const [homeData, setHomeData] = useState({
    testimonials: []
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/public/home-data`);
        if (res.ok) {
          const data = await res.json();
          // Fallback data if testimonials array is empty or small
          const testimonials = data.testimonials?.length >= 3 ? data.testimonials : [
            { name: "Sarah J.", role: "Member", review: "The community here is unmatched. I've never felt more motivated!", rating: 5 },
            { name: "Mike Ross", role: "Athlete", review: "Top tier equipment and the cleanest facility I have ever trained in.", rating: 5 },
            { name: "Elena G.", role: "Yoga Specialist", review: "Songar's Gym changed my perspective on fitness. Truly world-class.", rating: 5 }
          ];
          setHomeData({ ...data, testimonials });
        }
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [BACKEND_URL]);

  // Navigation Logic
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % homeData.testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + homeData.testimonials.length) % homeData.testimonials.length);
  };

  // Helper to identify the three cards to display
  const getVisibleCards = () => {
    const len = homeData.testimonials.length;
    if (len === 0) return [];
    
    const prev = (currentIndex - 1 + len) % len;
    const next = (currentIndex + 1) % len;

    return [
      { ...homeData.testimonials[prev], position: 'left' },
      { ...homeData.testimonials[currentIndex], position: 'center' },
      { ...homeData.testimonials[next], position: 'right' }
    ];
  };

  if (loading) return <div className="py-20 text-center">Loading Stories...</div>;

  return (
    <section className="overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Community Stories</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Real results from our dedicated members. Join the movement today.</p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center h-[500px]">
          
          {/* Navigation Controls */}
          <div className="absolute inset-0 flex items-center justify-between z-40 px-2 md:px-10 pointer-events-none">
            <button 
              onClick={prevSlide} 
              className="w-12 h-12 rounded-full bg-white shadow-xl pointer-events-auto hover:bg-[#D9F17F] transition-all flex items-center justify-center border border-gray-100 group"
            >
              <i className="fa-solid fa-chevron-left text-gray-800 group-hover:scale-125 transition-transform"></i>
            </button>
            <button 
              onClick={nextSlide} 
              className="w-12 h-12 rounded-full bg-white shadow-xl pointer-events-auto hover:bg-[#D9F17F] transition-all flex items-center justify-center border border-gray-100 group"
            >
              <i className="fa-solid fa-chevron-right text-gray-800 group-hover:scale-125 transition-transform"></i>
            </button>
          </div>

          {/* Animated Feedback Cards */}
          <div className="relative w-full max-w-6xl flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {getVisibleCards().map((item, idx) => {
                const isCenter = item.position === 'center';
                const isLeft = item.position === 'left';
                const isRight = item.position === 'right';

                return (
                  <motion.div
                    key={`${item.name}-${item.position}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      x: isLeft ? -350 : (isRight ? 350 : 0),
                      scale: isCenter ? 1.1 : 0.85,
                      filter: isCenter ? 'blur(0px)' : 'blur(2px)',
                      zIndex: isCenter ? 30 : 10,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 180, damping: 20 }}
                    className={`absolute w-full max-w-[380px] bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 
                      ${isCenter ? 'ring-8 ring-[#D9F17F]/10' : 'opacity-40'}
                      hidden md:block 
                    `}
                    style={{ display: isCenter ? 'block' : undefined }} // Ensure center card shows on mobile
                  >
                    <div className="relative">
                      <i className="fa-solid fa-quote-left text-5xl text-[#D9F17F]/20 absolute -top-4 -left-4"></i>
                      
                      <div className="flex gap-1 mb-6 relative z-10">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fa-solid fa-star text-sm ${i < item.rating ? 'text-[#FEEF75]' : 'text-gray-200'}`}></i>
                        ))}
                      </div>

                      <p className="text-gray-700 text-sm italic leading-relaxed  relative z-10">
                        "{item.review}"
                      </p>

                      <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-black/10">
                          {item.image ? (
                            <img src={`${BACKEND_URL}/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            item.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                          <p className="text-[10px] text-[#D9F17F] font-bold uppercase tracking-widest">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {homeData.testimonials.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${currentIndex === i ? 'w-8 bg-gray-900' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicFeedback;