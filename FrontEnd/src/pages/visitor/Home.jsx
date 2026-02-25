import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalContext } from "../../context/GlobalContext";
import PublicFeature from '../../components/visitor/PublicFeature';
import Footer from '../../components/visitor/Footer';
import GymChatbot from './GymChatbot';
import PublicFeedback from '../../components/visitor/PublicFeedback';

const Home = () => {

  const { api, BACKEND_URL, loadingIMG } = useGlobalContext();

  const [homeData, setHomeData] = useState({
    stats: { members: "1200", trainers: "50" },
    testimonials: [
      { name: "John D.", text: "This gym changed my life. The vibe is unmatched." },
      { name: "Sarah L.", text: "Best trainers in the city. Highly recommend!" },
      { name: "Mike T.", text: "Clean, modern, and serious about fitness." }
    ]
  });
  const [loading, setLoading] = useState(true);

  // --- SCROLL OBSERVER ---
  const observer = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/public/home-data`);
        if (res.ok) {
          const data = await res.json();
          setHomeData(prev => ({
            ...data,
            testimonials: data.testimonials && data.testimonials.length > 0 ? data.testimonials : prev.testimonials
          }));
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

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });

    const hiddenElements = document.querySelectorAll('.scroll-hidden');
    hiddenElements.forEach((el) => observer.current.observe(el));

    return () => {
      document.head.removeChild(link);
      if (observer.current) observer.current.disconnect();
    };
  }, [BACKEND_URL]);

  return (
    <div className="font-sans text-gray-800 bg-white overflow-x-hidden">

      {/* --- CUSTOM CSS FOR ANIMATIONS --- */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes revealText { from { opacity: 0; transform: translateY(20px); filter: blur(10px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(217, 241, 127, 0.4); transform: scale(1); } 50% { box-shadow: 0 0 20px 0 rgba(217, 241, 127, 0.2); transform: scale(1.05); } }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slideTrack { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-250px * 5)); } }

        .scroll-hidden { opacity: 0; transform: translateY(40px); transition: all 1s ease-out; }
        .scroll-hidden.show { opacity: 1; transform: translateY(0); }

        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-scroll { animation: scroll 20s linear infinite; }
        .animate-pulse-glow { animation: pulseGlow 2s infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-slide-track { animation: slideTrack 30s linear infinite; width: calc(250px * 10); display: flex; }
        
        .reveal-char { display: inline-block; animation: revealText 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .gradient-text-animate { background-size: 200% auto; animation: shimmer 3s linear infinite; }

        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; } .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transform scale-105 transition-transform duration-[20s] hover:scale-100" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* BRAND BOX */}
        <div className="absolute top-28 left-6 md:top-32 md:left-12 z-20 hidden md:block">
          <div className="bg-black/30 p-4 px-6 rounded-xl shadow-white animate-float 
          transform -rotate-3 hover:rotate-0 transition-transform duration-300 border border-white/40 cursor-default backdrop-blur-md bg-opacity-90">
            <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter italic leading-none">
              SONGAR'S <span className="text-[#D9F17F]">GYM</span>
            </h2>
            <div className="w-full h-1 bg-white/20 mt-1 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-[#D9F17F] animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center pt-20">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D9F17F] text-xs font-black uppercase tracking-[0.2em] mb-6 animate-pulse-glow">
              #1 Fitness Destination
            </span>

            <h1 className="text-5xl md:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              <span className="block overflow-hidden">
                {"Forge Your".split("").map((char, index) => (
                  <span key={index} className="reveal-char" style={{ animationDelay: `${index * 0.05}s` }}>{char === " " ? "\u00A0" : char}</span>
                ))}
              </span>
              <span className="block mt-2 animate-fade-in-up delay-500">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9F17F] via-[#FEEF75] to-[#D9F17F] animate-gradient-x">Best Self</span>
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
              Join Songar's Gym today. Expert trainers, world-class equipment, and a community that pushes you further.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link to="/plans">
                <button className="px-10 py-4 bg-[#D9F17F] text-green-900 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#cce66f] transition-all transform hover:scale-105 shadow-xl shadow-[#D9F17F]/20">
                  View Plans
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE STRIP */}
      <div className="bg-[#D9F17F] py-4 overflow-hidden border-y-4 border-black relative z-20 -rotate-1 origin-left scale-105 shadow-lg">
        <div className="whitespace-nowrap flex animate-scroll">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-black font-black text-2xl uppercase tracking-widest mx-8 flex items-center gap-4">
              Strength <i className="fas fa-bolt text-black/20"></i> Power <i className="fas fa-dumbbell text-black/20"></i> Discipline
            </span>
          ))}
        </div>
      </div>

      {/* 3. FEATURES */}
      <div className="scroll-hidden py-20">
        <PublicFeature />
      </div>

      {/* 4. MEET THE ELITE */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <span className="text-[#D9F17F] font-black text-sm uppercase tracking-widest mb-2 block scroll-hidden">Expert Guidance</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 scroll-hidden">Meet The Elite</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, index) => (
              <div key={item} className="group relative rounded-[2.5rem] overflow-hidden aspect-[3/4] cursor-pointer shadow-xl scroll-hidden" style={{ transitionDelay: `${index * 100}ms` }}>
                <img src={`https://images.unsplash.com/photo-${item === 1 ? '1571019614242-c5c5dee9f50b' : item === 2 ? '1583454110551-21f2fa2afe61' : '1517836357463-d25dfeac3438'}?q=80&w=800&auto=format&fit=crop`} alt="Trainer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-8 text-left translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-black text-white mb-1">Coach {item === 1 ? 'Alex' : item === 2 ? 'Sarah' : 'Mike'}</h3>
                  <p className="text-[#D9F17F] font-bold text-xs uppercase tracking-widest mb-2">{item === 1 ? 'Strength' : item === 2 ? 'Mobility' : 'Crossfit'}</p>
                  <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">View Profile <i className="fa-solid fa-arrow-right ml-1"></i></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS (UPDATED WITH IMG & STARS) */}
      <section className="py-20 bg-white relative overflow-hidden">
       <PublicFeedback/>
      </section>

      {/* 6. TRANSFORMATION SLIDER */}
      <section className="py-20 bg-gray-50 overflow-hidden relative border-t border-gray-100">
        <div className="container mx-auto px-6 mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter scroll-hidden">Transformation <span className="text-[#D9F17F] text-shadow-sm">Stories</span></h2>
        </div>

        <div className="flex animate-slide-track gap-6">
          {[...Array(2)].map((_, setIndex) => (
            <React.Fragment key={setIndex}>
              {[1, 2, 3, 4, 5].map((img, idx) => (
                <div key={idx} className="w-[250px] h-[350px] flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200 shadow-md relative group">
                  <img src={`https://images.unsplash.com/photo-${img === 1 ? '1571019613454-1cb2f99b2d8b' : img === 2 ? '1599058945522-28d584b6f0ff' : '1583454110551-21f2fa2afe61'}?q=80&w=800&auto=format&fit=crop`} alt={`Transformation ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-[#121212] rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl group scroll-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9F17F] rounded-full filter blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-[150px] opacity-10 -translate-x-1/2 translate-y-1/2 group-hover:opacity-20 transition-opacity duration-1000"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Don't Let Tomorrow <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">Be Another Yesterday.</span></h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;