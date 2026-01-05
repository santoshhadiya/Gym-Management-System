import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
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
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      member: "Riya Patel",
      avatar: "https://i.pravatar.cc/150?u=1",
      type: "Trainer",
      rating: 5,
      message: "Raj is an amazing trainer! He really pushes me to my limits in a good way.",
      date: "2024-10-25",
      status: "New",
      reply: ""
    },
    {
      id: 2,
      member: "Amit Sharma",
      avatar: "https://i.pravatar.cc/150?u=2",
      type: "Session",
      rating: 4,
      message: "Great session yesterday, but could we focus more on stretching next time?",
      date: "2024-10-24",
      status: "Reviewed",
      reply: "Noted Amit! Will incorporate more mobility work."
    },
    {
      id: 3,
      member: "Priya Shah",
      avatar: "https://i.pravatar.cc/150?u=3",
      type: "Trainer",
      rating: 2,
      message: "Felt a bit neglected during the group class. Need more form correction.",
      date: "2024-10-20",
      status: "Resolved",
      reply: "Apologies Priya. I will ensure personal attention in the next batch."
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

  // --- HELPERS ---
  const getRatingStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <i key={i} className={`fa-solid fa-star text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}></i>
    ));
  };

  const getStatusStyle = (status) => {
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
    if (!replyText.trim()) {
       toast.warn("Please enter a reply.");
       return;
    }
    setFeedbacks(prev => prev.map(f => 
      f.id === selectedFeedback.id ? { ...f, reply: replyText, status: "Reviewed" } : f
    ));
    toast.success("Reply posted successfully.");
    setShowReplyModal(false);
  };

  // --- ANALYTICS DATA ---
  const ratingDist = [1, 2, 3, 4, 5].map(r => feedbacks.filter(f => f.rating === r).length);
  const avgRating = (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1);
  
  const chartData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [{
      label: "Feedback Count",
      data: ratingDist,
      backgroundColor: ["#ef4444", "#f97316", "#FEEF75", "#CDE7FE", "#D9F17F"],
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
       x: { grid: { display: false } }, 
       y: { beginAtZero: true, ticks: { stepSize: 1 } } 
    }
  };

  // --- FILTERING ---
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.member.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === "All" || 
                          (filterRating === "High" && f.rating >= 4) || 
                          (filterRating === "Critical" && f.rating <= 2) ||
                          (filterRating === "Mid" && f.rating === 3);
    const matchesType = filterType === "All" || f.type === filterType;
    
    return matchesSearch && matchesRating && matchesType;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Member Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">Review ratings and improve your training quality.</p>
        </div>
        
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
           <button 
             onClick={() => setViewState("list")}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'list' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
           >
             Feedback List
           </button>
           <button 
             onClick={() => setViewState("analytics")}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'analytics' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
           >
             Performance
           </button>
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {viewState === 'list' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div className="bg-[#fcfdfd] p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Average Rating</p>
                   <h3 className="text-3xl font-black text-gray-900">{avgRating} <span className="text-lg text-yellow-400">★</span></h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-900 text-xl">
                   <i className="fa-solid fa-medal"></i>
                </div>
             </div>
             <div className="bg-[#fcfdfd] p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Total Reviews</p>
                   <h3 className="text-3xl font-black text-gray-900">{feedbacks.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-900 text-xl">
                   <i className="fa-regular fa-comments"></i>
                </div>
             </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center">
             <div className="relative flex-grow md:max-w-xs">
                <input
                   type="text"
                   placeholder="Search member..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
             </div>
             
             <div className="flex items-center gap-2 overflow-x-auto">
                <select 
                   value={filterType} 
                   onChange={(e) => setFilterType(e.target.value)}
                   className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                >
                   <option value="All">All Types</option>
                   <option value="Trainer">Trainer</option>
                   <option value="Session">Session</option>
                </select>

                <select 
                   value={filterRating} 
                   onChange={(e) => setFilterRating(e.target.value)}
                   className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                >
                   <option value="All">All Ratings</option>
                   <option value="High">High (4-5)</option>
                   <option value="Mid">Average (3)</option>
                   <option value="Critical">Critical (1-2)</option>
                </select>
             </div>
          </div>

          {/* Feedback Grid */}
          <div className="grid grid-cols-1 gap-4">
             {filteredFeedbacks.map(fb => (
                <div key={fb.id} className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${fb.rating <= 2 ? 'border-red-100 bg-red-50/20' : 'border-gray-100'}`}>
                   <div className="flex flex-col md:flex-row justify-between gap-4">
                      
                      {/* User Info */}
                      <div className="flex gap-4">
                         <img src={fb.avatar} alt={fb.member} className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                         <div>
                            <h3 className="font-bold text-gray-900 text-sm">{fb.member}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                               <span className="bg-gray-100 px-2 py-0.5 rounded">{fb.type}</span>
                               <span>• {fb.date}</span>
                            </div>
                            <div className="flex gap-1 mt-1.5">{getRatingStars(fb.rating)}</div>
                         </div>
                      </div>

                      {/* Status Badge */}
                      <div className="md:text-right flex flex-col items-start md:items-end gap-2">
                         <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyle(fb.status)}`}>
                            {fb.status}
                         </span>
                         {fb.rating <= 2 && (
                            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                               <i className="fa-solid fa-triangle-exclamation"></i> Critical
                            </span>
                         )}
                      </div>
                   </div>

                   {/* Message */}
                   <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                      <p className="text-sm text-gray-700 italic">"{fb.message}"</p>
                      {fb.reply && (
                         <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                               <i className="fa-solid fa-reply fa-flip-horizontal"></i> Your Reply:
                            </p>
                            <p className="text-xs text-gray-600">{fb.reply}</p>
                         </div>
                      )}
                   </div>

                   {/* Actions */}
                   <div className="mt-4 flex gap-2 justify-end pt-2">
                      <button 
                         onClick={() => handleOpenReply(fb)}
                         className="px-4 py-2 rounded-lg text-xs font-bold bg-[#CDE7FE] text-blue-900 hover:bg-blue-200 transition-colors flex items-center gap-2"
                      >
                         <i className="fa-solid fa-reply"></i> {fb.reply ? "Edit Reply" : "Reply"}
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
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Rating Distribution</h3>
               <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
               </div>
            </div>
            
            <div className="bg-[#f8fbff] border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl mb-4">
                  <i className="fa-solid fa-chart-line"></i>
               </div>
               <h3 className="font-bold text-gray-900 text-lg">Performance Summary</h3>
               <p className="text-sm text-gray-600 mt-2 max-w-xs">
                  Your average rating is <span className="font-bold text-blue-600">{avgRating}</span>. Keep up the good work! Focus on consistency in session quality.
               </p>
            </div>
         </div>
      )}

      {/* --- REPLY MODAL --- */}
      {showReplyModal && selectedFeedback && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in duration-200">
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
                     placeholder="Type your response or acknowledgment..."
                  ></textarea>

                  <div className="flex gap-3">
                     <button onClick={() => setShowReplyModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
                     <button 
                        onClick={handleSubmitReply}
                        className="flex-1 py-2.5 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors"
                     >
                        Post Reply
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Feedbacks;