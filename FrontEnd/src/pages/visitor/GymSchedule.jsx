import React, { useState, useEffect } from 'react';
import logo from "../../assets/logo.png";
import { useGlobalContext } from '../../context/GlobalContext'; //

const GymSchedule = () => {
  const { api } = useGlobalContext(); //
  const [openingHours, setOpeningHours] = useState([]); // State for dynamic hours
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data } = await api.get('/schedule'); //
        // Sort days to ensure they appear in order (Mon-Sun)
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const sortedData = data.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        setOpeningHours(sortedData);
      } catch (error) {
        console.error("Failed to load schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [api]);

  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#D9F17F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <img src={logo} alt="Songar's Gym Logo" className="h-20 mx-auto mb-8 object-contain" />
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9F17F] text-green-900 text-xs font-bold uppercase tracking-widest mb-4">
            Facility Access
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Opening <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">Hours</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Plan your workout around our operating schedule. We ensure premium access during peak and off-peak hours.
          </p>
        </div>

        {/* Hours Display Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9F17F]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10 space-y-6">
              {openingHours.length > 0 ? (
                openingHours.map((item) => (
                  <div 
                    key={item.day} 
                    className={`flex items-center justify-between pb-4 border-b ${
                      item.day === currentDay ? 'border-[#D9F17F]' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.day === currentDay && (
                        <div className="w-2 h-2 rounded-full bg-[#D9F17F] animate-pulse"></div>
                      )}
                      <span className={`text-lg font-bold ${
                        item.day === currentDay ? 'text-[#D9F17F]' : 'text-white'
                      }`}>
                        {item.day}
                      </span>
                    </div>
                    
                    <span className={`text-lg font-medium ${
                      item.day === currentDay ? 'text-white' : 'text-gray-400'
                    }`}>
                      {item.isClosed ? "Closed" : item.hours} {/* */}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-white text-center opacity-50 italic">Schedule currently unavailable.</p>
              )}
            </div>

            {/* Sunday Recovery Note */}
            <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <p className="text-[#FEEF75] text-sm font-bold flex items-center justify-center gap-2">
                <i className="fa-solid fa-mug-hot"></i>
                Check our official hours for recovery and maintenance windows.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-6">
            Questions about holiday hours?
          </p>
          <button className="px-8 py-4 bg-gray-100 text-gray-900 rounded-full font-bold text-sm hover:bg-[#D9F17F] transition-all">
            Contact Front Desk
          </button>
        </div>

      </div>
    </div>
  );
};

export default GymSchedule;