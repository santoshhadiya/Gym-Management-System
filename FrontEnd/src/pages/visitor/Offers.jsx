import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Offers = () => {
  // Inject Font Awesome & Toast Styles
  useEffect(() => {
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkFA);
    };
  }, []);

  const [filter, setFilter] = useState("All");
  const [copiedCode, setCopiedCode] = useState(null);

  const offers = [
    {
      id: 1,
      title: "New Year Resolution",
      description: "Commit to a fitter you! Get flat 25% OFF on all Yearly Memberships.",
      discount: "25% OFF",
      code: "NEWYEAR25",
      category: "Membership",
      expiry: "2026-01-15",
      color: "bg-[#D9F17F]",
      textColor: "text-green-900",
      icon: "fa-calendar-check"
    },
    {
      id: 2,
      title: "Student Power Pack",
      description: "Valid student ID required. Enjoy premium access at pocket-friendly rates.",
      discount: "₹500 OFF",
      code: "STUDENT500",
      category: "Membership",
      expiry: "Ongoing",
      color: "bg-[#CDE7FE]",
      textColor: "text-blue-900",
      icon: "fa-graduation-cap"
    },
    {
      id: 3,
      title: "Personal Training Trial",
      description: "Experience expert guidance. Buy 10 PT sessions and get 2 absolutely FREE.",
      discount: "2 FREE SESSIONS",
      code: "TRAINHARD",
      category: "Training",
      expiry: "Limited Time",
      color: "bg-[#FEEF75]",
      textColor: "text-yellow-900",
      icon: "fa-dumbbell"
    },
    {
      id: 4,
      title: "Summer Body Blast",
      description: "3-Month intensive cardio & weight loss program at a special price.",
      discount: "Flat ₹2000 OFF",
      code: "SUMMERBODY",
      category: "Training",
      expiry: "2025-06-30",
      color: "bg-red-50",
      textColor: "text-red-800",
      icon: "fa-fire"
    }
  ];

  const filteredOffers = filter === "All" ? offers : offers.filter(o => o.category === filter);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FEEF75] text-yellow-900 text-xs font-bold uppercase tracking-wider mb-4">
            Limited Time Deals
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Exclusive <span className="text-[#D9F17F]">Offers</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Start your fitness journey with the best value. Grab these deals before they expire!
          </p>
        </div>
      </section>

      {/* 2. FILTERS & OFFERS GRID */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["All", "Membership", "Training"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === cat 
                  ? "bg-gray-900 text-white shadow-lg" 
                  : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="relative bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group">
                
                {/* Left Side (Visual) */}
                <div className={`${offer.color} w-full sm:w-1/3 p-6 flex flex-col items-center justify-center text-center relative`}>
                   <div className="absolute inset-0 bg-white/10 pattern-dots"></div>
                   <div className={`w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl mb-3 ${offer.textColor}`}>
                      <i className={`fa-solid ${offer.icon}`}></i>
                   </div>
                   <h3 className={`text-2xl font-black ${offer.textColor}`}>{offer.discount}</h3>
                   <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${offer.textColor} opacity-80`}>Discount</p>
                   
                   {/* Perforation visual for desktop */}
                   <div className="absolute right-0 top-0 bottom-0 w-4 translate-x-1/2 hidden sm:flex flex-col justify-between py-2">
                      {[...Array(8)].map((_, i) => <div key={i} className="w-4 h-4 bg-gray-50 rounded-full"></div>)}
                   </div>
                </div>

                {/* Right Side (Details) */}
                <div className="w-full sm:w-2/3 p-6 sm:pl-8 flex flex-col justify-center">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{offer.category}</span>
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                         <i className="fa-regular fa-clock mr-1"></i> {offer.expiry}
                      </span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                   <p className="text-gray-500 text-sm mb-6 leading-relaxed">{offer.description}</p>
                   
                   <div className="mt-auto flex items-center gap-3">
                      <div className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl px-4 py-2 text-center relative group-hover:border-gray-400 transition-colors">
                         <span className="font-mono font-bold text-gray-800 tracking-widest">{offer.code}</span>
                      </div>
                      <button 
                        onClick={() => handleCopyCode(offer.code)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2
                          ${copiedCode === offer.code 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                      >
                        {copiedCode === offer.code ? (
                          <>Copied <i className="fa-solid fa-check"></i></>
                        ) : (
                          "Claim"
                        )}
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. REFERRAL SECTION */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#CDE7FE] to-[#eef6ff] rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             
             {/* Decorative */}
             <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>
             <div className="absolute right-10 top-10 w-20 h-20 bg-[#FEEF75]/40 rounded-full blur-xl"></div>

             <div className="md:w-2/3 relative z-10">
                <span className="inline-block bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm">
                   <i className="fa-solid fa-users mr-1"></i> Member Special
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Refer a Friend & Earn Rewards!</h2>
                <p className="text-gray-700 text-lg mb-6 max-w-xl">
                   Fitness is better together. Bring a workout buddy and both of you get <span className="font-bold text-blue-700">₹500 OFF</span> your next renewal or purchase.
                </p>
                <Link to="/visitor/contact">
                   <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
                      Refer Now
                   </button>
                </Link>
             </div>

             <div className="md:w-1/3 flex justify-center relative z-10">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/50">
                   <div className="text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase">You Get</p>
                      <p className="text-4xl font-black text-gray-900">₹500</p>
                      <p className="text-green-500 font-bold text-sm">Credit</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ / TERMS */}
      <section className="py-16 bg-white border-t border-gray-50">
         <div className="container mx-auto px-6 text-center">
            <p className="text-sm text-gray-400">
               *Terms & Conditions apply. Offers cannot be clubbed with other promotions. 
               Student ID is mandatory for student discounts.
            </p>
         </div>
      </section>

    </div>
  );
};

export default Offers;