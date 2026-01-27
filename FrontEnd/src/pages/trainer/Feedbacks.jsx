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

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const Feedbacks = () => {
  // --- STATE ---
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");

  // --- STYLE INJECTION ---
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    const font = document.createElement("link");
    font.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    return () => { 
       document.head.removeChild(link); 
       document.head.removeChild(font);
    };
  }, []);

  // --- FETCH DATA ---
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      // Ensure we are fetching from the real backend endpoint
      const res = await fetch(`${BACKEND_URL}/api/feedback/trainer`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load feedbacks");
      
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // --- ACTIONS ---
  const handleReplyClick = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.reply || "");
    setShowReplyModal(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      await fetch(`${BACKEND_URL}/api/feedback/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      toast.success("Status updated");
      fetchFeedbacks();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
       toast.warn("Please write a reply.");
       return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const res = await fetch(`${BACKEND_URL}/api/feedback/${selectedFeedback._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (!res.ok) throw new Error("Reply failed");

      toast.success("Reply sent successfully");
      setShowReplyModal(false);
      setReplyText("");
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- FILTERING ---
  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesType = filterType === "All" || fb.type === filterType;
    const matchesStatus = filterStatus === "All" || 
                          (filterStatus === "Reviewed" ? fb.status === "Reviewed" : fb.status !== "Reviewed");
    return matchesType && matchesStatus;
  });

  // --- CHART DATA ---
  const ratingsCount = [0, 0, 0, 0, 0]; // 1 to 5 stars
  filteredFeedbacks.forEach(fb => {
     if (fb.rating >= 1 && fb.rating <= 5) {
        ratingsCount[fb.rating - 1]++;
     }
  });

  const chartData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Feedback Count",
        data: ratingsCount,
        backgroundColor: [
          "#fee2e2", "#ffedd5", "#fef9c3", "#dcfce7", "#bbf7d0",
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Review member ratings and respond to suggestions.</p>
        </div>
        
        <div className="flex gap-3">
           
           
           <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
           >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
           </select>
        </div>
      </div>

      {/* STATS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="space-y-6">
            <div className="bg-[#f8fbff] p-6 rounded-3xl border border-blue-50">
               <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Total Feedback</p>
               <h2 className="text-4xl font-black text-gray-900">{filteredFeedbacks.length}</h2>
            </div>
            <div className="bg-[#f0fdf4] p-6 rounded-3xl border border-green-50">
               <p className="text-xs text-green-500 font-bold uppercase tracking-wider mb-2">Avg Rating</p>
               <h2 className="text-4xl font-black text-gray-900 flex items-center gap-2">
                  {(filteredFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (filteredFeedbacks.length || 1)).toFixed(1)}
                  <span className="text-xl text-green-400">★</span>
               </h2>
            </div>
         </div>

         <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-64">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Rating Distribution</h3>
            <div className="h-48">
               <Bar data={chartData} options={chartOptions} />
            </div>
         </div>
      </div>

      {/* FEEDBACK LIST */}
      {loading ? (
         <div className="text-center py-20 text-gray-400">Loading feedback...</div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeedbacks.map((fb) => (
               <div key={fb._id} className={`p-6 rounded-[2rem] border transition-all hover:shadow-md ${fb.status === 'New' || fb.status === 'Pending' ? 'bg-white border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        {fb.avatar ? (
                           <img src={fb.avatar} alt={fb.member} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                              {fb.member[0]}
                           </div>
                        )}
                        <div>
                           <h4 className="font-bold text-gray-900 text-sm">{fb.member}</h4>
                           <p className="text-[10px] text-gray-400">{new Date(fb.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${fb.type === 'Trainer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {fb.type}
                     </span>
                  </div>

                  <div className="mb-4">
                     <div className="flex gap-1 mb-2 text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                           <i key={i} className={`fa-star ${i < fb.rating ? 'fa-solid' : 'fa-regular text-gray-200'}`}></i>
                        ))}
                     </div>
                     <p className="text-gray-600 text-sm italic">"{fb.message}"</p>
                  </div>

                  {fb.reply && (
                     <div className="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-50">
                        <p className="text-xs text-blue-800"><span className="font-bold">Admin Reply:</span> {fb.reply}</p>
                     </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                     <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${fb.status === 'Reviewed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-medium text-gray-500">{fb.status}</span>
                     </div>
                     
                     
                     
                  </div>

               </div>
            ))}
            {filteredFeedbacks.length === 0 && (
               <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-[2rem]">
                  <p>No feedback found.</p>
               </div>
            )}
         </div>
      )}

      {/* --- REPLY MODAL --- */}
      {showReplyModal && selectedFeedback && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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