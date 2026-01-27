import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';


const Trainers = () => {
  const {BACKEND_URL}=useGlobalContext()
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
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        const res = await fetch(`${BACKEND_URL}/api/trainers`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load trainers");
        
        const data = await res.json();
        setTrainers(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load trainers");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // --- FILTERING ---
  const filteredTrainers = filter === "All" 
    ? trainers 
    : trainers.filter(t => t.specialization.includes(filter));

  const specialties = ["All", ...new Set(trainers.map(t => t.specialization))];

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Trainers...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans ">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-25">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Our Expert Trainers</h1>
          <p className="text-gray-500 mt-1">Find the perfect mentor for your fitness journey.</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setFilter(spec)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                filter === spec 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* TRAINERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => (
          <div 
            key={trainer._id} 
            className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => setSelectedTrainer(trainer)}
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={trainer.image || "https://static.thenounproject.com/png/561365-200.png"} 
                alt={trainer.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <h3 className="text-xl font-bold">{trainer.name}</h3>
                <p className="text-sm opacity-90">{trainer.specialization}</p>
              </div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30 flex items-center gap-1">
                <i className="fa-solid fa-star text-yellow-400"></i> {trainer.rating}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Experience</div>
                <div className="text-sm font-bold text-gray-900">{trainer.experience}</div>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                {trainer.bio}
              </p>
              
              <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- TRAINER DETAILS MODAL --- */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            
            {/* Left: Image & Quick Info */}
            <div className="w-full md:w-2/5 h-64 md:h-auto relative">
              <img 
                src={selectedTrainer.image || "https://static.thenounproject.com/png/561365-200.png"} 
                alt={selectedTrainer.name} 
                className="w-full h-full object-cover" 
              />
              <button 
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors md:hidden"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            </div>

            {/* Right: Details */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedTrainer.name}</h2>
                  <p className="text-blue-600 font-bold">{selectedTrainer.specialization} Coach</p>
                </div>
                <button 
                  onClick={() => setSelectedTrainer(null)}
                  className="hidden md:flex w-10 h-10 bg-gray-50 rounded-full items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wider">About</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {selectedTrainer.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Experience</p>
                      <p className="text-lg font-black text-gray-900">{selectedTrainer.experience}</p>
                   </div>
                   <div className="p-4 bg-[#fffbeb] rounded-2xl border border-yellow-100">
                      <p className="text-xs text-yellow-600 font-bold uppercase mb-1">Rating</p>
                      <p className="text-lg font-black text-gray-900 flex items-center gap-1">
                         {selectedTrainer.rating} <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
                      </p>
                   </div>
                </div>

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