import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ToastContainer, toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Feedbacks = () => {
  // --- MOCK DATA ---
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      member: "Riya Patel",
      avatar: "https://i.pravatar.cc/150?u=101",
      type: "Trainer",
      target: "Raj Mehta",
      rating: 5,
      message: "Raj is an amazing trainer! He really pushes me to my limits in a good way.",
      date: "2024-10-25",
      status: "New",
      visibility: "Public",
      reply: ""
    },
    {
      id: 2,
      member: "Amit Sharma",
      avatar: "https://i.pravatar.cc/150?u=102",
      type: "Facility",
      target: "Gym Floor",
      rating: 3,
      message: "The AC in the cardio section wasn't working properly yesterday.",
      date: "2024-10-24",
      status: "Reviewed",
      visibility: "Private",
      reply: "Maintenance team notified."
    },
    {
      id: 3,
      member: "John Doe",
      avatar: "https://i.pravatar.cc/150?u=103",
      type: "Plan",
      target: "Yearly Elite",
      rating: 2,
      message: "I feel the yearly plan is a bit expensive compared to the facilities.",
      date: "2024-10-20",
      status: "Resolved",
      visibility: "Private",
      reply: "Offered a discount on renewal."
    },
    {
      id: 4,
      member: "Sneha Gupta",
      avatar: "https://i.pravatar.cc/150?u=104",
      type: "Trainer",
      target: "Vikram Singh",
      rating: 5,
      message: "Best gym experience ever thanks to Vikram!",
      date: "2024-10-18",
      status: "New",
      visibility: "Public",
      reply: ""
    }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'analytics'
  const [filterRating, setFilterRating] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);

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

    // Alert for low ratings
    const lowRatings = feedbacks.filter(f => f.rating <= 2 && f.status === 'New').length;
    if (lowRatings > 0) {
      toast.error(`${lowRatings} Critical feedbacks need attention!`, { autoClose: 5000 });
    }

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- HELPERS ---
  const getRatingStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <i key={i} className={`fa-solid fa-star text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}></i>
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "New": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Reviewed": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      case "Resolved": return "bg-[#D9F17F] text-green-900 border-green-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // --- ACTIONS ---
  const handleOpenReply = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.reply || "");
    setShowReplyModal(true);
  };

  const handleSubmitReply = () => {
    setFeedbacks(prev => prev.map(f => 
      f.id === selectedFeedback.id ? { ...f, reply: replyText, status: "Reviewed" } : f
    ));
    toast.success("Response saved.");
    setShowReplyModal(false);
  };

  const updateStatus = (id, status) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    toast.info(`Status updated to ${status}`);
  };

  const toggleVisibility = (id) => {
    setFeedbacks(prev => prev.map(f => 
      f.id === id ? { ...f, visibility: f.visibility === "Public" ? "Private" : "Public" } : f
    ));
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this feedback permanently?")) {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      toast.info("Feedback removed.");
    }
  };

  // --- ANALYTICS DATA ---
  const ratingDist = [1, 2, 3, 4, 5].map(r => feedbacks.filter(f => f.rating === r).length);
  
  const chartData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [{
      label: "Feedback Count",
      data: ratingDist,
      backgroundColor: ["#ef4444", "#f97316", "#FEEF75", "#CDE7FE", "#D9F17F"],
      borderRadius: 6
    }]
  };

  // --- FILTERING ---
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.member.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === "All" || 
                          (filterRating === "High" && f.rating >= 4) || 
                          (filterRating === "Low" && f.rating <= 3);
    const matchesType = filterType === "All" || f.type === filterType;
    
    return matchesSearch && matchesRating && matchesType;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">Review ratings, suggestions, and complaints.</p>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
           <button 
             onClick={() => setViewState("list")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             All Feedback
           </button>
           <button 
             onClick={() => setViewState("analytics")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'analytics' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Analytics
           </button>
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {viewState === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center">
             <div className="relative flex-grow md:max-w-xs">
                <input
                   type="text"
                   placeholder="Search member or keyword..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
             </div>
             
             <div className="flex items-center gap-2">
                <select 
                   value={filterType} 
                   onChange={(e) => setFilterType(e.target.value)}
                   className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                >
                   <option value="All">All Types</option>
                   <option value="Trainer">Trainer</option>
                   <option value="Facility">Facility</option>
                   <option value="Plan">Plan</option>
                </select>

                <select 
                   value={filterRating} 
                   onChange={(e) => setFilterRating(e.target.value)}
                   className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                >
                   <option value="All">All Ratings</option>
                   <option value="High">High (4-5)</option>
                   <option value="Low">Low (1-3)</option>
                </select>
             </div>
          </div>

          {/* Feedback Grid */}
          <div className="grid grid-cols-1 gap-4">
             {filteredFeedbacks.map(fb => (
                <div key={fb.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                   <div className="flex flex-col md:flex-row justify-between gap-4">
                      
                      {/* User Info */}
                      <div className="flex gap-4">
                         <img src={fb.avatar} alt={fb.member} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                         <div>
                            <h3 className="font-bold text-gray-900 text-sm">{fb.member}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                               <span className="bg-gray-100 px-2 py-0.5 rounded">{fb.type}</span>
                               <span>• {fb.target}</span>
                               <span>• {fb.date}</span>
                            </div>
                            <div className="flex gap-1 mt-1.5">{getRatingStars(fb.rating)}</div>
                         </div>
                      </div>

                      {/* Status Badge */}
                      <div className="md:text-right flex flex-col items-start md:items-end gap-2">
                         <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(fb.status)}`}>
                            {fb.status}
                         </span>
                         <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${fb.visibility === 'Public' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {fb.visibility}
                         </span>
                      </div>
                   </div>

                   {/* Message */}
                   <div className="mt-4 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                      <p className="text-sm text-gray-700 italic">"{fb.message}"</p>
                      {fb.reply && (
                         <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-bold text-blue-600 mb-1">Admin Response:</p>
                            <p className="text-xs text-gray-600">{fb.reply}</p>
                         </div>
                      )}
                   </div>

                   {/* Actions */}
                   <div className="mt-4 flex gap-2 justify-end pt-3 border-t border-gray-100">
                      <button onClick={() => toggleVisibility(fb.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                         {fb.visibility === 'Public' ? 'Make Private' : 'Make Public'}
                      </button>
                      
                      {fb.status !== 'Resolved' && (
                         <button onClick={() => updateStatus(fb.id, "Resolved")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                            Mark Resolved
                         </button>
                      )}

                      <button onClick={() => handleOpenReply(fb)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#CDE7FE] text-blue-900 hover:bg-blue-200 transition-colors">
                         <i className="fa-solid fa-reply mr-1"></i> Reply
                      </button>

                      <button onClick={() => handleDelete(fb.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                         <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                   </div>
                </div>
             ))}
             {filteredFeedbacks.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                   <p>No feedback found.</p>
                </div>
             )}
          </div>
        </>
      )}

      {/* --- ANALYTICS VIEW --- */}
      {viewState === 'analytics' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Rating Distribution</h3>
               <div className="h-64">
                  <Bar data={chartData} options={{ maintainAspectRatio: false }} />
               </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Trainer Performance</h3>
               <div className="space-y-4">
                  {['Raj Mehta', 'Vikram Singh', 'Sneha Rathi'].map((trainer, idx) => {
                     // Mock calc
                     const score = idx === 0 ? 4.8 : idx === 1 ? 4.5 : 4.2; 
                     return (
                        <div key={trainer} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                           <span className="text-sm font-bold text-gray-700">{trainer}</span>
                           <div className="flex items-center gap-2">
                              <span className="text-yellow-500 font-bold text-sm">★ {score}</span>
                              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-yellow-400" style={{ width: `${(score/5)*100}%` }}></div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      )}

      {/* --- REPLY MODAL --- */}
      {showReplyModal && selectedFeedback && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Reply to {selectedFeedback.member}</h3>
                  <button onClick={() => setShowReplyModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <div className="p-6">
                  <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
                     <p className="text-xs text-blue-800 italic">"{selectedFeedback.message}"</p>
                  </div>
                  
                  <textarea 
                     rows="4"
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400 mb-4 resize-none"
                     placeholder="Type your response or internal note..."
                  ></textarea>

                  <button 
                     onClick={handleSubmitReply}
                     className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors cursor-pointer"
                  >
                     Send Response
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Feedbacks;