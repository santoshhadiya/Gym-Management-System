import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Feedback = () => {
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
  const trainers = [
    { id: 1, name: "Raj Mehta", specialization: "Strength" },
    { id: 2, name: "Sneha Rathi", specialization: "Yoga" }
  ];

  const completedSessions = [
    { id: 101, date: "2024-10-24", type: "Personal Training", trainer: "Raj Mehta" },
    { id: 102, date: "2024-10-22", type: "Group Yoga", trainer: "Sneha Rathi" }
  ];

  const [feedbackHistory, setFeedbackHistory] = useState([
    { 
      id: 1, 
      type: "Trainer", 
      target: "Raj Mehta", 
      rating: 5, 
      comment: "Excellent guidance on form correction.", 
      status: "Reviewed",
      date: "2024-10-20"
    },
    { 
      id: 2, 
      type: "Facility", 
      target: "Gym Floor", 
      rating: 3, 
      comment: "AC was not cooling enough in the cardio area.", 
      status: "New",
      date: "2024-10-23"
    }
  ]);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("form"); // 'form', 'history'
  const [formData, setFormData] = useState({
    type: "Trainer", // Trainer, Session, Facility, General
    targetId: "", // Trainer ID or Session ID
    rating: 0,
    comment: ""
  });
  const [hoverRating, setHoverRating] = useState(0);

  // --- HANDLERS ---
  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.warn("Please select a star rating.");
      return;
    }
    if (!formData.comment.trim()) {
      toast.warn("Please add a comment.");
      return;
    }
    if ((formData.type === 'Trainer' || formData.type === 'Session') && !formData.targetId) {
      toast.warn(`Please select a ${formData.type}.`);
      return;
    }

    // Logic: One feedback per session check (Mock)
    if (formData.type === 'Session') {
       const alreadyReviewed = feedbackHistory.some(f => f.type === 'Session' && f.targetId === formData.targetId);
       if (alreadyReviewed) {
          toast.error("You have already submitted feedback for this session.");
          return;
       }
    }

    const newFeedback = {
      id: Date.now(),
      type: formData.type,
      target: getTargetName(),
      rating: formData.rating,
      comment: formData.comment,
      status: "New",
      date: new Date().toISOString().split('T')[0]
    };

    setFeedbackHistory([newFeedback, ...feedbackHistory]);
    toast.success("Feedback submitted successfully! Admin will review it shortly.");
    
    // Reset Form
    setFormData({ type: "Trainer", targetId: "", rating: 0, comment: "" });
    setActiveTab("history");
  };

  const getTargetName = () => {
    if (formData.type === 'Trainer') return trainers.find(t => t.id == formData.targetId)?.name || "Unknown Trainer";
    if (formData.type === 'Session') {
       const sess = completedSessions.find(s => s.id == formData.targetId);
       return sess ? `${sess.type} (${sess.date})` : "Unknown Session";
    }
    return formData.type === 'Facility' ? "Facility / Equipment" : "Overall Experience";
  };

  const getStatusStyle = (status) => {
    switch(status) {
       case "Reviewed": return "bg-blue-50 text-blue-700 border-blue-200";
       case "Resolved": return "bg-[#D9F17F] text-green-900 border-green-200";
       default: return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Feedback Center</h1>
          <p className="text-gray-500 mt-1">Help us improve your fitness experience.</p>
        </div>
        
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
           <button 
             onClick={() => setActiveTab("form")}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'form' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
           >
             Give Feedback
           </button>
           <button 
             onClick={() => setActiveTab("history")}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
           >
             My History
           </button>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10"></div>
           
           <div className="relative z-10 max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                 
                 {/* Type Selection */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Trainer', 'Session', 'Facility', 'General'].map(type => (
                       <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type, targetId: ""})}
                          className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                             formData.type === type 
                             ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105' 
                             : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                       >
                          {type}
                       </button>
                    ))}
                 </div>

                 {/* Dynamic Dropdowns */}
                 {formData.type === 'Trainer' && (
                    <div className="animate-fade-in">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Trainer</label>
                       <select 
                          value={formData.targetId} 
                          onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium cursor-pointer"
                       >
                          <option value="">-- Choose Trainer --</option>
                          {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>)}
                       </select>
                    </div>
                 )}

                 {formData.type === 'Session' && (
                    <div className="animate-fade-in">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Completed Session</label>
                       <select 
                          value={formData.targetId} 
                          onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium cursor-pointer"
                       >
                          <option value="">-- Choose Session --</option>
                          {completedSessions.map(s => <option key={s.id} value={s.id}>{s.type} with {s.trainer} ({s.date})</option>)}
                       </select>
                    </div>
                 )}

                 {/* Star Rating */}
                 <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rate your experience</label>
                    <div className="flex justify-center gap-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                          <button
                             key={star}
                             type="button"
                             onMouseEnter={() => setHoverRating(star)}
                             onMouseLeave={() => setHoverRating(0)}
                             onClick={() => handleRating(star)}
                             className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                          >
                             <i className={`fa-star ${star <= (hoverRating || formData.rating) ? 'fa-solid text-[#D9F17F]' : 'fa-regular text-gray-300'}`}></i>
                          </button>
                       ))}
                    </div>
                    <p className="text-sm font-bold text-gray-500 mt-2">
                       {formData.rating === 1 ? "Poor" : formData.rating === 2 ? "Fair" : formData.rating === 3 ? "Average" : formData.rating === 4 ? "Good" : formData.rating === 5 ? "Excellent" : "Select Rating"}
                    </p>
                 </div>

                 {/* Comment */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Comments / Suggestions</label>
                    <textarea 
                       rows="4"
                       value={formData.comment}
                       onChange={(e) => setFormData({...formData, comment: e.target.value})}
                       className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all resize-none"
                       placeholder="Tell us more about your experience..."
                    ></textarea>
                 </div>

                 {/* Submit */}
                 <button type="submit" className="w-full py-4 bg-[#D9F17F] text-green-900 rounded-xl font-bold text-lg hover:bg-green-300 transition-colors shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-0.5">
                    Submit Feedback
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- HISTORY SECTION --- */}
      {activeTab === 'history' && (
         <div className="space-y-4">
            {feedbackHistory.length > 0 ? feedbackHistory.map((fb) => (
               <div key={fb.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${fb.rating >= 4 ? 'bg-[#D9F17F] text-green-900' : fb.rating === 3 ? 'bg-[#FEEF75] text-yellow-900' : 'bg-red-100 text-red-700'}`}>
                           <i className={`fa-solid ${fb.rating >= 4 ? 'fa-face-smile' : fb.rating === 3 ? 'fa-face-meh' : 'fa-face-frown'}`}></i>
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900 text-lg">{fb.type} Feedback</h4>
                           <p className="text-xs text-gray-500">Target: {fb.target}</p>
                        </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(fb.status)}`}>
                        {fb.status}
                     </span>
                  </div>

                  <div className="ml-13 pl-3 border-l-2 border-gray-100">
                     <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                           <i key={i} className={`fa-solid fa-star text-xs ${i < fb.rating ? 'text-yellow-400' : 'text-gray-200'}`}></i>
                        ))}
                     </div>
                     <p className="text-gray-600 text-sm leading-relaxed">"{fb.comment}"</p>
                     <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase">{fb.date}</p>
                  </div>
                  
                  {fb.status === 'Reviewed' && (
                     <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
                        <i className="fa-solid fa-circle-info text-blue-500 mt-0.5 text-xs"></i>
                        <p className="text-xs text-blue-800">
                           <span className="font-bold">Admin Update:</span> Your feedback has been reviewed. Thank you for helping us improve!
                        </p>
                     </div>
                  )}
               </div>
            )) : (
               <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <i className="fa-regular fa-comment-dots text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No feedback submitted yet.</p>
               </div>
            )}
         </div>
      )}

    </div>
  );
};

export default Feedback;