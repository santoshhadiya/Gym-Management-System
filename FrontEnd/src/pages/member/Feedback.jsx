import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext"; 


const Feedback = () => {
   const {BACKEND_URL}=useGlobalContext() 

  // --- STATE ---
  const [feedbacks, setFeedbacks] = useState([]); // User's feedback history
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("General"); // General, Trainer, Facility
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      
      // Mock Data for Preview if no backend available
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
          // Fallback Mock Data for Preview
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
  // Find feedback for the currently active tab
  const currentFeedback = feedbacks.find(fb => fb.type === activeTab);

  // Populate form when tab changes
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
  }, [activeTab, currentFeedback]); // Re-run when tab switches or data loads

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
       toast.warn("Please write a comment.");
       return;
    }

    try {
      setIsSubmitting(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      // Determine URL and Method based on whether we are Editing or Creating
      const url = currentFeedback 
        ? `${BACKEND_URL}/api/feedback/${currentFeedback._id}` // PUT (Edit)
        : `${BACKEND_URL}/api/feedback`; // POST (Create)
      
      const method = currentFeedback ? "PUT" : "POST";

      const payload = {
        ...formData,
        type: activeTab 
      };

      // Mock Submission for Preview
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
          // Simulate API delay & update local state for preview
          await new Promise(resolve => setTimeout(resolve, 800));
          const newFb = { 
             _id: currentFeedback ? currentFeedback._id : `new_${Date.now()}`,
             type: activeTab,
             ...formData,
             status: "Pending",
             createdAt: new Date().toISOString()
          };
          
          setFeedbacks(prev => {
             // Remove old if exists, add new
             const others = prev.filter(f => f.type !== activeTab);
             return [...others, newFb];
          });
      }

      toast.success(currentFeedback ? "Feedback updated successfully!" : "Feedback submitted successfully!");
      if (!isPreview) fetchMyFeedback(); // Refresh list from backend

    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Member Feedback</h1>
          <p className="text-gray-500 mt-1">Share your experience with us. Your voice matters!</p>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="bg-white p-1 rounded-xl border border-gray-200 inline-flex shadow-sm">
        {["General", "Trainer", "Facility"].map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === type 
                ? "bg-gray-900 text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            {type}
            {feedbacks.some(fb => fb.type === type) && (
               <span className="ml-2 w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT: FORM (Create or Edit) */}
         <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">
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
                     <label className="block text-xs font-bold text-gray-500 mb-2">Rating</label>
                     <div className="flex gap-2 justify-center bg-gray-50 p-3 rounded-xl border border-gray-200">
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
                     <label className="block text-xs font-bold text-gray-500 mb-1">Your Experience</label>
                     <textarea 
                        rows="6"
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder={`Tell us about the ${activeTab.toLowerCase()}...`}
                     ></textarea>
                  </div>

                  <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className={`w-full py-3 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2 ${
                        isSubmitting ? 'bg-gray-400' : currentFeedback ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'
                     }`}
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
         <div className="lg:col-span-2">
            <h3 className="font-bold text-gray-900 mb-4 ml-1">
               {currentFeedback ? "Submitted Feedback" : "No feedback yet"}
            </h3>
            
            {loading ? (
               <div className="text-center py-10 text-gray-400">Loading...</div>
            ) : currentFeedback ? (
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
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
                     <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${currentFeedback.status === 'Reviewed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                           {currentFeedback.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                           {new Date(currentFeedback.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                     <p className="text-gray-700 text-sm leading-relaxed italic">"{currentFeedback.comment}"</p>
                  </div>
                  
                  {/* Display Admin Reply if Exists */}
                  {currentFeedback.reply ? (
                     <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                           <i className="fa-solid fa-reply text-xs"></i>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-blue-900 mb-1">Admin Response</p>
                           <p className="text-sm text-blue-800 leading-relaxed">{currentFeedback.reply}</p>
                        </div>
                     </div>
                  ) : (
                     <p className="text-xs text-gray-400 text-center italic mt-4">
                        Awaiting admin review...
                     </p>
                  )}
               </div>
            ) : (
               <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <i className="fa-regular fa-comment-dots text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 mb-2">You haven't submitted any {activeTab.toLowerCase()} feedback yet.</p>
                  <p className="text-xs text-gray-400">Use the form on the left to share your thoughts!</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default Feedback;