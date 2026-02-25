import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext';

const Profile = () => {
   // --- LOGIC: STRICTLY UNCHANGED ---
   const { api, BACKEND_URL, loadingIMG } = useGlobalContext();
   const { colors, theme } = useTheme();

   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState("personal");
   const [isEditing, setIsEditing] = useState(false);
   const [tempData, setTempData] = useState({});
   const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
   const [selectedFile, setSelectedFile] = useState(null);

   const fileInputRef = useRef(null);

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            setLoading(true);
            const res = await api.get('/members/profile');
            const member = res.data;

            const getImageUrl = (path) => {
               if (!path) return "https://i.pravatar.cc/150?u=101";
               if (path.startsWith("http")) return path;
               return `${BACKEND_URL}/${path}`;
            };

            const formattedUser = {
               id: member.user._id,
               name: member.user.name,
               email: member.user.email,
               phone: member.user.phone,
               address: member.user.address || "",
               profileImage: getImageUrl(member.user.profileImage),
               status: member.user.status,
               joinedDate: new Date(member.user.createdAt).toLocaleDateString('en-GB'),
               membership: {
                  plan: member.plan?.name || "No Plan Active",
                  startDate: member.startDate ? new Date(member.startDate).toLocaleDateString('en-GB') : "-",
                  endDate: member.expiryDate ? new Date(member.expiryDate).toLocaleDateString('en-GB') : "-",
                  features: member.plan?.features || [],
               },
               trainer: {
                  name: member.assignedTrainer?.name || "Unassigned",
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
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile.");
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
         setSelectedFile(file);
         const imageUrl = URL.createObjectURL(file);
         setTempData(prev => ({ ...prev, profileImage: imageUrl }));
      }
   };

   const triggerFileInput = () => {
      if (isEditing) fileInputRef.current.click();
      else toast("Click 'Edit Profile' to change photo", { icon: 'ℹ️' });
   };

   const handleSave = async () => {
      const loadingToast = toast.loading("Saving changes...");
      try {
         if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            await api.post("/members/profile/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
         }

         try {
            await api.put('/users/profile', {
               name: tempData.name,
               phone: tempData.phone,
               address: tempData.address,
            });
         } catch (e) { console.log("User update warning:", e); }

         await api.put('/members/profile', {
            height: tempData.fitness.height,
            currentWeight: tempData.fitness.weight,
            fitnessGoal: tempData.fitness.goal,
         });

         setProfile(tempData);
         setSelectedFile(null);
         setIsEditing(false);
         toast.success("Profile updated!", { id: loadingToast });
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to update.", { id: loadingToast });
      }
   };

   const handlePasswordChange = async (e) => {
      e.preventDefault();
      
      // Validation: Check if all fields are filled
      if (!passwords.current.trim()) {
         return toast.error("Old password is required");
      }
      if (!passwords.new.trim()) {
         return toast.error("New password is required");
      }
      if (!passwords.confirm.trim()) {
         return toast.error("Confirm password is required");
      }
      
      // Validation: Check if new password and confirm password match
      if (passwords.new !== passwords.confirm) {
         return toast.error("New password and confirm password do not match");
      }

      const loadingToast = toast.loading("Updating password...");
      
      try {
         await api.put('/auth/change-password', {
            oldPassword: passwords.current,
            newPassword: passwords.new,
            confirmPassword: passwords.confirm
         });
         
         toast.success("Password updated successfully!", { id: loadingToast });
         setPasswords({ current: "", new: "", confirm: "" });
      } catch (error) {
         const errorMessage = error.response?.data?.message || "Failed to update password";
         toast.error(errorMessage, { id: loadingToast });
      }
   };

   if (loading) {
      return (
         <div className="fixed inset-0 flex items-center justify-center h-screen" style={{ color: colors.textMuted }}>
            <img src={loadingIMG} className='h-20 w-25' alt="Loading" />
         </div>
      )
   };
   if (!profile) return <div className="p-10 text-center text-red-500">Failed to load data.</div>;

   // --- RENDER ---
   return (
      <div className="w-full max-w-7xl mx-auto pb-14 px-4 sm:px-6">

         {/* --- ADVANCED STYLES & ANIMATIONS --- */}
         <style>{`
            /* 1. 3D Card Tilt Effect */
            .hover-3d {
               transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .hover-3d:hover {
               transform: translateY(-5px) scale(1.01);
               box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04);
            }

            /* 2. Glassmorphism */
            .glass-panel {
               background: rgba(255, 255, 255, 0.05);
               backdrop-filter: blur(12px);
               border: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* 3. Focus Glow Rings */
            .input-glow {
               transition: all 0.3s ease;
               background: ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'};
            }
            .input-glow:focus {
               background: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff'};
               border-color: #D9F17F;
               box-shadow: 0 0 0 4px rgba(217, 241, 127, 0.25);
               transform: translateY(-1px);
            }

            /* 4. Smooth Animations */
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pulseBorder { 0% { border-color: rgba(217, 241, 127, 0.2); } 50% { border-color: rgba(217, 241, 127, 0.8); } 100% { border-color: rgba(217, 241, 127, 0.2); } }
            
            .anim-enter { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .anim-pulse-border { animation: pulseBorder 2s infinite; }

            /* 5. Button Press Effect */
            .btn-press { transition: transform 0.1s ease; }
            .btn-press:active { transform: scale(0.97); }
         `}</style>

         {/* --- MAIN GRID LAYOUT --- */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

            {/* --- LEFT: IDENTITY & NAVIGATION (Sticky) --- */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-6">
               <div
                  className="rounded-[1rem] p-6 text-center border relative overflow-hidden anim-enter  top-8  "
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  {/* Decorative Header Gradient */}
                  <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-br from-gray-800 to-black"></div>
                  <div className="absolute top-0 left-0 w-full h-36 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                  <div className="relative z-10 flex flex-col items-center pt-6">
                     {/* Avatar Container */}
                     <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                        <div className={`w-40 h-40 rounded-full p-1.5 border-2 ${isEditing ? 'border-[#D9F17F] anim-pulse-border' : 'border-white/20'} bg-white/10 backdrop-blur-sm transition-all duration-300`}>
                           <div className="w-full h-full rounded-full overflow-hidden shadow-2xl relative">
                              <img src={tempData.profileImage || profile.profileImage} alt="User" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              {isEditing && (
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                                    <i className="fa-solid fa-camera text-white text-3xl drop-shadow-md"></i>
                                 </div>
                              )}
                           </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={!isEditing} />
                     </div>

                     <h2 className="mt-5 text-2xl font-black tracking-tight" style={{ color: colors.text }}>{profile.name}</h2>

                     {/* Glassmorphism Status Badge */}
                     <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 border-b-2 glass-panel ">
                        <span className={`w-2 h-2 rounded-full ${profile.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-90" style={{ color: colors.text }}>{profile.status} Member</span>
                     </div>

                     <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-500/20 to-transparent my-8"></div>

                     {/* Vertical Navigation Tabs */}
                     <div className="w-full space-y-2 px-1">
                        {[
                           { id: 'personal', label: 'Personal Details', icon: 'fa-user-astronaut' },
                           { id: 'fitness', label: 'Fitness Stats', icon: 'fa-dumbbell' },
                           { id: 'settings', label: 'Security', icon: 'fa-shield-cat' }
                        ].map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center gap-4 px-5 py-4  cursor-pointer transition-all duration-300 relative overflow-hidden group ${activeTab === tab.id ? 'bg-gray-100 dark:bg-white/5 border-b-1 border-gray-400' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                           >
                              {/* Active Indicator Bar */}
                              {activeTab === tab.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#D9F17F] rounded-r-full"></div>}

                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${activeTab === tab.id ? 'bg-[#D9F17F] text-black shadow-lg shadow-[#D9F17F]/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                 <i className={`fa-solid ${tab.icon}`}></i>
                              </div>
                              <span className={`font-bold text-sm tracking-wide ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`} style={{ color: colors.text }}>{tab.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* --- RIGHT: ACTION CENTER --- */}
            <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6">

               {/* Context Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 anim-enter" >
                  <div>

                     <p className="text-sm font-medium opacity-60 max-w-md leading-relaxed" style={{ color: colors.text }}>
                        {activeTab === 'personal' && 'View and manage your personal information and contact details.'}
                        {activeTab === 'fitness' && 'Track your body metrics, update goals, and monitor progress.'}
                        {activeTab === 'settings' && 'Keep your account secure by updating your password regularly.'}
                     </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full md:w-auto">
                     {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}
                           className="btn-press flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 font-bold text-sm uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-white/5 transition-all shadow-sm cursor-pointer"
                           style={{ borderColor: colors.border, color: colors.text }}>
                           <i className="fa-solid fa-pen-to-square"></i> Edit Details
                        </button>
                     ) : (
                        <>
                           <button onClick={() => { setIsEditing(false); setTempData(profile); }}
                              className="btn-press flex-1 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wide border  transition-colors cursor-pointer"
                              style={{ borderColor: colors.border, color: colors.text }}>
                              Cancel
                           </button>
                           <button onClick={handleSave}
                              className="btn-press flex-1 px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-wide bg-[#D9F17F] text-black cursor-pointer">
                              Save
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {/* Main Form Card */}
               <div className="rounded-[1rem] p-8 md:p-12 border flex-1 relative overflow-hidden anim-enter "
                  style={{ backgroundColor: colors.card, borderColor: colors.border, animationDelay: '0.2s' }}>

                  {/* Background Icon Watermark */}
                  <div className="absolute top-10 right-10 p-10 opacity-[0.03] pointer-events-none transform rotate-12">
                     <i className={`fa-solid ${activeTab === 'personal' ? 'fa-id-card' : activeTab === 'fitness' ? 'fa-bolt' : 'fa-lock'} text-9xl`}></i>
                  </div>

                  {/* === TAB: PERSONAL === */}
                  {activeTab === 'personal' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 anim-enter">
                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Full Name</label>
                           <div className="relative group">
                              <i className="fa-solid fa-user absolute left-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#D9F17F] group-focus-within:opacity-100 transition-all"></i>
                              <input type="text" name="name" disabled={!isEditing} value={tempData.name} onChange={handleInputChange}
                                 className="input-glow w-full pl-14 pr-6 py-3 rounded-xl border-2 outline-none font-bold text-md disabled:opacity-60"
                                 style={{ borderColor: colors.border, color: colors.text }} />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email Address</label>
                           <div className="relative group">
                              <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#D9F17F] group-focus-within:opacity-100 transition-all"></i>
                              <input type="email" value={tempData.email} disabled
                                 className="input-glow w-full pl-14 pr-6 py-3 rounded-xl border-2 outline-none font-medium text-md opacity-60 cursor-not-allowed"
                                 style={{ borderColor: colors.border, color: colors.text }} />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Phone Number</label>
                           <div className="relative group">
                              <i className="fa-solid fa-phone absolute left-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#D9F17F] group-focus-within:opacity-100 transition-all"></i>
                              <input type="tel" name="phone" disabled={!isEditing} value={tempData.phone} onChange={handleInputChange}
                                 className="input-glow w-full pl-14 pr-6 py-3 rounded-xl border-2 outline-none font-bold text-md disabled:opacity-60"
                                 style={{ borderColor: colors.border, color: colors.text }} />
                           </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Address</label>
                           <textarea name="address" rows="3" disabled={!isEditing} value={tempData.address} onChange={handleInputChange}
                              className="input-glow w-full px-6 py-3 rounded-xl border-2 outline-none font-medium text-lg resize-none disabled:opacity-60 leading-relaxed"
                              style={{ borderColor: colors.border, color: colors.text }}></textarea>
                        </div>
                     </div>
                  )}

                  {/* === TAB: FITNESS === */}
                  {activeTab === 'fitness' && (
                     <div className="anim-enter">
                        {/* 3D Cards for Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                           {['height', 'weight'].map((field) => (
                              <div key={field} className="relative overflow-hidden rounded-[1rem] p-4 border-2 group transition-all duration-300 hover:border-[#D9F17F] "
                                 style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8f9fa', borderColor: colors.border }}>
                                 <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-black uppercase opacity-40 tracking-widest">{field === 'height' ? 'HEIGHT' : 'WEIGHT'}</span>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-md shadow-inner ${field === 'height' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                       <i className={`fa-solid ${field === 'height' ? 'fa-ruler-vertical' : 'fa-scale-unbalanced'}`}></i>
                                    </div>
                                 </div>
                                 <div className="flex items-baseline gap-2 mt-2">
                                    <input type="number" name={field} disabled={!isEditing} value={tempData.fitness[field]} onChange={(e) => handleInputChange(e, 'fitness')}
                                       className="w-full bg-transparent text-3xl font-black outline-none border-none p-0 focus:ring-0 disabled:cursor-not-allowed tracking-tighter"
                                       style={{ color: colors.text }} />
                                    <span className="text-sm font-bold opacity-40 uppercase">{field === 'height' ? 'cm' : 'kg'}</span>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Current Goal</label>
                           <div className="relative group">
                              <select name="goal" disabled={!isEditing} value={tempData.fitness.goal} onChange={(e) => handleInputChange(e, 'fitness')}
                                 className="input-glow w-full px-8 py-6 rounded-xl border-2 font-bold text-md outline-none appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                 style={{ borderColor: colors.border, color: colors.text }}>
                                 {['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness'].map(o => <option key={o} className="text-black text-lg">{o}</option>)}
                              </select>
                             
                           </div>
                        </div>
                     </div>
                  )}

                  {/* === TAB: SECURITY === */}
                  {activeTab === 'settings' && (
                     <div className="flex flex-col xl:flex-row gap-12 h-full anim-enter">
                        {/* Security Health Widget */}
                       

                        {/* Password Form */}
                        <form onSubmit={handlePasswordChange} className="flex-1 flex flex-col justify-center space-y-6">
                           {['current', 'new', 'confirm'].map((field, idx) => (
                              <div key={field} className="space-y-3">
                                 <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                                    {field === 'confirm' ? 'Confirm Password' : `${field} Password`}
                                    {idx > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#D9F17F]"></span>}
                                 </label>
                                 <div className="relative group">
                                    <input type="password" value={passwords[field]} onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                                       className="input-glow w-full px-8 py-3 rounded-xl border-2 font-bold text-md outline-none transition-all placeholder-opacity-20"
                                       placeholder="••••••••"
                                       style={{ borderColor: colors.border, color: colors.text }} />
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#D9F17F] group-focus-within:opacity-100 transition-all">
                                       <i className={`fa-solid ${field === 'confirm' ? 'fa-check-double' : 'fa-key'} text-md`}></i>
                                    </div>
                                 </div>
                              </div>
                           ))}
                           <div className="pt-6">
                              <button type="submit" className="btn-press w-full py-3 rounded-xl font-black text-sm   bg-gray-900 text-white dark:bg-white dark:text-black border-1 border-gray-400 cursor-pointer">
                                 Update
                              </button>
                           </div>
                        </form>
                     </div>
                  )}

               </div>
            </div>
         </div>
      </div>
   );
};

export default Profile;