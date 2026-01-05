import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const AssignedMembers = () => {
  // --- STYLE INJECTION ---
  useEffect(() => {
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- MOCK DATA ---
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Ravi Patel",
      image: "https://i.pravatar.cc/150?u=1",
      plan: "Yearly Elite",
      goal: "Weight Loss",
      status: "Active",
      assignedDate: "2024-01-10",
      progress: "On Track",
      lastActive: "2 hours ago",
      details: {
        age: 28,
        height: 175,
        weight: 82,
        targetWeight: 75,
        attendance: 85
      }
    },
    {
      id: 2,
      name: "Priya Shah",
      image: "https://i.pravatar.cc/150?u=2",
      plan: "Quarterly Pro",
      goal: "Muscle Gain",
      status: "Active",
      assignedDate: "2024-03-05",
      progress: "Needs Attention",
      lastActive: "1 day ago",
      details: {
        age: 24,
        height: 162,
        weight: 55,
        targetWeight: 60,
        attendance: 60
      }
    },
    {
      id: 3,
      name: "Amit Joshi",
      image: "https://i.pravatar.cc/150?u=3",
      plan: "Monthly Basic",
      goal: "Stamina Boost",
      status: "Inactive",
      assignedDate: "2024-02-15",
      progress: "Low Attendance",
      lastActive: "5 days ago",
      details: {
        age: 35,
        height: 178,
        weight: 78,
        targetWeight: 75,
        attendance: 30
      }
    }
  ]);

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGoal, setFilterGoal] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    toast.success(`${action} for ${memberName}`);
    // In real app, navigate to specific page e.g., /trainer/workout-plan?memberId=1
  };

  // --- FILTERING ---
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGoal = filterGoal === "All" || m.goal === filterGoal;
    return matchesSearch && matchesGoal;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Clients</h1>
          <p className="text-gray-500 mt-1">Manage training plans and track progress.</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
         <div className="relative flex-grow md:max-w-xs">
            <input
               type="text"
               placeholder="Search clients..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm transition-all"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
         </div>
         
         <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Weight Loss', 'Muscle Gain', 'Stamina Boost'].map(goal => (
               <button
                  key={goal}
                  onClick={() => setFilterGoal(goal)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                     filterGoal === goal 
                     ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' 
                     : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
               >
                  {goal}
               </button>
            ))}
         </div>
      </div>

      {/* MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
            
            {/* Card Header */}
            <div className="p-6 pb-0 flex items-start gap-4">
               <img src={member.image} alt={member.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm" />
               <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{member.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{member.plan}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusColor(member.status)}`}>
                     {member.status}
                  </span>
               </div>
               <button onClick={() => handleViewProfile(member)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#CDE7FE] hover:text-blue-600 transition-colors">
                  <i className="fa-solid fa-arrow-right -rotate-45"></i>
               </button>
            </div>

            {/* Stats Strip */}
            <div className="px-6 py-4 mt-2">
               <div className="flex justify-between items-center text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-center">
                     <p className="font-bold text-gray-900">{member.details.age}</p>
                     <p>Age</p>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="text-center">
                     <p className="font-bold text-gray-900">{member.details.weight}kg</p>
                     <p>Weight</p>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="text-center">
                     <span className={`px-2 py-0.5 rounded ${getProgressColor(member.progress)} font-bold`}>
                        {member.progress === 'On Track' ? 'On Track' : '! Alert'}
                     </span>
                     <p className="mt-1">Progress</p>
                  </div>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 pb-6 pt-2 flex gap-2">
               <Link to={`/trainer/chat/member`} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <i className="fa-regular fa-comment-dots"></i> Chat
               </Link>
               <button 
                  onClick={() => handleAction("Opened Plan for", member.name)}
                  className="flex-1 py-2.5 bg-[#D9F17F] text-green-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-300 transition-colors shadow-sm"
               >
                  <i className="fa-solid fa-clipboard-list"></i> Plan
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MEMBER PROFILE MODAL --- */}
      {showProfileModal && selectedMember && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in relative shadow-2xl">
               
               {/* Modal Header */}
               <div className="bg-[#f8f9fa] px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                  <h3 className="font-bold text-gray-900 text-lg">Client Profile</h3>
                  <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                     <i className="fa-solid fa-xmark"></i>
                  </button>
               </div>

               <div className="p-8">
                  {/* Profile Summary */}
                  <div className="flex items-start gap-6 mb-8">
                     <img src={selectedMember.image} alt={selectedMember.name} className="w-24 h-24 rounded-3xl object-cover shadow-sm border border-gray-200" />
                     <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedMember.name}</h2>
                        <p className="text-sm text-gray-500 mb-3">{selectedMember.plan} Member • Joined {selectedMember.assignedDate}</p>
                        <div className="flex gap-2">
                           <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{selectedMember.goal}</span>
                           <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getProgressColor(selectedMember.progress)}`}>
                              {selectedMember.progress}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                     {[
                        { label: "Age", value: selectedMember.details.age },
                        { label: "Height", value: `${selectedMember.details.height} cm` },
                        { label: "Weight", value: `${selectedMember.details.weight} kg` },
                        { label: "Attendance", value: `${selectedMember.details.attendance}%` },
                     ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                           <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-bold">{stat.label}</p>
                        </div>
                     ))}
                  </div>

                  {/* Actions Grid */}
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Management Actions</h4>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <button onClick={() => handleAction("Create Workout", selectedMember.name)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#CDE7FE] hover:shadow-md transition-all text-left group">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                           <i className="fa-solid fa-dumbbell"></i>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">Workout Plan</p>
                        <p className="text-xs text-gray-400">Create or Update</p>
                     </button>
                     <button onClick={() => handleAction("Update Diet", selectedMember.name)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#D9F17F] hover:shadow-md transition-all text-left group">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 transition-transform">
                           <i className="fa-solid fa-carrot"></i>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">Diet Plan</p>
                        <p className="text-xs text-gray-400">Manage Nutrition</p>
                     </button>
                     <button onClick={() => handleAction("Log Progress", selectedMember.name)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#FEEF75] hover:shadow-md transition-all text-left group">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-2 group-hover:scale-110 transition-transform">
                           <i className="fa-solid fa-chart-line"></i>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">Update Progress</p>
                        <p className="text-xs text-gray-400">Weight & Measurements</p>
                     </button>
                     <button onClick={() => handleAction("View History", selectedMember.name)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-purple-200 hover:shadow-md transition-all text-left group">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                           <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">Session History</p>
                        <p className="text-xs text-gray-400">Attendance Log</p>
                     </button>
                  </div>

                  {/* Footer */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                     <Link to="/trainer/chat/member" className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors text-center shadow-lg">
                        Message Member
                     </Link>
                  </div>

               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default AssignedMembers;