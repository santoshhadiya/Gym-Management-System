import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
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

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#CDE7FE] text-blue-900 text-xs font-bold uppercase tracking-wider mb-4">
            Premium Services
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Elevate Your <span className="text-[#FEEF75]">Performance</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            From personalized training to holistic nutrition, we provide the tools, guidance, and environment you need to succeed.
          </p>
          <Link to="/visitor/contact">
            <button className="px-8 py-3 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg hover:scale-105">
              Book a Free Trial
            </button>
          </Link>
        </div>
      </section>

      {/* 2. CORE SERVICES GRID */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Our Expertise</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Comprehensive solutions for every fitness goal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "Personal Training", 
                desc: "One-on-one coaching with certified trainers who build specific plans for your body type and goals.",
                icon: "fa-user-ninja",
                color: "bg-blue-50 text-blue-600",
                border: "hover:border-blue-200"
              },
              { 
                title: "Workout Programs", 
                desc: "Structured strength, hypertrophy, and functional training cycles designed for progressive overload.",
                icon: "fa-dumbbell",
                color: "bg-yellow-50 text-yellow-700",
                border: "hover:border-yellow-200"
              },
              { 
                title: "Diet & Nutrition", 
                desc: "Customized meal plans and macro-tracking guidance to fuel your workouts and recovery.",
                icon: "fa-carrot",
                color: "bg-green-50 text-green-600",
                border: "hover:border-green-200"
              },
              { 
                title: "Group Training", 
                desc: "High-energy Yoga, Zumba, and HIIT classes to keep you motivated and moving with the community.",
                icon: "fa-users",
                color: "bg-purple-50 text-purple-600",
                border: "hover:border-purple-200"
              },
              { 
                title: "Fitness Assessment", 
                desc: "Regular BMI checks, body composition analysis, and strength testing to track your progress.",
                icon: "fa-chart-line",
                color: "bg-red-50 text-red-600",
                border: "hover:border-red-200"
              },
              { 
                title: "Recovery Zone", 
                desc: "Dedicated stretching areas and steam facilities to help your muscles recover faster.",
                icon: "fa-spa",
                color: "bg-teal-50 text-teal-600",
                border: "hover:border-teal-200"
              },
            ].map((service, idx) => (
              <div key={idx} className={`p-8 rounded-[2rem] border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 group ${service.border}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${service.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${service.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FACILITIES HIGHLIGHT */}
      <section className="py-20 bg-[#f8fbff]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <span className="text-[#D9F17F] font-bold text-sm uppercase tracking-wide">Infrastructure</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6">Train With The Best Equipment</h2>
              <ul className="space-y-4">
                {[
                  "Advanced Cardio Theater (Treadmills, Ellipticals, Rowers)",
                  "Hammer Strength & Technogym Plate-Loaded Machines",
                  "Dedicated Deadlift Platforms & Squat Racks",
                  "Functional Training Rig & Turf Area",
                  "Luxury Locker Rooms with Steam & Sauna"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-600">
                    <i className="fa-solid fa-circle-check text-[#CDE7FE] text-lg"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="absolute -inset-4 bg-[#CDE7FE] rounded-[2.5rem] rotate-2 opacity-50"></div>
               <img 
                 src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop" 
                 alt="Gym Equipment" 
                 className="relative rounded-[2.5rem] shadow-xl w-full object-cover"
               />
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEMBERSHIP PREVIEW */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-gray-500">Flexible options designed for your lifestyle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="p-8 rounded-[2rem] border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Basic</h3>
              <p className="text-3xl font-black text-gray-900 mb-6">₹1,500<span className="text-sm text-gray-400 font-normal">/mo</span></p>
              <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left pl-4">
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Gym Access</li>
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Locker Access</li>
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> General Training</li>
              </ul>
              <Link to="/visitor/plans">
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">View Details</button>
              </Link>
            </div>

            {/* Premium */}
            <div className="p-8 rounded-[2rem] border-2 border-[#FEEF75] bg-[#fffcf0] hover:shadow-xl transition-all text-center relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FEEF75] text-yellow-900 px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quarterly Pro</h3>
              <p className="text-3xl font-black text-gray-900 mb-6">₹4,000<span className="text-sm text-gray-400 font-normal">/3mo</span></p>
              <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left pl-4">
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> All Basic Features</li>
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Group Classes</li>
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Diet Consultation</li>
              </ul>
              <Link to="/visitor/plans">
                <button className="w-full py-3 bg-[#FEEF75] text-yellow-900 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-sm">Select Plan</button>
              </Link>
            </div>

            {/* Yearly */}
            <div className="p-8 rounded-[2rem] border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Yearly Elite</h3>
              <p className="text-3xl font-black text-gray-900 mb-6">₹12,000<span className="text-sm text-gray-400 font-normal">/yr</span></p>
              <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left pl-4">
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> All Pro Features</li>
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Personal Training (2 Sessions)</li>
                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Steam & Sauna</li>
              </ul>
              <Link to="/visitor/plans">
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">View Details</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRANSFORMATIONS */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">Real Results, Real People</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { name: "Rahul S.", result: "Lost 15kg in 6 Months", quote: "The diet plan was a game changer." },
               { name: "Priya M.", result: "Gained Strength & Confidence", quote: "I never thought I could lift heavy until now." },
               { name: "Amit K.", result: "Marathon Ready", quote: "The cardio endurance training helped me finish my first 21k." },
             ].map((story, idx) => (
               <div key={idx} className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-[#D9F17F] rounded-full flex items-center justify-center text-green-900 font-bold">
                        {story.name[0]}
                     </div>
                     <div>
                        <h4 className="font-bold text-lg">{story.name}</h4>
                        <p className="text-[#D9F17F] text-xs font-bold uppercase">{story.result}</p>
                     </div>
                  </div>
                  <p className="text-gray-400 italic">"{story.quote}"</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Start Your Transformation</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/visitor/contact">
              <button className="px-10 py-4 bg-[#D9F17F] text-green-900 rounded-full font-bold text-sm hover:bg-green-400 transition-all shadow-lg transform hover:scale-105">
                Contact Us
              </button>
            </Link>
            <Link to="/visitor/plans">
              <button className="px-10 py-4 bg-transparent border border-gray-300 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-all">
                View Memberships
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;