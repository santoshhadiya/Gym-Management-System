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
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

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
   const { BACKEND_URL } = useGlobalContext();
   const { colors, theme } = useTheme(); // Access custom colors and current theme

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
    // Note: react-toastify link removed as it is handled globally
    const font = document.createElement("link");
    font.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    return () => { 
       document.head.removeChild(font);
    };
  }, []);

  // --- FETCH DATA ---
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const res = await fetch(`${BACKEND_URL}/api/feedback`, {
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
       toast.error("Please write a reply.");
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
  const ratingsCount = [0, 0, 0, 0, 0]; 
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
          "#fee2e2", 
          colors.accent, // Yellow
          colors.secondary, // Soft Blue
          "#dcfce7", 
          colors.primary, // Lime Green
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
      y: { 
        beginAtZero: true, 
        grid: { color: colors.border },
        ticks: { color: colors.textMuted }
      },
      x: { 
        grid: { display: false },
        ticks: { color: colors.textMuted }
      }
    }
  };

  return (
    <div 
      className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen relative transition-colors duration-300"
      style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Feedback Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Review member ratings and respond to suggestions.</p>
        </div>
        
        <div className="flex gap-3">
           <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, color: colors.text, '--tw-ring-color': colors.secondary }}
           >
              <option value="All">All Types</option>
              <option value="General">General</option>
              <option value="Trainer">Trainer</option>
              <option value="Facility">Facility</option>
           </select>
           
           <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, color: colors.text, '--tw-ring-color': colors.secondary }}
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
            <div className="p-6 rounded-3xl border transition-colors" style={{ backgroundColor: theme === 'dark' ? colors.card : '#f8fbff', borderColor: colors.border }}>
               <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.secondary }}>Total Feedback</p>
               <h2 className="text-4xl font-black" style={{ color: colors.text }}>{filteredFeedbacks.length}</h2>
            </div>
            <div className="p-6 rounded-3xl border transition-colors" style={{ backgroundColor: theme === 'dark' ? colors.card : '#f0fdf4', borderColor: colors.border }}>
               <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>Avg Rating</p>
               <h2 className="text-4xl font-black flex items-center gap-2" style={{ color: colors.text }}>
                  {(filteredFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (filteredFeedbacks.length || 1)).toFixed(1)}
                  <span className="text-xl" style={{ color: colors.accent }}>★</span>
               </h2>
            </div>
         </div>

         <div className="lg:col-span-2 p-6 rounded-3xl border shadow-sm h-64 transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <h3 className="font-bold mb-4 text-sm" style={{ color: colors.text }}>Rating Distribution</h3>
            <div className="h-48">
               < Bar data={chartData} options={chartOptions} />
            </div>
         </div>
      </div>

      {/* FEEDBACK LIST */}
      {loading ? (
         <div className="text-center py-20" style={{ color: colors.textMuted }}>Loading feedback...</div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeedbacks.map((fb) => (
               <div 
                  key={fb._id} 
                  className={`p-6 rounded-[2rem] border transition-all hover:shadow-md`}
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: (fb.status === 'New' || fb.status === 'Pending') ? colors.accent : colors.border 
                  }}
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        {fb.avatar ? (
                           <img src={fb.avatar} alt={fb.member} className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: colors.border }} />
                        ) : (
                           <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: colors.background, color: colors.textMuted }}>
                              {fb.member[0]}
                           </div>
                        )}
                        <div>
                           <h4 className="font-bold text-sm" style={{ color: colors.text }}>{fb.member}</h4>
                           <p className="text-[10px]" style={{ color: colors.textMuted }}>{new Date(fb.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <span 
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border"
                        style={{ 
                          backgroundColor: fb.type === 'Trainer' ? colors.secondary : colors.accent, 
                          color: fb.type === 'Trainer' ? (theme === 'dark' ? '#fff' : '#1e3a8a') : (theme === 'dark' ? '#fff' : '#854d0e'),
                          borderColor: colors.border 
                        }}
                     >
                        {fb.type}
                     </span>
                  </div>

                  <div className="mb-4">
                     <div className="flex gap-1 mb-2 text-xs" style={{ color: colors.accent }}>
                        {[...Array(5)].map((_, i) => (
                           <i key={i} className={`fa-star ${i < fb.rating ? 'fa-solid' : 'fa-regular'}`} style={{ opacity: i < fb.rating ? 1 : 0.2 }}></i>
                        ))}
                     </div>
                     <p className="text-sm italic" style={{ color: colors.text }}>"{fb.message}"</p>
                  </div>

                  {fb.reply && (
                     <div className="mb-4 p-3 rounded-xl border transition-colors" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                        <p className="text-xs" style={{ color: colors.text }}><span className="font-bold" style={{ color: colors.secondary }}>Admin Reply:</span> {fb.reply}</p>
                     </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: colors.border }}>
                     <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${fb.status === 'Reviewed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-medium" style={{ color: colors.textMuted }}>{fb.status}</span>
                     </div>
                     
                     <div className="flex gap-2">
                        {fb.status !== 'Reviewed' && (
                           <button 
                              onClick={() => handleStatusChange(fb._id, "Reviewed")}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:opacity-70"
                              style={{ color: colors.textMuted, backgroundColor: colors.background }}
                           >
                              Mark Read
                           </button>
                        )}
                        <button 
                           onClick={() => handleReplyClick(fb)}
                           className="text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                           style={{ backgroundColor: colors.text, color: colors.background }}
                        >
                           {fb.reply ? "Edit Reply" : "Reply"}
                        </button>
                     </div>
                  </div>
               </div>
            ))}
            {filteredFeedbacks.length === 0 && (
               <div className="col-span-full text-center py-12 rounded-[2rem] border border-dashed" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.textMuted }}>
                  <p>No feedback found.</p>
               </div>
            )}
         </div>
      )}

      {/* --- REPLY MODAL --- */}
      {showReplyModal && selectedFeedback && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: colors.card }}>
               <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                  <h3 className="font-bold" style={{ color: colors.text }}>Reply to {selectedFeedback.member}</h3>
                  <button onClick={() => setShowReplyModal(false)} style={{ color: colors.textMuted }}>
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <div className="p-6">
                  <div className="p-3 rounded-xl mb-4 border transition-colors" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                     <p className="text-xs italic" style={{ color: colors.textMuted }}>"{selectedFeedback.message}"</p>
                  </div>
                  
                  <textarea 
                     rows="4"
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     className="w-full rounded-xl p-3 text-sm focus:outline-none transition-colors border"
                     style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, focusBorderColor: colors.secondary }}
                     placeholder="Type your response or internal note..."
                  ></textarea>

                  <button 
                     onClick={handleSubmitReply}
                     className="w-full py-3 font-bold rounded-xl shadow-sm transition-colors mt-4"
                     style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
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