import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Inject Font Awesome for icons
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* 1. HERO SECTION */}
      {/* Added pt-20 to push content down below the fixed navbar */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center md:text-left pt-12">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9F17F] text-green-900 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
              #1 Fitness Destination
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 drop-shadow-lg">
              Forge Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FEEF75] to-[#D9F17F]">
                Best Self
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
              Join Songar's Gym today. Expert trainers, world-class equipment, and a community that pushes you further.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/visitor/plans">
                <button className="w-full sm:w-auto px-8 py-4 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/20">
                  View Memberships
                </button>
              </Link>
              <Link to="/visitor/contact">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-all">
                  Book a Free Trial
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="bg-gray-900 py-10 border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
            <div>
              <h3 className="text-3xl font-black text-[#CDE7FE]">1200+</h3>
              <p className="text-gray-400 text-sm mt-1">Active Members</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#FEEF75]">50+</h3>
              <p className="text-gray-400 text-sm mt-1">Expert Trainers</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#D9F17F]">24/7</h3>
              <p className="text-gray-400 text-sm mt-1">Gym Access</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white">4.9</h3>
              <p className="text-gray-400 text-sm mt-1">Google Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES / WHY US */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-500">We don't just provide equipment; we provide an environment for growth, discipline, and results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-[2.5rem] bg-[#f8fbff] border border-blue-50 hover:border-[#CDE7FE] transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer">
              <div className="w-14 h-14 bg-[#CDE7FE] rounded-2xl flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-dumbbell"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Equipment</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Train with the latest Technogym and Hammer Strength machines designed for biomechanical perfection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-[2.5rem] bg-[#fffcf0] border border-yellow-50 hover:border-[#FEEF75] transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer">
              <div className="w-14 h-14 bg-[#FEEF75] rounded-2xl flex items-center justify-center text-yellow-800 text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-user-graduate"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certified Trainers</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our team consists of certified professionals who create personalized plans tailored to your body type.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-[2.5rem] bg-[#f4fbf6] border border-green-50 hover:border-[#D9F17F] transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer">
              <div className="w-14 h-14 bg-[#D9F17F] rounded-2xl flex items-center justify-center text-green-800 text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-heart-pulse"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Holistic Wellness</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Beyond lifting, we offer Yoga, Zumba, and Nutrition counseling for a complete healthy lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROGRAMS SHOWCASE */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Explore Programs</h2>
              <p className="text-gray-500">Find the training style that fits your goals.</p>
            </div>
            <Link to="/visitor/services">
              <button className="hidden md:block text-blue-600 font-bold hover:underline">See All Programs <i className="fa-solid fa-arrow-right ml-1"></i></button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Strength Training", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop", color: "from-blue-600/80" },
              { title: "Cardio & HIIT", img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop", color: "from-yellow-600/80" },
              { title: "Yoga & Flex", img: "https://images.unsplash.com/photo-1544367563-121910aa6e39?q=80&w=1470&auto=format&fit=crop", color: "from-green-600/80" },
              { title: "CrossFit", img: "https://images.unsplash.com/photo-1517963879466-eeb2568a8304?q=80&w=1471&auto=format&fit=crop", color: "from-red-600/80" },
            ].map((program, idx) => (
              <div key={idx} className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
                <img src={program.img} alt={program.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-t ${program.color} to-transparent opacity-90`}></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-1">{program.title}</h3>
                  <p className="text-white/80 text-xs">Learn More <i className="fa-solid fa-arrow-right ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i></p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <button className="text-blue-600 font-bold hover:underline">See All Programs</button>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-16">Community Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Riya Patel", role: "Member since 2023", review: "The trainers here are exceptional. I've lost 10kg in 3 months and feel stronger than ever!", rating: 5 },
              { name: "Amit Sharma", role: "Member since 2022", review: "Love the vibe! It's not intimidating like other gyms. The equipment is top-notch and always clean.", rating: 5 },
              { name: "Sneha Gupta", role: "Yoga Enthusiast", review: "The group classes are the highlight of my day. Great energy and very supportive community.", rating: 4 },
            ].map((review, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-shadow relative">
                <i className="fa-solid fa-quote-right absolute top-8 right-8 text-gray-100 text-4xl"></i>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-solid fa-star text-xs ${i < review.rating ? 'text-[#FEEF75]' : 'text-gray-200'}`}></i>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{review.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-gray-400">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[100px] opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Start?</h2>
              <p className="text-gray-300 text-lg mb-8">
                Your future self is waiting. Don't let another day pass without taking action.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/visitor/contact">
                  <button className="px-10 py-4 bg-[#D9F17F] text-green-900 rounded-full font-bold text-sm hover:bg-green-400 transition-all shadow-lg transform hover:scale-105">
                    Start Your Journey
                  </button>
                </Link>
                <Link to="/visitor/plans">
                  <button className="px-10 py-4 bg-transparent border border-gray-600 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-all">
                    View Plans
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