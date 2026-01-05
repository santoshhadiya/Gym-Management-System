import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const Profile = () => {
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

  // --- MOCK DATA (Trainer Details) ---
  const trainer = {
    id: 1,
    name: "Raj Mehta",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1374&auto=format&fit=crop",
    specialization: "Strength & Conditioning",
    experience: "5 Years",
    rating: 4.9,
    reviews: 120,
    bio: "Certified Strength Coach passionate about helping individuals build muscle and confidence. Specializes in hypertrophy training and injury prevention.",
    certifications: ["ACE Certified Personal Trainer", "CrossFit Level 1", "Sports Nutritionist"],
    availability: [
      { day: "Mon - Fri", time: "06:00 AM - 02:00 PM" },
      { day: "Saturday", time: "08:00 AM - 12:00 PM" },
      { day: "Sunday", time: "Off" }
    ],
    assignment: {
      status: "Active",
      since: "15 Jan 2024",
      plan: "Yearly Elite Membership"
    }
  };

  const [recentFeedbacks] = useState([
    { id: 1, user: "Amit S.", rating: 5, comment: "Amazing knowledge of biomechanics!" },
    { id: 2, user: "Priya K.", rating: 5, comment: "Best trainer for weight loss." }
  ]);

  // --- ACTIONS ---
  const handleChat = () => {
    // Navigate to chat page logic would go here
    toast.info(`Opening chat with ${trainer.name}...`);
  };

  const handleBookSession = () => {
    // Navigate to booking page logic
    toast.success("Redirecting to session booking...");
  };

  const handleFeedback = () => {
    // Open feedback modal logic
    toast.info("Feedback form opened.");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER / HERO SECTION --- */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[80px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[80px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Trainer Image */}
          <div className="relative group shrink-0">
             <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg">
                <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
             </div>
             <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                   <i className="fa-solid fa-star text-yellow-400"></i> {trainer.rating}
                </div>
             </div>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 text-center md:text-left w-full">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div>
                   <h1 className="text-3xl font-black text-gray-900 mb-1">{trainer.name}</h1>
                   <p className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {trainer.specialization}
                   </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-3">
                   <button 
                     onClick={handleChat}
                     className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center gap-2"
                   >
                      <i className="fa-regular fa-comment-dots"></i> Chat
                   </button>
                   <button 
                     onClick={handleBookSession}
                     className="px-5 py-2.5 bg-[#FEEF75] text-yellow-900 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors shadow-sm flex items-center gap-2"
                   >
                      <i className="fa-solid fa-calendar-plus"></i> Book
                   </button>
                </div>
             </div>

             <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mb-6">
                {trainer.bio}
             </p>

             {/* Assigned Info */}
             <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                   <i className="fa-solid fa-briefcase text-gray-400"></i> Experience: <span className="text-gray-800 font-bold">{trainer.experience}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                   <i className="fa-solid fa-link text-green-600"></i> Assigned: <span className="text-green-800 font-bold">{trainer.assignment.since}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                   <i className="fa-solid fa-layer-group text-gray-400"></i> Plan: <span className="text-gray-800 font-bold">{trainer.assignment.plan}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COL: Credentials & Availability */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Certifications */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-[#D9F17F]"></i> Certifications & Expertise
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trainer.certifications.map((cert, idx) => (
                     <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-[#CDE7FE] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                           <i className="fa-solid fa-medal"></i>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{cert}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Availability Schedule */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="fa-regular fa-clock text-[#FEEF75]"></i> Working Schedule
               </h3>
               <div className="space-y-3">
                  {trainer.availability.map((slot, idx) => (
                     <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-[#fcfdfd] border border-gray-100">
                        <span className="font-bold text-gray-700">{slot.day}</span>
                        <span className={`text-sm font-medium px-3 py-1 rounded-lg ${slot.time === 'Off' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>
                           {slot.time}
                        </span>
                     </div>
                  ))}
               </div>
               <p className="text-xs text-gray-400 mt-4 italic text-center">
                  * Schedule subject to change. Please confirm via chat before booking.
               </p>
            </div>

         </div>

         {/* RIGHT COL: Feedback & Stats */}
         <div className="space-y-6">
            
            {/* Rating Summary */}
            <div className="bg-[#f8fbff] rounded-[2rem] p-8 border border-blue-100 text-center">
               <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Member Rating</p>
               <h2 className="text-5xl font-black text-gray-900 mb-2">{trainer.rating}</h2>
               <div className="flex justify-center gap-1 mb-4 text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                     <i key={i} className={`fa-star ${i < Math.floor(trainer.rating) ? 'fa-solid' : 'fa-regular'}`}></i>
                  ))}
               </div>
               <p className="text-sm text-gray-500 mb-6">Based on {trainer.reviews} reviews</p>
               <button 
                  onClick={handleFeedback}
                  className="w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
               >
                  Write a Review
               </button>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Recent Feedback</h3>
               <div className="space-y-4">
                  {recentFeedbacks.map((fb) => (
                     <div key={fb.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-gray-800 text-sm">{fb.user}</span>
                           <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                              {fb.rating} ★
                           </span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{fb.comment}"</p>
                     </div>
                  ))}
               </div>
               <Link to="/member/feedback" className="block text-center text-xs font-bold text-blue-500 hover:text-blue-700 mt-4 underline">
                  View All Reviews
               </Link>
            </div>

         </div>
      </div>

    </div>
  );
};

export default Profile;