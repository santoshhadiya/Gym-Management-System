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
  const [selectedMember, setSelectedMember] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
  const handleViewProfile = (member) => {
    setSelectedMember(member);
    setShowProfileModal(true);
  };

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
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-10 font-sans px-4 sm:px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#121212]">Client Management</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Tracking {members.length} athletes assigned to you.</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40">
         <div className="relative flex-grow w-full md:w-auto md:max-w-xs">
            <input
               type="text"
               placeholder="Search clients..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:outline-none focus:border-[#CDE7FE] focus:bg-white text-sm transition-all"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
         </div>
         
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {['All', 'Weight Loss', 'Muscle Gain', 'Stamina Boost'].map(goal => (
               <button
                  key={goal}
                  onClick={() => setFilterGoal(goal)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredMembers.map((member) => (
            <div key={member._id} className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              
              {/* Card Header */}
              <div className="p-5 flex items-start gap-4">
                 <img src={member.image} alt={member.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0" />
                 <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-[#121212] truncate">{member.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 truncate">{member.plan}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(member.status)}`}>
                       {member.status}
                    </span>
                 </div>
                 <button onClick={() => handleViewProfile(member)} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-[#D9F17F] hover:text-[#121212] transition-all shrink-0">
                    <i className="fa-solid fa-arrow-right -rotate-45 text-sm"></i>
                 </button>
              </div>

              {/* Stats Strip */}
              <div className="px-5 py-2">
                 <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/50 rounded-2xl p-3 border border-gray-50">
                    <div className="text-center">
                       <p className="font-black text-[#121212] text-sm mb-0.5">{member.details.weight}kg</p>
                       <p>Weight</p>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="text-center">
                       <p className="font-black text-[#121212] text-sm mb-0.5">{member.details.height}cm</p>
                       <p>Height</p>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="text-center">
                       <span className={`px-2 py-0.5 rounded-md ${getProgressColor(member.progress)} font-black`}>
                          {member.progress === 'On Track' ? 'GO' : '!'}
                       </span>
                       <p className="mt-1">Track</p>
                    </div>
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 pb-5 pt-3 flex gap-3">
                 <Link to={`/trainer/chat/member`} className="flex-1 py-3 bg-white border-2 border-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2 hover:bg-[#CDE7FE] hover:text-blue-900 hover:border-transparent transition-all">
                    <i className="fa-regular fa-comment-dots"></i> Chat
                 </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-10 text-center border-2 border-dashed border-gray-100">
           <i className="fa-solid fa-user-slash text-5xl text-gray-100 mb-4"></i>
           <h3 className="text-lg font-black text-gray-900">No Clients Found</h3>
           <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* --- MEMBER PROFILE MODAL --- */}
      {showProfileModal && selectedMember && (
         <div className="fixed inset-0 bg-[#121212]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl animate-fade-in relative shadow-2xl my-auto">
               
               {/* Modal Header */}
               <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-[2.5rem] z-10">
                  <h3 className="font-black text-[#121212] text-sm uppercase tracking-widest">Client Intelligence</h3>
                  <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#121212] transition-all">
                     <i className="fa-solid fa-xmark"></i>
                  </button>
               </div>

               <div className="p-6">
                  {/* Profile Summary */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 text-center sm:text-left">
                     <img src={selectedMember.image} alt={selectedMember.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" />
                     <div className="flex-1">
                        <h2 className="text-2xl font-black text-[#121212] mb-1">{selectedMember.name}</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                          {selectedMember.plan} • Assigned {selectedMember.assignedDate}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                           <span className="bg-[#CDE7FE] text-blue-900 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">{selectedMember.goal}</span>
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getProgressColor(selectedMember.progress)}`}>
                              {selectedMember.progress}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                     {[
                        { label: "Weight", value: `${selectedMember.details.weight} kg` },
                        { label: "Height", value: `${selectedMember.details.height} cm` },
                        { label: "Age", value: selectedMember.details.age },
                        { label: "Attendance", value: `${selectedMember.details.attendance}%` },
                     ].map((stat, i) => (
                        <div key={i} className="bg-gray-50/50 p-3 rounded-2xl text-center border border-gray-50">
                           <p className="text-base font-black text-[#121212]">{stat.value}</p>
                           <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-0.5">{stat.label}</p>
                        </div>
                     ))}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                     <button onClick={() => handleAction("Create Workout", selectedMember.name)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#CDE7FE] hover:shadow-md transition-all text-left group flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#CDE7FE] rounded-xl flex items-center justify-center text-blue-900 group-hover:scale-110 transition-transform shrink-0">
                           <i className="fa-solid fa-dumbbell"></i>
                        </div>
                        <div>
                           <p className="font-black text-[#121212] text-xs uppercase tracking-wider">Workout</p>
                           <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">Update Plan</p>
                        </div>
                     </button>
                     <button onClick={() => handleAction("Update Diet", selectedMember.name)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#D9F17F] hover:shadow-md transition-all text-left group flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#D9F17F] rounded-xl flex items-center justify-center text-green-900 group-hover:scale-110 transition-transform shrink-0">
                           <i className="fa-solid fa-carrot"></i>
                        </div>
                        <div>
                           <p className="font-black text-[#121212] text-xs uppercase tracking-wider">Nutrition</p>
                           <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">Dietary Map</p>
                        </div>
                     </button>
                  </div>

                  {/* Footer */}
                  <Link to="/trainer/chat/member" className="w-full py-4 bg-[#121212] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#D9F17F] hover:text-[#121212] transition-all text-center block shadow-lg shadow-[#121212]/10">
                     Initiate Communication
                  </Link>
               </div>
            </div>
         </div>
      )}

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