import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';


const Offers = () => {
  const {BACKEND_URL}=useGlobalContext()
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Inject Styles
  useEffect(() => {
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    return () => {
      document.head.removeChild(linkFA);
      document.head.removeChild(linkToast);
    };
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // Using public endpoint - no auth required
        const res = await fetch(`${BACKEND_URL}/api/offers/public`);
        
        if (!res.ok) throw new Error("Failed to load offers");
        
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error(err);
        // Fallback for preview if backend not running
        // toast.error("Could not load latest offers.");
        setOffers([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = filter === "All" 
    ? offers 
    : offers.filter(offer => offer.category === filter);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Latest Deals...</div>;

  return (
    <div className="w-full font-sans pb-10 mt-25 px-5">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 text-white py-20 px-6 rounded-[2.5rem] mb-12 overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D9F17F] rounded-full filter blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 rounded-full filter blur-[100px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
         
         <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-[#D9F17F] font-bold text-xs tracking-widest uppercase mb-6 backdrop-blur-md border border-white/10 animate-pulse">
               Limited Time Deals
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
               Unlock Your Best Self <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9F17F] to-green-400">for Less</span>
            </h1>
            <p className="text-gray-300 mb-10 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
               Exclusive discounts on memberships, personal training, and more. Grab them before they expire!
            </p>
            <button 
               onClick={() => document.getElementById('offers-grid').scrollIntoView({ behavior: 'smooth' })}
               className="bg-[#D9F17F] text-green-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-green-300 transition-all shadow-lg shadow-[#D9F17F]/20 transform hover:-translate-y-1"
            >
               View All Offers
            </button>
         </div>
      </section>

      {/* 2. OFFERS GRID */}
      <section id="offers-grid" className="max-w-7xl mx-auto px-4 m-10 ">
         
         {/* Filters */}
         <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4 pt-5">
            {["All", "Membership", "Training"].map(cat => (
               <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap shadow-sm ${
                     filter === cat 
                     ? 'bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2' 
                     : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
               >
                  {cat}
               </button>
            ))}
         </div>

         {filteredOffers.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <i className="fa-solid fa-tag text-4xl"></i>
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Offers</h3>
               <p className="text-gray-500">Check back later for new deals and discounts!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredOffers.map((offer) => (
                  <div key={offer.id} className={`group relative bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col`}>
                     {/* Decorative Bg */}
                     <div className={`absolute -top-20 -right-20 w-64 h-64 ${offer.color} rounded-full filter blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>

                     <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${offer.color} ${offer.textColor} shadow-inner`}>
                              <i className={`fa-solid ${offer.icon}`}></i>
                           </div>
                           <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-red-100 flex items-center gap-1.5 uppercase tracking-wide">
                              <i className="fa-regular fa-clock"></i> Ends {offer.expiry}
                           </span>
                        </div>

                        {/* Content */}
                        <div className="mb-auto">
                           <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">{offer.title}</h3>
                           <p className="text-gray-500 text-sm leading-relaxed mb-6">{offer.description}</p>
                        </div>

                        {/* Discount & Action */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                           <div className="flex items-end gap-2 mb-2">
                              <span className="text-4xl font-black text-gray-900 tracking-tighter">{offer.discount}</span>
                           </div>
                           <p className="text-xs text-green-600 font-bold mb-6 flex items-center gap-1">
                              <i className="fa-solid fa-circle-check"></i> Discount Auto-Applied
                           </p>

                           <Link to="/plans" className="block w-full text-center py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all transform group-hover:translate-y-[-2px] shadow-lg shadow-gray-900/10">
                              Claim Offer <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
                           </Link>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </section>

      
      {/* 4. FAQ / TERMS */}
      <section className="py-16 mt-10">
         <div className="container mx-auto px-6 text-center">
            <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
               *Terms & Conditions apply. Offers are subject to availability and cannot be clubbed with other ongoing promotions. 
               Discount is automatically applied at checkout. Valid on select plans only.
            </p>
         </div>
      </section>

    </div>
  );
};

export default Offers;