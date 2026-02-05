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
import { toast } from 'react-hot-toast'; 
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Feedbacks = () => {
   const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
   const { colors, theme } = useTheme(); 

  // --- STATE ---
  const [feedbacks, setFeedbacks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Track which item is being verified
  const [isSubmittingReply, setIsSubmittingReply] = useState(false); // Track modal submission
  
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");

  // --- STYLE INJECTION ---
  useEffect(() => {
    const font = document.createElement("link");
    font.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    font.rel = "stylesheet";
    document.head.appendChild(font);
    return () => { document.head.removeChild(font); };
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

  const handleVerifyStatus = async (id) => {
    try {
      setProcessingId(id);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const res = await fetch(`${BACKEND_URL}/api/feedback/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Reviewed" })
      });

      if (!res.ok) throw new Error("Failed to verify");

      toast.success("Feedback verified for public view");
      // Optimistic local update
      setFeedbacks(prev => prev.map(fb => fb._id === id ? { ...fb, status: "Reviewed" } : fb));
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
       toast.error("Please write a reply.");
       return;
    }

    try {
      setIsSubmittingReply(true);
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

      toast.success("Reply sent and marked as Reviewed");
      setShowReplyModal(false);
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // --- HELPERS ---
  const Spinner = ({ size = "w-4 h-4", color = "border-current" }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
  );

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesType = filterType === "All" || fb.type === filterType;
    const matchesStatus = filterStatus === "All" || 
                          (filterStatus === "Reviewed" ? fb.status === "Reviewed" : fb.status !== "Reviewed");
    return matchesType && matchesStatus;
  });

  // --- CHART LOGIC (UNCHANGED) ---
  const ratingsCount = [0, 0, 0, 0, 0]; 
  filteredFeedbacks.forEach(fb => { if (fb.rating >= 1 && fb.rating <= 5) ratingsCount[fb.rating - 1]++; });
  const chartData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [{ label: "Feedback Count", data: ratingsCount, backgroundColor: ["#fee2e2", colors.accent, colors.secondary, "#dcfce7", colors.primary], borderRadius: 8 }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: colors.border }, ticks: { color: colors.textMuted } }, x: { grid: { display: false }, ticks: { color: colors.textMuted } } }
  };

  if (loading && feedbacks.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ color: colors.textMuted }}>
       <Spinner size="w-12 h-12" color="border-primary" />
       <p className="mt-4 font-medium">Fetching member feedback...</p>
    </div>
  );

  return (
    <div 
      className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
      style={{color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feedback Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Verify testimonials to show them on the public home page.</p>
        </div>
        
        <div className="flex gap-3">
           <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm outline-none border transition-all" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}>
              <option value="All">All Types</option>
              <option value="General">General</option>
              <option value="Trainer">Trainer</option>
              <option value="Facility">Facility</option>
           </select>
           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm outline-none border transition-all" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed (Public)</option>
           </select>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="space-y-6">
            <div className="p-6 rounded-3xl border" style={{ backgroundColor: theme === 'dark' ? colors.card : '#f8fbff', borderColor: colors.border }}>
               <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.secondary }}>Total Responses</p>
               <h2 className="text-4xl font-black">{filteredFeedbacks.length}</h2>
            </div>
            <div className="p-6 rounded-3xl border" style={{ backgroundColor: theme === 'dark' ? colors.card : '#f0fdf4', borderColor: colors.border }}>
               <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>Avg Rating</p>
               <h2 className="text-4xl font-black flex items-center gap-2">
                  {(filteredFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (filteredFeedbacks.length || 1)).toFixed(1)}
                  <span className="text-xl" style={{ color: colors.accent }}>★</span>
               </h2>
            </div>
         </div>
         <div className="lg:col-span-2 p-6 rounded-3xl border h-64" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <h3 className="font-bold mb-4 text-sm">Rating Distribution</h3>
            <div className="h-48"><Bar data={chartData} options={chartOptions} /></div>
         </div>
      </div>

      {/* FEEDBACK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {filteredFeedbacks.map((fb) => (
            <div key={fb._id} className="p-6 rounded-[2.5rem] border transition-all flex flex-col justify-between" style={{ backgroundColor: colors.card, borderColor: fb.status !== 'Reviewed' ? colors.accent : colors.border }}>
               <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center font-bold" style={{ borderColor: colors.border }}>
                           {fb.avatar ? (
                              <img src={`${BACKEND_URL}/${fb.avatar}`} alt={fb.member} className="w-full h-full object-cover" />
                           ) : (
                              <span style={{ color: colors.textMuted }}>{fb.member[0]}</span>
                           )}
                        </div>
                        <div>
                           <h4 className="font-bold text-sm">{fb.member}</h4>
                           <p className="text-[10px]" style={{ color: colors.textMuted }}>{new Date(fb.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border" style={{ backgroundColor: fb.type === 'Trainer' ? colors.secondary : colors.accent, color: theme === 'dark' ? '#fff' : '#1e3a8a', borderColor: colors.border }}>
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
                     <div className="mb-4 p-3 rounded-xl border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                        <p className="text-xs"><span className="font-bold" style={{ color: colors.secondary }}>Admin:</span> {fb.reply}</p>
                     </div>
                  )}
               </div>

               <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${fb.status === 'Reviewed' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                     <span className="text-xs font-bold" style={{ color: fb.status === 'Reviewed' ? '#10b981' : colors.textMuted }}>{fb.status}</span>
                  </div>
                  
                  <div className="flex gap-2">
                     {fb.status !== 'Reviewed' && (
                        <button 
                           disabled={processingId === fb._id}
                           onClick={() => handleVerifyStatus(fb._id)}
                           className="text-xs font-bold px-4 py-1.5 rounded-lg border transition-all flex items-center gap-2 hover:bg-gray-50"
                           style={{ color: colors.text, borderColor: colors.border }}
                        >
                           {processingId === fb._id ? <Spinner size="w-3 h-3" /> : "Verify"}
                        </button>
                     )}
                     <button 
                        onClick={() => handleReplyClick(fb)}
                        className="text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                        style={{ backgroundColor: colors.text, color: colors.background }}
                     >
                        {fb.reply ? "Edit Reply" : "Reply"}
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* --- REPLY MODAL --- */}
      {showReplyModal && selectedFeedback && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden" style={{ backgroundColor: colors.card }}>
               <div className="px-8 py-6 border-b flex justify-between items-center" style={{ borderColor: colors.border }}>
                  <h3 className="font-bold text-lg">Reply to {selectedFeedback.member}</h3>
                  <button onClick={() => setShowReplyModal(false)}><i className="fa-solid fa-xmark text-xl"></i></button>
               </div>
               <div className="p-8">
                  <div className="p-4 rounded-2xl mb-6 border italic text-sm" style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.textMuted }}>
                     "{selectedFeedback.message}"
                  </div>
                  <textarea 
                     disabled={isSubmittingReply}
                     rows="4" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                     className="w-full rounded-2xl p-4 text-sm outline-none border focus:ring-2 disabled:opacity-50"
                     style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                     placeholder="Share your response..."
                  ></textarea>
                  <button 
                     disabled={isSubmittingReply}
                     onClick={handleSubmitReply}
                     className="w-full py-4 font-bold rounded-2xl shadow-lg transition-all mt-6 flex items-center justify-center gap-2"
                     style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                  >
                     {isSubmittingReply ? <Spinner color="border-current" /> : "Send & Approve"}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Feedbacks;