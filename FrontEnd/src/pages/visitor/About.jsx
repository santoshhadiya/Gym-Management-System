import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
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
    <div className="font-sans text-gray-800 bg-white pt-20">
      
      {/* 1. HERO / OVERVIEW SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FEEF75] text-yellow-900 text-xs font-bold uppercase tracking-wider mb-4">
            About Songar's Gym
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Empowering Lives Through <span className="text-[#D9F17F]">Fitness</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            To provide an inclusive, motivational, and effective fitness experience that empowers people to become their strongest selves—physically and mentally.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Image Side */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 bg-[#CDE7FE] rounded-[2.5rem] rotate-3 transform translate-x-2 translate-y-2"></div>
              <img
                src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop"
                alt="Gym Founder"
                className="relative rounded-[2.5rem] shadow-xl w-full object-cover z-10 h-[400px]"
              />
            </div>

            {/* Text Side */}
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-black text-gray-900 mb-6">Our Story & Growth</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Songar's Gym was founded in 2015 by fitness enthusiast <strong>Manthan Prajapati</strong> with a simple goal: to create a gym that feels like a second home. Starting as a small studio garage, we saw the need for a space that prioritized community over competition.
                </p>
                <p>
                  Over the last decade, we have grown into a 5,000 sq. ft. premier fitness destination. We've expanded from basic free weights to advanced biomechanical machines, but our core mission remains the same: helping every member find their strength.
                </p>
              </div>
              
              {/* Stats Strip (Achievements) */}
              <div className="grid grid-cols-3 gap-4 mt-8 border-t border-gray-100 pt-8">
                <div>
                  <h4 className="text-2xl font-black text-[#D9F17F]">10+</h4>
                  <p className="text-xs text-gray-500 uppercase font-bold">Years Experience</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[#FEEF75]">5k+</h4>
                  <p className="text-xs text-gray-500 uppercase font-bold">Members Trained</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[#CDE7FE]">3</h4>
                  <p className="text-xs text-gray-500 uppercase font-bold">City Locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACILITIES & INFRASTRUCTURE */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">World-Class Facilities</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We invest in the best so you can train at your best.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Modern Equipment", desc: "Technogym & Hammer Strength machines for optimal biomechanics.", icon: "fa-dumbbell", color: "bg-blue-100 text-blue-600" },
              { title: "Training Zones", desc: "Dedicated areas for Cardio, CrossFit, Heavy Lifting, and Yoga.", icon: "fa-layer-group", color: "bg-yellow-100 text-yellow-700" },
              { title: "Hygiene First", desc: "Sanitized hourly with advanced air filtration systems.", icon: "fa-pump-soap", color: "bg-green-100 text-green-700" },
            ].map((facility, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${facility.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${facility.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{facility.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (Values) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
                Why We Are The <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9F17F] to-green-600">Right Choice</span>
              </h2>
              <p className="text-gray-600 mb-8">
                We focus on holistic wellness, not just aesthetics. Our certified trainers and friendly environment ensure you stay motivated.
              </p>
              <Link to="/visitor/plans">
                <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg">
                  Check Our Plans
                </button>
              </Link>
            </div>

            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Personalized Plans", icon: "fa-clipboard-list" },
                { title: "Certified Trainers", icon: "fa-certificate" },
                { title: "Affordable Pricing", icon: "fa-tag" },
                { title: "Friendly Community", icon: "fa-users" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#CDE7FE] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h4 className="font-bold text-gray-800">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HEALTH & SAFETY */}
      <section className="py-16 bg-[#f0fdf4]">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <i className="fa-solid fa-shield-virus text-green-500"></i>
            <span className="text-sm font-bold text-green-800">Safety First</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your Health is Our Priority</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We maintain strict hygiene protocols, including regular equipment sanitization, hand sanitizer stations, and contactless check-ins to ensure a safe workout environment.
          </p>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Ready to Join the Family?</h2>
              <p className="text-gray-300 text-lg mb-8">
                Take the first step towards a healthier, happier you. Visit us today or get in touch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/visitor/contact">
                  <button className="px-10 py-4 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg transform hover:scale-105">
                    Contact Us
                  </button>
                </Link>
                <Link to="/visitor/plans">
                  <button className="px-10 py-4 bg-transparent border border-gray-600 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-all">
                    View Memberships
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

export default About;