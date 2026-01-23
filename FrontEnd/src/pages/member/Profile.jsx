import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';

const Profile = () => {
   const { api } = useGlobalContext();

   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState("personal");
   const [isEditing, setIsEditing] = useState(false);
   const [tempData, setTempData] = useState({});
   const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

   const fileInputRef = useRef(null);

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

   // --- FETCH DATA ---
   useEffect(() => {
      const fetchProfile = async () => {
         try {
            setLoading(true);
            // Ensure the path is correct relative to your axios baseURL
            // If baseURL ends with /api, use 'users/profile' (no leading slash) to avoid double slashes if any
            const res = await api.get('/members/profile');
            const member = res.data;
            const formattedUser = {
               id: member.user._id,
               name: member.user.name,
               email: member.user.email,
               phone: member.user.phone,
               address: member.user.address || "",
               profileImage: member.user.profileImage || "https://i.pravatar.cc/150?u=101",
               status: member.status,
               joinedDate: new Date(member.createdAt).toLocaleDateString('en-GB'),

               membership: {
                  planId: member.plan?._id || null,
                  plan: member.plan?.name || "No Plan Active",
                  startDate: member.startDate
                     ? new Date(member.startDate).toLocaleDateString('en-GB')
                     : "-",
                  endDate: member.expiryDate
                     ? new Date(member.expiryDate).toLocaleDateString('en-GB')
                     : "-",
                  features: member.plan?.features || [],
               },

               trainer: {
                  name: member.assignedTrainer?.name || "Unassigned",
                  specialization: "-",
               },

               fitness: {
                  height: member.height || 0,
                  weight: member.currentWeight || 0,
                  goal: member.fitnessGoal || "General Fitness",
                  notes: member.notes || "No remarks yet.",
               },
            };


            setProfile(formattedUser);
            setTempData(formattedUser);
         } catch (error) {
            /*  console.error("Error fetching profile:", error); */
            // toast.error("Failed to load profile data");
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, []);

   const handleInputChange = (e, section = null) => {
      const { name, value } = e.target;
      if (section) {
         setTempData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
      } else {
         setTempData(prev => ({ ...prev, [name]: value }));
      }
   };

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const imageUrl = URL.createObjectURL(file);
         setTempData(prev => ({ ...prev, profileImage: imageUrl }));
         toast.success("Profile picture updated!");
      }
   };

   const handleSave = async () => {
      try {
         const payload = {
            name: tempData.name,
            phone: tempData.phone,
            address: tempData.address,
         };

         await api.put('/users/profile', {
            name: tempData.name,
            phone: tempData.phone,
            address: tempData.address,
         });
         await api.put('/members/profile', {
            height: tempData.fitness.height,
            currentWeight: tempData.fitness.weight,
            fitnessGoal: tempData.fitness.goal,
         });

         setProfile(tempData);
         setIsEditing(false);
         toast.success("Profile details updated successfully!");
      } catch (error) {
         console.error("Update failed:", error);
         toast.error("Failed to update profile.");
      }
   };

   const handlePasswordChange = (e) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) {
         toast.error("New passwords do not match!");
         return;
      }
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
   };

   const handleRequestChange = (field) => {
      toast.info(`Request sent to Admin to update ${field}.`);
   };

   // --- SAFE RENDER ---
   if (loading) {
      return (
         <div className="w-full h-96 flex items-center justify-center">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#CDE7FE]"></i>
         </div>
      );
   }

   // Crash Prevention: Handle case where user is null (e.g. fetch error)
   if (!profile) {
      return (
         <div className="w-full h-96 flex flex-col items-center justify-center text-gray-500">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-400 mb-4"></i>
            <p>Failed to load profile data.</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-blue-500 hover:underline">Retry</button>
         </div>
      );
   }

   return (
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* --- HEADER SECTION --- */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gray-900 to-gray-800"></div>

            <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 mt-12 px-4">

               {/* Avatar */}
               <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                     <img src={tempData.profileImage || profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button
                     onClick={() => fileInputRef.current.click()}
                     className="absolute bottom-2 right-2 w-8 h-8 bg-[#FEEF75] rounded-full flex items-center justify-center text-yellow-900 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                     title="Change Photo"
                  >
                     <i className="fa-solid fa-camera text-xs"></i>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>

               {/* Info */}
               <div className="flex-1 mb-2">
                  <h1 className="text-3xl font-black text-gray-900">{profile.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                     <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{profile.id.slice(-6).toUpperCase()}</span>
                     <span className="flex items-center gap-1 text-green-600 font-bold">
                        <i className="fa-solid fa-circle-check"></i> {profile.status}
                     </span>
                     <span>Member Since: {profile.joinedDate}</span>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex gap-3 mb-2">
                  {!isEditing ? (
                     <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                     >
                        <i className="fa-solid fa-pen-to-square mr-2"></i> Edit Profile
                     </button>
                  ) : (
                     <>
                        <button
                           onClick={() => { setIsEditing(false); setTempData(profile); }}
                           className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleSave}
                           className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-xl text-sm font-bold hover:bg-green-300 transition-colors shadow-sm"
                        >
                           Save Changes
                        </button>
                     </>
                  )}
               </div>
            </div>
         </div>

         {/* --- CONTENT GRID --- */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN: NAVIGATION & STATUS */}
            <div className="space-y-6">

               {/* Navigation Tabs */}
               <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm flex flex-col gap-1">
                  {[
                     { id: 'personal', label: 'Personal Details', icon: 'fa-user' },
                     { id: 'fitness', label: 'Fitness & Goals', icon: 'fa-heart-pulse' },
                     { id: 'settings', label: 'Security & Documents', icon: 'fa-shield-halved' }
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${activeTab === tab.id
                           ? 'bg-[#CDE7FE] text-blue-900'
                           : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                           }`}
                     >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === tab.id ? 'bg-white/50' : 'bg-gray-100'}`}>
                           <i className={`fa-solid ${tab.icon}`}></i>
                        </div>
                        {tab.label}
                     </button>
                  ))}
               </div>

               {/* Membership Status Card */}
               <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <i className="fa-solid fa-id-card text-8xl"></i>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Membership</h3>
                  <div className="mb-4">
                     <p className="text-xs text-gray-500 mb-1">Current Plan</p>
                     <p className="text-xl font-black text-blue-600">{profile.membership.plan}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4 border-b border-gray-100 pb-4">
                     <div>
                        <p className="text-xs text-gray-400">Start Date</p>
                        <p className="font-bold">{profile.membership.startDate}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-400">Expiry Date</p>
                        <p className="font-bold">{profile.membership.endDate}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400 mb-2">Features Included:</p>
                     <div className="flex flex-wrap gap-2">
                        {profile.membership.features.map((f, i) => (
                           <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-medium text-gray-600">{f}</span>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Assigned Trainer Card */}
               <div className="bg-gradient-to-br from-[#fcfdfd] to-[#fffbeb] rounded-3xl p-6 border border-[#FEEF75] shadow-sm">
                  <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wider mb-4">Your Trainer</h3>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-900 font-bold text-xl">
                        {profile.trainer.name ? profile.trainer.name[0] : "?"}
                     </div>
                     <div>
                        <p className="font-bold text-gray-900">{profile.trainer.name}</p>
                        
                     </div>
                  </div>
                  <Link to="/member/chat" className="block w-full py-2.5 bg-white border border-[#FEEF75] text-yellow-900 rounded-xl text-xs font-bold text-center hover:bg-yellow-50 transition-colors">
                     <i className="fa-regular fa-comments mr-2"></i> Chat with Trainer
                  </Link>
               </div>

            </div>

            {/* RIGHT COLUMN: MAIN FORMS */}
            <div className="lg:col-span-2">

               {/* TAB 1: PERSONAL DETAILS */}
               {activeTab === 'personal' && (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-fade-in">
                     <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-user-pen text-[#CDE7FE]"></i> Personal Information
                     </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name (Editable) */}
                        <div className="group">
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Full Name</label>
                           <input
                              type="text"
                              name="name"
                              disabled={!isEditing}
                              value={tempData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                           />
                        </div>

                        {/* Email (Read Only - Admin Controlled) */}
                        <div className="group relative">
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex justify-between">
                              Email Address <i className="fa-solid fa-lock text-gray-300" title="Contact Admin to change"></i>
                           </label>
                           <input
                              type="email"
                              value={tempData.email}
                              disabled
                              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent text-gray-500 font-medium cursor-not-allowed"
                           />
                           {isEditing && (
                              <button onClick={() => handleRequestChange('Email')} className="absolute top-9 right-3 text-xs text-blue-500 hover:underline">Request Change</button>
                           )}
                        </div>

                        {/* Phone (Editable) */}
                        <div className="group">
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Phone Number</label>
                           <input
                              type="tel"
                              name="phone"
                              disabled={!isEditing}
                              value={tempData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium disabled:opacity-70"
                           />
                        </div>

                        {/* Address (Editable - Full Width) */}
                        <div className="group md:col-span-2">
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Address</label>
                           <textarea
                              name="address"
                              rows="3"
                              disabled={!isEditing}
                              value={tempData.address}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-medium disabled:opacity-70 resize-none"
                           ></textarea>
                        </div>
                     </div>
                  </div>
               )}

               {/* TAB 2: FITNESS INFO */}
               {activeTab === 'fitness' && (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-fade-in">
                     <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-dumbbell text-[#D9F17F]"></i> Fitness Profile
                     </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Height (cm)</label>
                           <input
                              type="number"
                              name="height"
                              disabled={!isEditing}
                              value={tempData.fitness.height}
                              onChange={(e) => handleInputChange(e, 'fitness')}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#D9F17F] focus:ring-4 focus:ring-[#D9F17F]/20 transition-all font-bold text-lg disabled:bg-gray-50"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Weight (kg)</label>
                           <input
                              type="number"
                              name="weight"
                              disabled={!isEditing}
                              value={tempData.fitness.weight}
                              onChange={(e) => handleInputChange(e, 'fitness')}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#D9F17F] focus:ring-4 focus:ring-[#D9F17F]/20 transition-all font-bold text-lg disabled:bg-gray-50"
                           />
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Fitness Goal</label>
                           <select
                              name="goal"
                              disabled={!isEditing}
                              value={tempData.fitness.goal}
                              onChange={(e) => handleInputChange(e, 'fitness')}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#D9F17F] focus:ring-4 focus:ring-[#D9F17F]/20 transition-all font-medium disabled:opacity-70"
                           >
                              <option>Weight Loss</option>
                              <option>Muscle Gain</option>
                              <option>Endurance</option>
                              <option>Flexibility</option>
                              <option>General Fitness</option>
                           </select>
                        </div>
                     </div>

                     <div className="bg-[#f8fbff] p-5 rounded-2xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                           <i className="fa-solid fa-user-doctor"></i> Trainer Notes <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Read Only</span>
                        </h3>
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                           "{profile.fitness.notes}"
                        </p>
                     </div>
                  </div>
               )}

               {/* TAB 3: SECURITY & DOCS */}
               {activeTab === 'settings' && (
                  <div className="space-y-6 animate-fade-in">

                     {/* Change Password */}
                     <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <i className="fa-solid fa-lock text-[#FEEF75]"></i> Security Settings
                        </h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Current Password</label>
                              <input
                                 type="password"
                                 value={passwords.current}
                                 onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                 className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                 placeholder="••••••••"
                              />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 mb-2">New Password</label>
                                 <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                    placeholder="••••••••"
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 mb-2">Confirm Password</label>
                                 <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                    placeholder="••••••••"
                                 />
                              </div>
                           </div>
                           <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                              Update Password
                           </button>
                        </form>
                     </div>

                     {/* Documents */}
                     <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <i className="fa-solid fa-file-shield text-gray-400"></i> Documents
                        </h2>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-500 shadow-sm">
                                    <i className="fa-solid fa-file-medical"></i>
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900">Medical Certificate</p>
                                    <p className="text-xs text-gray-500">Uploaded on Jan 15, 2024</p>
                                 </div>
                              </div>
                              <button className="text-xs font-bold text-blue-600 hover:underline">View</button>
                           </div>

                           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm">
                                    <i className="fa-solid fa-id-card"></i>
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900">ID Proof (Aadhar/Passport)</p>
                                    <p className="text-xs text-gray-500">Verified by Admin</p>
                                 </div>
                              </div>
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Verified</span>
                           </div>

                           <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                              <i className="fa-solid fa-cloud-arrow-up"></i> Upload New Document
                           </button>
                        </div>
                     </div>

                  </div>
               )}

            </div>
         </div>
      </div>
   );
};

export default Profile;