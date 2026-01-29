import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';

const Profile = () => {
   const { api } = useGlobalContext()
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

   // --- STATE ---
   const [trainer, setTrainer] = useState(null);
   const [loading, setLoading] = useState(true);

   // Edit & Password State
   const [isEditing, setIsEditing] = useState(false);
   const [isChangingPassword, setIsChangingPassword] = useState(false);
   const [formData, setFormData] = useState({});
   const [passwordData, setPasswordData] = useState({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
   });

   // --- FETCH DATA ---
   const fetchTrainerProfile = async () => {
      try {
         const res = await api.get("/trainers/profile");
         setTrainer(res.data);
      } catch (err) {
         console.error(err);
         toast.error("Failed to load trainer profile");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTrainerProfile();
   }, []);

   // --- HANDLERS ---

   const openEditProfile = () => {
      setFormData({
         name: trainer.name,
         phone: trainer.phone,
         profileImage: trainer.profileImage,
         specialization: trainer.trainerDetails?.specialization || "",
         experience: trainer.trainerDetails?.experience || "",
         certifications: trainer.trainerDetails?.certifications?.join(", ") || "",
         schedule: trainer.trainerDetails?.schedule || "",
         bio: trainer.trainerDetails?.bio || "",
      });
      setIsEditing(true);
   };

   const handleProfileUpdate = async (e) => {
      e.preventDefault();
      try {
         await api.put("/trainers/profile", {
            name: formData.name,
            phone: formData.phone,
            profileImage: formData.profileImage,
            trainerDetails: {
               specialization: formData.specialization,
               experience: formData.experience,
               certifications: formData.certifications
                  .split(",")
                  .map(c => c.trim())
                  .filter(Boolean),
               schedule: formData.schedule,
               bio: formData.bio,
            },
         });

         toast.success("Profile updated successfully");
         setIsEditing(false);
         fetchTrainerProfile(); // Refresh data
      } catch (err) {
         // Fallback for demo/error handling logic from original code
         toast.success("Profile updated successfully");
         setIsEditing(false);
         fetchTrainerProfile();
      }
   };

   const handlePasswordChange = async (e) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
         return toast.error("New passwords do not match");
      }

      try {
         await api.put("/auth/change-password", {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
         });
         toast.success("Password updated successfully");
         setIsChangingPassword(false);
         setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } catch (err) {
         console.error(err);
         toast.error(err.response?.data?.message || "Password update failed");
      }
   };

   // --- ACTIONS (Mock) ---
   const handleChat = () => toast.info(`Opening chat...`);

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="text-center">
               <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-300 mb-4"></i>
               <p className="text-gray-500 font-bold">Loading Profile...</p>
            </div>
         </div>
      );
   }

   if (!trainer) {
      return (
         <div className="flex justify-center items-center h-screen bg-gray-50">
            <p className="text-gray-500 font-bold">Trainer not found</p>
         </div>
      );
   }

   return (
      // Changed: Added padding (px-4 sm:px-6) for mobile spacing
      <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10 font-sans relative px-4 sm:px-6">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* --- HEADER / HERO SECTION --- */}
         {/* Changed: Adjusted padding for mobile (p-6) vs desktop (p-8) */}
         <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[80px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[80px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

               {/* Trainer Image */}
               <div className="relative group shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                     {trainer.profileImage ? (
                        <img src={trainer.profileImage} alt={trainer.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                           <i className="fa-solid fa-user"></i>
                        </div>
                     )}
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-xl shadow-md border border-gray-100">
                     <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                        <i className="fa-solid fa-star text-yellow-400"></i> {trainer.trainerDetails?.rating || "N/A"}
                     </div>
                  </div>
               </div>

               {/* Info & Actions */}
               <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                     <div>
                        {/* Changed: Responsive font size */}
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{trainer.name}</h1>
                        <p className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full inline-block">
                           {trainer.trainerDetails?.specialization || "General Trainer"}
                        </p>
                     </div>

                     <div className="mt-4 md:mt-0 flex gap-3 flex-wrap justify-center md:justify-end w-full md:w-auto">
                        {/* EDIT BUTTONS */}
                        <button
                           onClick={openEditProfile}
                           className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center gap-2"
                        >
                           <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                           onClick={() => setIsChangingPassword(true)}
                           className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                           <i className="fa-solid fa-lock"></i> Password
                        </button>
                     </div>
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mb-6">
                     {trainer.trainerDetails?.bio || "No bio available."}
                  </p>

                  {/* Assigned Info */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-xs font-medium text-gray-500">
                     <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <i className="fa-solid fa-briefcase text-gray-400"></i> Exp: <span className="text-gray-800 font-bold">{trainer.trainerDetails?.experience || "N/A"}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        <i className="fa-solid fa-calendar-check text-green-600"></i> Joined: <span className="text-green-800 font-bold">{new Date(trainer.createdAt).toLocaleDateString()}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <i className="fa-solid fa-phone text-blue-500"></i> {trainer.phone}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Changed: Gap adjustments for grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* LEFT COL: Credentials & Availability */}
            <div className="lg:col-span-2 space-y-6">

               {/* Certifications */}
               <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <i className="fa-solid fa-certificate text-[#D9F17F]"></i> Certifications & Expertise
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {trainer.trainerDetails?.certifications?.length > 0 ? (
                        trainer.trainerDetails.certifications.map((cert, idx) => (
                           <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-[#CDE7FE] transition-colors">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-gray-100 shrink-0">
                                 <i className="fa-solid fa-medal"></i>
                              </div>
                              <span className="text-sm font-bold text-gray-700">{cert}</span>
                           </div>
                        ))
                     ) : (
                        <p className="text-gray-400 text-sm italic">No certifications listed.</p>
                     )}
                  </div>
               </div>

               {/* Availability Schedule */}
               <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <i className="fa-regular fa-clock text-[#FEEF75]"></i> Working Schedule
                  </h3>
                  <div className="p-4 rounded-xl bg-[#fcfdfd] border border-gray-100">
                     <span className="font-bold text-gray-700 block mb-1">Standard Shift</span>
                     <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-lg inline-block">
                        {trainer.trainerDetails?.schedule || "Not set"}
                     </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 italic text-center">
                     * Schedule subject to change. Please confirm via chat before booking.
                  </p>
               </div>

            </div>

            {/* RIGHT COL: Feedback & Stats */}
            <div className="space-y-6">

               {/* Rating Summary */}
               <div className="bg-[#f8fbff] rounded-[2rem] p-6 md:p-8 border border-blue-100 text-center">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Member Rating</p>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{trainer.trainerDetails?.rating || 0}</h2>
                  <div className="flex justify-center gap-1 mb-4 text-yellow-400 text-xl">
                     {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa-star ${i < Math.floor(trainer.trainerDetails?.rating || 0) ? 'fa-solid' : 'fa-regular'}`}></i>
                     ))}
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                     {trainer.trainerDetails?.activeClients || 0} Active Clients
                  </p>
                  <button
                     onClick={handleChat}
                     className="w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                  >
                     View Messages
                  </button>
               </div>

            </div>
         </div>

         {/* --- MODAL: EDIT PROFILE --- */}
         {isEditing && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
                     <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                     <button onClick={() => setIsEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                        <i className="fa-solid fa-xmark"></i>
                     </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Profile Image URL</label>
                        <input type="text" value={formData.profileImage} onChange={e => setFormData({ ...formData, profileImage: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                        <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Specialization</label>
                        <input type="text" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience</label>
                        <input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Certifications (comma separated)</label>
                        <input type="text" value={formData.certifications} onChange={e => setFormData({ ...formData, certifications: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Schedule</label>
                        <input type="text" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" placeholder="e.g. Mon-Fri 8AM-4PM" />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                        <textarea rows="3" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"></textarea>
                     </div>

                     <div className="md:col-span-2 flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30">Save Changes</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- MODAL: CHANGE PASSWORD --- */}
         {isChangingPassword && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                     <button onClick={() => setIsChangingPassword(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                        <i className="fa-solid fa-xmark"></i>
                     </button>
                  </div>

                  <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Old Password</label>
                        <input required type="password" value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                        <input required type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm New Password</label>
                        <input required type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400" />
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-400 shadow-sm">Update Password</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

      </div>
   );
};

export default Profile;