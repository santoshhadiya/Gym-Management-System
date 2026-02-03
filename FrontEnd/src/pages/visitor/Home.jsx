import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalContext } from "../../context/GlobalContext";
import PublicFeedback from '../../components/visitor/PublicFeedback';
import PublicFeature from '../../components/visitor/PublicFeature';
import Footer from '../../components/visitor/Footer';

const Home = () => {
  const { BACKEND_URL } = useGlobalContext();
  const [homeData, setHomeData] = useState({
    stats: { members: "1200", trainers: "50", access: "24/7", rating: "4.9" },
    testimonials: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/public/home-data`);
        if (res.ok) {
          const data = await res.json();
          setHomeData(data);
        }
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // Inject Font Awesome
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [BACKEND_URL]);

  return (
    <div className="font-sans text-gray-800 bg-white">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center md:text-left pt-12">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9F17F] text-green-900 text-xs font-bold uppercase tracking-wider mb-6 animate-bounce">
              #1 Fitness Destination
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 drop-shadow-lg">
              Forge Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FEEF75] to-[#D9F17F]">
                Best Self
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
              Join Songar's Gym today. Expert trainers, world-class equipment, and a community that pushes you further.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/plans">
                <button className="w-full sm:w-auto px-8 py-4 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/20">
                  View Memberships
                </button>
              </Link>
              <Link to="/contact">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-all">
                  Book a Free Trial
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATS STRIP */}
      <section className="bg-gray-900 py-10 border-b border-gray-800 w-[30%] mt-4 rounded-r-full">
        <div className=" w-full">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8  text-center divide-x divide-gray-800">
            <div>
              <h3 className="text-3xl font-black text-[#CDE7FE]">{homeData.stats.members}+</h3>
              <p className="text-gray-400 text-sm mt-1">Active Members</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#FEEF75]">{homeData.stats.trainers}+</h3>
              <p className="text-gray-400 text-sm mt-1">Expert Trainers</p>
            </div>

          </div>
        </div>
      </section>

      <PublicFeature />
      <PublicFeedback />


      {/* 6. CALL TO ACTION */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Start?</h2>
              <p className="text-gray-300 text-lg mb-8">Your future self is waiting. Take action today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <button className="px-10 py-4 bg-[#D9F17F] text-green-900 rounded-full font-bold text-sm hover:bg-green-400 transition-all">
                    Start Your Journey
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;