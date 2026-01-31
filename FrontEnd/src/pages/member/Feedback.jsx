import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast'; // Updated Toast
import { useGlobalContext } from "../../context/GlobalContext"; 
import { useTheme } from "../../context/ThemeContext"; // Import Context

const Feedback = () => {
   const { BACKEND_URL } = useGlobalContext(); 
   const { colors, theme } = useTheme(); // Consume Theme

  // --- STATE ---
  const [feedbacks, setFeedbacks] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("General"); 
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STYLE INJECTION ---
  useEffect(() => {
    // Only injecting FA
    const font = document.createElement("link");
    font.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    return () => { 
       document.head.removeChild(font);
    };
  }, []);

  // --- FETCH DATA ---
  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const isPreview = false; 
      
      if (!isPreview) {
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          const token = userInfo?.token;

          const res = await fetch(`${BACKEND_URL}/api/feedback/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) throw new Error("Failed to load feedback history");
          
          const data = await res.json();
          setFeedbacks(data);
      } else {
          // Mock
          setTimeout(() => {
             setFeedbacks([
                {
                   _id: "fb1",
                   type: "Trainer",
                   rating: 5,
                   comment: "Great session with Raj today!",
                   status: "Reviewed",
                   reply: "Thanks! Glad you enjoyed it.",
                   createdAt: "2024-10-25T10:00:00Z"
                }
             ]);
          }, 500);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load feedback history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  // --- DERIVED STATE ---
  const currentFeedback = feedbacks.find(fb => fb.type === activeTab);

  useEffect(() => {
    if (currentFeedback) {
      setFormData({
        rating: currentFeedback.rating,
        comment: currentFeedback.comment
      });
    } else {
      setFormData({
        rating: 5,
        comment: ""
      });
    }
  }, [activeTab, currentFeedback]);

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
       toast.error("Please write a comment.");
       return;
    }

    try {
      setIsSubmitting(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const url = currentFeedback 
        ? `${BACKEND_URL}/api/feedback/${currentFeedback._id}` 
        : `${BACKEND_URL}/api/feedback`; 
      
      const method = currentFeedback ? "PUT" : "POST";

      const payload = {
        ...formData,
        type: activeTab 
      };

      const isPreview = false;

      if (!isPreview) {
          const res = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
             const errData = await res.json();
             throw new Error(errData.message || "Failed to submit feedback");
          }
      } else {
          await new Promise(resolve => setTimeout(resolve, 800));
          const newFb = { 
             _id: currentFeedback ? currentFeedback._id : `new_${Date.now()}`,
             type: activeTab,
             ...formData,
             status: "Pending",
             createdAt: new Date().toISOString()
          };
          
          setFeedbacks(prev => {
             const others = prev.filter(f => f.type !== activeTab);
             return [...others, newFb];
          });
      }

      toast.success(currentFeedback ? "Feedback updated successfully!" : "Feedback submitted successfully!");
      if (!isPreview) fetchMyFeedback();

    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>Member Feedback</h1>
          <p className="text-sm md:text-base mt-1" style={{ color: colors.textMuted }}>Share your experience with us. Your voice matters!</p>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="p-1 rounded-xl border flex flex-wrap justify-center sm:inline-flex shadow-sm w-full sm:w-auto"
           style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        {["General", "Trainer", "Facility"].map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap`}
            style={{ 
               backgroundColor: activeTab === type ? colors.secondary : 'transparent',
               color: activeTab === type ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
            }}
          >
            {type}
            {feedbacks.some(fb => fb.type === type) && (
               <span className="ml-2 w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT: FORM */}
         <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="p-6 rounded-3xl border shadow-sm static lg:sticky lg:top-6"
                 style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold" style={{ color: colors.text }}>
                     {currentFeedback ? `Edit ${activeTab} Feedback` : `New ${activeTab} Feedback`}
                  </h3>
                  {currentFeedback && (
                     <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">
                        {currentFeedback.status}
                     </span>
                  )}
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating */}
                  <div>
                     <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Rating</label>
                     <div className="flex gap-2 justify-center p-3 rounded-xl border"
                          style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb', borderColor: colors.border }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({...formData, rating: star})}
                              className={`text-2xl transition-transform hover:scale-110 ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                           >
                              ★
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Comment */}
                  <div>
                     <label className="block text-xs font-bold mb-1" style={{ color: colors.textMuted }}>Your Experience</label>
                     <textarea 
                        rows="6"
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none transition-colors"
                        style={{ 
                           backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                           color: colors.text,
                           borderColor: colors.border
                        }}
                        placeholder={`Tell us about the ${activeTab.toLowerCase()}...`}
                     ></textarea>
                  </div>

                  <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
                     style={{ 
                        backgroundColor: currentFeedback ? colors.secondary : colors.text,
                        color: currentFeedback ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.background
                     }}
                  >
                     {isSubmitting 
                        ? "Saving..." 
                        : currentFeedback 
                           ? "Update Feedback" 
                           : "Submit Feedback"
                     }
                     {!isSubmitting && <i className={`fa-solid ${currentFeedback ? 'fa-pen-to-square' : 'fa-paper-plane'}`}></i>}
                  </button>
               </form>
            </div>
         </div>

         {/* RIGHT: CURRENT FEEDBACK DISPLAY */}
         <div className="lg:col-span-2 order-2 lg:order-2">
            <h3 className="font-bold mb-4 ml-1" style={{ color: colors.text }}>
               {currentFeedback ? "Submitted Feedback" : "No feedback yet"}
            </h3>
            
            {loading ? (
               <div className="text-center py-10" style={{ color: colors.textMuted }}>Loading...</div>
            ) : currentFeedback ? (
               <div className="p-6 rounded-3xl border shadow-sm"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 sm:gap-0">
                     <div>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase mb-2 ${
                           currentFeedback.type === 'Trainer' ? 'bg-blue-50 text-blue-600' : 
                           currentFeedback.type === 'Facility' ? 'bg-purple-50 text-purple-600' : 
                           'bg-gray-100 text-gray-600'
                        }`}>
                           {currentFeedback.type}
                        </span>
                        <div className="flex text-yellow-400 text-sm">
                           {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fa-star ${i < currentFeedback.rating ? 'fa-solid' : 'fa-regular text-gray-200'}`}></i>
                           ))}
                        </div>
                     </div>
                     <div className="text-left sm:text-right w-full sm:w-auto">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${currentFeedback.status === 'Reviewed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                           {currentFeedback.status}
                        </span>
                        <p className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                           {new Date(currentFeedback.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl border mb-4"
                       style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb', borderColor: colors.border }}>
                     <p className="text-sm leading-relaxed italic" style={{ color: colors.text }}>"{currentFeedback.comment}"</p>
                  </div>
                  
                  {/* Admin Reply */}
                  {currentFeedback.reply ? (
                     <div className="p-4 rounded-2xl border flex items-start gap-3"
                          style={{ backgroundColor: theme === 'dark' ? '#1e3a8a20' : '#eff6ff', borderColor: theme === 'dark' ? '#1e3a8a40' : '#dbeafe' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                             style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe', color: theme === 'dark' ? '#fff' : '#3b82f6' }}>
                           <i className="fa-solid fa-reply text-xs"></i>
                        </div>
                        <div>
                           <p className="text-xs font-bold mb-1" style={{ color: theme === 'dark' ? '#93c5fd' : '#1e3a8a' }}>Admin Response</p>
                           <p className="text-sm leading-relaxed" style={{ color: theme === 'dark' ? '#bfdbfe' : '#1e40af' }}>{currentFeedback.reply}</p>
                        </div>
                     </div>
                  ) : (
                     <p className="text-xs text-center italic mt-4" style={{ color: colors.textMuted }}>
                        Awaiting admin review...
                     </p>
                  )}
               </div>
            ) : (
               <div className="text-center py-16 rounded-[2.5rem] border border-dashed"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <i className="fa-regular fa-comment-dots text-4xl mb-3" style={{ color: colors.textMuted }}></i>
                  <p className="mb-2" style={{ color: colors.textMuted }}>You haven't submitted any {activeTab.toLowerCase()} feedback yet.</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Use the form on the left to share your thoughts!</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default Feedback;