import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Trainers = () => {
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
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const trainers = [
    {
      id: 1,
      name: 'Amit Patel',
      specialization: 'Strength',
      experience: '5+ Years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1374&auto=format&fit=crop',
      certifications: ["ACE Certified", "CrossFit L1"],
      bio: "Amit specializes in hypertrophy and strength conditioning. His training philosophy revolves around progressive overload and perfect form.",
      schedule: "Mon - Sat: 6:00 AM - 2:00 PM",
      philosophy: "Strength is a skill. Practice it daily."
    },
    {
      id: 2,
      name: 'Riya Sharma',
      specialization: 'Yoga',
      experience: '4+ Years',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1470&auto=format&fit=crop',
      certifications: ["RYT 200", "Holistic Nutritionist"],
      bio: "Riya combines traditional Hatha yoga with modern mobility flows to help you build a resilient, flexible body and a calm mind.",
      schedule: "Mon - Fri: 4:00 PM - 9:00 PM",
      philosophy: "Flow with your breath, ground with your body."
    },
    {
      id: 3,
      name: 'Rohan Mehta',
      specialization: 'HIIT',
      experience: '6+ Years',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
      certifications: ["NASM CPT", "Tactical Conditioning"],
      bio: "Rohan's high-energy sessions are designed to burn fat and boost endurance. Be prepared to sweat and push past your limits.",
      schedule: "Mon - Sat: 5:00 PM - 10:00 PM",
      philosophy: "Your only competition is you from yesterday."
    },
    {
      id: 4,
      name: 'Sneha Desai',
      specialization: 'Nutrition',
      experience: '3+ Years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1374&auto=format&fit=crop',
      certifications: ["Registered Dietitian", "Sports Nutrition"],
      bio: "Sneha helps members build a healthy relationship with food. She creates sustainable meal plans that fuel performance without deprivation.",
      schedule: "By Appointment",
      philosophy: "You can't out-train a bad diet."
    },
  ];

  const filteredTrainers = filter === "All" ? trainers : trainers.filter(t => t.specialization.includes(filter));

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9F17F] text-green-900 text-xs font-bold uppercase tracking-wider mb-4">
            Expert Guidance
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Meet Your <span className="text-[#CDE7FE]">Mentors</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Certified, experienced, and dedicated. Our trainers don't just instruct; they inspire you to achieve the impossible.
          </p>
        </div>
      </section>

      {/* 2. FILTERS & GRID */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["All", "Strength", "Yoga", "HIIT", "Nutrition"].map((cat) => (
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

          {/* Trainers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrainers.map((trainer) => (
              <div key={trainer.id} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Area */}
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{trainer.name}</h3>
                        <p className="text-[#D9F17F] font-bold text-sm uppercase tracking-wider">{trainer.specialization}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                        <i className="fa-solid fa-star text-[#FEEF75]"></i> {trainer.rating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-briefcase text-blue-400"></i> {trainer.experience} Exp</span>
                    <span className="flex items-center gap-2"><i className="fa-solid fa-certificate text-yellow-500"></i> Certified</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-6">
                    {trainer.bio}
                  </p>

                  <button 
                    onClick={() => setSelectedTrainer(trainer)}
                    className="w-full py-3 bg-gray-50 text-gray-800 rounded-xl font-bold text-sm hover:bg-[#CDE7FE] hover:text-blue-900 transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                  >
                    View Profile <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SUCCESS STORIES */}
      <section className="py-20 bg-[#f8fbff]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Trainer-Led Transformations</h2>
            <p className="text-gray-500">Real results achieved under the guidance of our experts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { member: "Karan V.", trainer: "Amit Patel", result: "-12kg Fat Loss", quote: "Amit's plan was strict but effective." },
              { member: "Pooja S.", trainer: "Riya Sharma", result: "Flexibility Mastered", quote: "I can finally do a full split thanks to Riya!" },
              { member: "Vikram R.", trainer: "Rohan Mehta", result: "Marathon Ready", quote: "Rohan built my stamina from scratch." },
            ].map((story, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-50 relative">
                <i className="fa-solid fa-quote-left text-[#CDE7FE] text-4xl mb-4"></i>
                <p className="text-gray-600 italic mb-6">"{story.quote}"</p>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#D9F17F] flex items-center justify-center text-green-900 font-bold">
                    {story.member[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{story.member}</h4>
                    <p className="text-xs text-gray-500">Trained by {story.trainer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Find Your Perfect Coach</h2>
          <p className="text-gray-500 mb-8">
            Not sure who to choose? Book a free trial session and meet our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/visitor/contact">
              <button className="px-10 py-4 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg transform hover:scale-105">
                Book Free Trial
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

      {/* --- TRAINER DETAILS MODAL --- */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTrainer(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-fade-in-up" onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedTrainer(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Image Side */}
            <div className="w-full md:w-2/5 h-64 md:h-auto relative">
              <img src={selectedTrainer.image} alt={selectedTrainer.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
              <div className="absolute bottom-4 left-4 text-white md:hidden">
                <h2 className="text-3xl font-black">{selectedTrainer.name}</h2>
                <p className="text-[#D9F17F] font-bold">{selectedTrainer.specialization}</p>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[80vh] md:max-h-auto">
              <div className="hidden md:block mb-6">
                <h2 className="text-4xl font-black text-gray-900 mb-1">{selectedTrainer.name}</h2>
                <p className="text-blue-600 font-bold text-lg">{selectedTrainer.specialization} Specialist</p>
              </div>

              <div className="space-y-6">
                {/* Stats */}
                <div className="flex gap-6 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Experience</p>
                    <p className="text-lg font-bold text-gray-900">{selectedTrainer.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Rating</p>
                    <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      {selectedTrainer.rating} <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">{selectedTrainer.bio}</p>
                </div>

                {/* Philosophy */}
                <div className="bg-[#f8fbff] p-4 rounded-xl border-l-4 border-[#CDE7FE]">
                  <p className="text-gray-700 italic font-medium">"{selectedTrainer.philosophy}"</p>
                </div>

                {/* Schedule & Certs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Availability</h4>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <i className="fa-regular fa-clock text-green-500"></i> {selectedTrainer.schedule}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Certifications</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {selectedTrainer.certifications.map((cert, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <i className="fa-solid fa-certificate text-yellow-500 text-xs"></i> {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-4">
                  <Link to="/visitor/contact" className="block w-full text-center py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    Train with {selectedTrainer.name.split(" ")[0]}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Trainers;