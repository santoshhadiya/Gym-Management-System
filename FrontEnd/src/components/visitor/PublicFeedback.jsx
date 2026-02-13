import React, { useEffect, useState } from 'react';
import { useGlobalContext } from "../../context/GlobalContext";
import { motion, AnimatePresence } from 'framer-motion';

const PublicFeedback = () => {
  const { BACKEND_URL } = useGlobalContext();
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/public/home-data`);
        const data = await res.json();
        const list = data.testimonials?.length >= 3 ? data.testimonials : [
          { name: "Sarah J.", role: "Member", review: "The community here is unmatched. I've never felt more motivated!", rating: 5 },
          { name: "Mike Ross", role: "Athlete", review: "Top tier equipment and the cleanest facility.", rating: 5 },
          { name: "Elena G.", role: "Yoga Specialist", review: "Songar's Gym changed my perspective on fitness.", rating: 5 },
          { name: "David K.", role: "Pro Boxer", review: "Best atmosphere for serious training.", rating: 5 }
        ];
        setTestimonials(list);
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [BACKEND_URL]);

  // Auto-scroll logic: moves the window by 1 every 4 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials]);

  // Helper to get exactly 3 items for the current view
  const getVisibleItems = () => {
    if (testimonials.length === 0) return [];
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return items;
  };

  if (loading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <section className=" bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-2">Community Stories</h2>
          <p className="text-gray-500">Real results from our dedicated members</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((item, idx) => (
              <motion.div
                key={`${item.name}-${currentIndex}-${idx}`} // Unique key triggers animation on index change
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex-1 min-w-[300px] bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-[#FEEF75]">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star text-xs"></i>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-8">"{item.review}"</p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex-shrink-0 overflow-hidden ring-2 ring-[#D9F17F]">
                    {item.image ? (
                      <img src={`${BACKEND_URL}/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white flex items-center justify-center h-full font-bold">{item.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Simple Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === i ? 'w-8 bg-gray-900' : 'w-1.5 bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicFeedback;