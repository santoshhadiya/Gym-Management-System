import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';

const AssignedMembers = () => {
  const { BACKEND_URL, user, api } = useGlobalContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGoal, setFilterGoal] = useState("All");

   const getImageUrl = (path) => {
      if (!path) return "https://i.pravatar.cc/150?u=default";
      if (path.startsWith('http')) return path;
      return `${BACKEND_URL}/${path}`;
   };

  // --- STYLES AND DATA FETCHING ---
  useEffect(() => {
    // Inject Styles
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    // Fetch Clients from Backend
    const fetchClients = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/trainers/${user._id}/members/all`);
        const data = res.data;
        console.log(res.data)
        setMembers(data);
      } catch (err) {
        console.error(err);
        toast.error("Error loading client data");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, [BACKEND_URL, user?._id]);

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch(status) {
      case "Active": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Inactive": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getProgressColor = (progress) => {
    switch(progress) {
      case "On Track": return "text-green-600 bg-green-50";
      case "Needs Attention": return "text-yellow-600 bg-yellow-50";
      case "Low Attendance": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // --- ACTIONS ---
  const handleAction = (action, memberName) => {
    toast.info(`${action} for ${memberName}`);
  };

  // --- FILTERING ---
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGoal = filterGoal === "All" || m.goal === filterGoal;
    return matchesSearch && matchesGoal;
  });

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#CDE7FE]"></i>
          <p className="text-gray-400 font-bold animate-pulse">Synchronizing Client Data...</p>
        </div>
      </div>
    );
  }

  return (
    // Changed: Added px-4 sm:px-6 for mobile padding
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      {/* Changed: items-start md:items-end to prevent text misalignment on mobile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#121212]">Client Management</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Tracking {members.length} athletes assigned to you.</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[1rem] border border-gray-100 ">
         <div className="relative flex-grow w-full md:w-auto md:max-w-xs">
            <input
               type="text"
               placeholder="Search clients..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:outline-none focus:border-[#CDE7FE] focus:bg-white text-sm transition-all"
            />
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
         </div>
         
         {/* Changed: Added w-full for mobile horizontal scrolling container */}
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {['All', 'Weight Loss', 'Muscle Gain', 'Stamina Boost'].map(goal => (
               <button
                  key={goal}
                  onClick={() => setFilterGoal(goal)}
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                     filterGoal === goal 
                     ? 'bg-[#121212] text-white shadow-lg' 
                     : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
               >
                  {goal}
               </button>
            ))}
         </div>
      </div>

      {/* MEMBERS GRID */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               {filteredMembers.map((member) => (
                  <div key={member._id} className="bg-white rounded-[1rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                     <div className="p-6 md:p-8 flex flex-col items-center text-center">
                        <img src={getImageUrl(member.image)} alt={member.name} className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-white shadow-lg" />
                        <h3 className="text-lg font-black text-[#121212] mt-3">{member.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{member.plan}</p>

                        <div className="flex items-center gap-6 my-2">
                           <div className="text-center">
                              <p className="font-black text-[#121212]">{member.details?.weight ?? '-'}kg</p>
                              <p className="text-[10px] text-gray-400">Weight</p>
                           </div>
                           <div className="text-center">
                              <p className="font-black text-[#121212]">{member.details?.height ?? '-'}cm</p>
                              <p className="text-[10px] text-gray-400">Height</p>
                           </div>
                        </div>

                        <p className="text-sm font-black uppercase tracking-wider bg-[#CDE7FE] text-blue-900 px-4 py-1.5 rounded-full">{member.goal}</p>

                        <div className="w-full mt-4">
                           <Link to={`/trainer/chat/member`} className="w-full inline-flex items-center justify-center py-3 bg-[#121212] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#D9F17F] hover:text-[#121212] transition-all">
                              <i className="fa-regular fa-comment-dots mr-2"></i> Chat
                           </Link>
                        </div>
                     </div>
                  </div>
               ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-10 md:p-20 text-center border-2 border-dashed border-gray-100">
           <i className="fa-solid fa-user-slash text-6xl text-gray-100 mb-6"></i>
           <h3 className="text-xl font-black text-gray-900">No Clients Found</h3>
           <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* member profile modal removed - member info now visible on cards */}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>

    </div>
  );
};

export default AssignedMembers;