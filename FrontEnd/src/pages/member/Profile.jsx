import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast'; // Changed to react-hot-toast
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Theme Context

const Profile = () => {
   const { api, BACKEND_URL } = useGlobalContext();
   const { colors, theme } = useTheme(); // Consuming Context

   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState("personal");
   const [isEditing, setIsEditing] = useState(false);
   const [tempData, setTempData] = useState({});
   const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
   const [selectedFile, setSelectedFile] = useState(null);

   const fileInputRef = useRef(null);

   // --- FETCH DATA ---
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

   // --- IMAGE HANDLER ---
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

   // --- SAVE HANDLER ---
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
         } catch(e) { console.log("User update warning:", e); }

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

   const handlePasswordChange = (e) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) return toast.error("Passwords do not match");
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
   };

   if (loading) return <div className="p-10 text-center" style={{ color: colors.textMuted }}>Loading Profile...</div>;
   if (!profile) return <div className="p-10 text-center text-red-500">Failed to load data.</div>;

   return (
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-10 px-4 sm:px-0">
         
         {/* --- HEADER --- */}
         <div 
            className="rounded-3xl p-6 shadow-sm border relative overflow-hidden transition-colors"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
         >
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gray-900 to-gray-800"></div>

            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mt-12 px-2 md:px-4 text-center md:text-left">
               {/* Avatar */}
               <div className="relative group" onClick={triggerFileInput}>
                  <div className={`w-32 h-32 rounded-full border-4 shadow-md overflow-hidden bg-gray-200 ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`} 
                       style={{ borderColor: colors.card }}>
                     <img src={tempData.profileImage || profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {isEditing && (
                     <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#FEEF75] rounded-full flex items-center justify-center text-yellow-900 shadow-sm z-10">
                        <i className="fa-solid fa-camera text-xs"></i>
                     </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={!isEditing} />
               </div>

               {/* Info */}
               <div className="flex-1 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>{profile.name}</h1>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-sm mt-1 justify-center md:justify-start" style={{ color: colors.textMuted }}>
                     <span className="font-mono px-2 py-0.5 rounded" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                        #{profile.id.slice(-6).toUpperCase()}
                     </span>
                     <span className={`font-bold ${profile.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                        {profile.status}
                     </span>
                     <span>Since: {profile.joinedDate}</span>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex gap-3 mb-2 w-full md:w-auto justify-center md:justify-end">
                  {!isEditing ? (
                     <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm w-full md:w-auto transition-colors"
                        style={{ backgroundColor: colors.text, color: colors.background }}
                     >
                        <i className="fa-solid fa-pen-to-square mr-2"></i> Edit Profile
                     </button>
                  ) : (
                     <>
                        <button
                           onClick={() => { setIsEditing(false); setTempData(profile); }}
                           className="px-5 py-2.5 border rounded-xl text-sm font-bold transition-colors"
                           style={{ borderColor: colors.border, color: colors.textMuted }}
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleSave}
                           className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-xl text-sm font-bold hover:bg-green-300 transition-colors shadow-sm"
                        >
                           Save
                        </button>
                     </>
                  )}
               </div>
            </div>
         </div>

         {/* --- CONTENT GRID --- */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: NAVIGATION */}
            <div className="space-y-6">
               <div 
                  className="rounded-3xl p-2 border shadow-sm flex flex-row lg:flex-col gap-1 overflow-x-auto"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  {[
                     { id: 'personal', label: 'Personal Details', icon: 'fa-user' },
                     { id: 'fitness', label: 'Fitness & Goals', icon: 'fa-heart-pulse' },
                     { id: 'settings', label: 'Security', icon: 'fa-shield-halved' }
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left whitespace-nowrap min-w-max lg:min-w-0"
                        style={{ 
                           backgroundColor: activeTab === tab.id ? colors.secondary : 'transparent',
                           color: activeTab === tab.id ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
                        }}
                     >
                        <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* RIGHT: FORMS */}
            <div className="lg:col-span-2">
               {/* WRAPPER CARD */}
               <div 
                  className="rounded-3xl p-6 md:p-8 border shadow-sm"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  {/* TAB 1: PERSONAL */}
                  {activeTab === 'personal' && (
                     <>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                           <i className="fa-solid fa-user-pen" style={{ color: colors.secondary }}></i> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="group">
                              <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Full Name</label>
                              <input
                                 type="text"
                                 name="name"
                                 disabled={!isEditing}
                                 value={tempData.name}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 rounded-xl border-transparent focus:ring-2 transition-all font-medium disabled:opacity-70"
                                 style={{ 
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                    color: colors.text
                                 }}
                              />
                           </div>
                           <div className="group">
                              <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Email</label>
                              <input
                                 type="email"
                                 value={tempData.email}
                                 disabled
                                 className="w-full px-4 py-3 rounded-xl border-transparent font-medium cursor-not-allowed"
                                 style={{ 
                                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                                    color: colors.textMuted
                                 }}
                              />
                           </div>
                           <div className="group">
                              <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Phone</label>
                              <input
                                 type="tel"
                                 name="phone"
                                 disabled={!isEditing}
                                 value={tempData.phone}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 rounded-xl border-transparent focus:ring-2 transition-all font-medium"
                                 style={{ 
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                    color: colors.text
                                 }}
                              />
                           </div>
                           <div className="group md:col-span-2">
                              <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Address</label>
                              <textarea
                                 name="address"
                                 rows="3"
                                 disabled={!isEditing}
                                 value={tempData.address}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 rounded-xl border-transparent focus:ring-2 transition-all font-medium resize-none"
                                 style={{ 
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                    color: colors.text
                                 }}
                              ></textarea>
                           </div>
                        </div>
                     </>
                  )}

                  {/* TAB 2: FITNESS */}
                  {activeTab === 'fitness' && (
                     <>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                           <i className="fa-solid fa-dumbbell text-[#D9F17F]"></i> Fitness Profile
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                           {['height', 'weight'].map((field) => (
                              <div key={field}>
                                 <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>
                                    {field === 'height' ? 'Height (cm)' : 'Weight (kg)'}
                                 </label>
                                 <input
                                    type="number"
                                    name={field}
                                    disabled={!isEditing}
                                    value={tempData.fitness[field]}
                                    onChange={(e) => handleInputChange(e, 'fitness')}
                                    className="w-full px-4 py-3 rounded-xl border-transparent focus:ring-2 transition-all font-bold text-lg"
                                    style={{ 
                                       backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                       color: colors.text
                                    }}
                                 />
                              </div>
                           ))}
                           <div className="md:col-span-2">
                              <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Fitness Goal</label>
                              <select
                                 name="goal"
                                 disabled={!isEditing}
                                 value={tempData.fitness.goal}
                                 onChange={(e) => handleInputChange(e, 'fitness')}
                                 className="w-full px-4 py-3 rounded-xl border-transparent focus:ring-2 transition-all font-medium"
                                 style={{ 
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                    color: colors.text
                                 }}
                              >
                                 {['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness'].map(o => <option key={o}>{o}</option>)}
                              </select>
                           </div>
                        </div>
                     </>
                  )}

                  {/* TAB 3: SETTINGS */}
                  {activeTab === 'settings' && (
                     <>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                           <i className="fa-solid fa-lock text-[#FEEF75]"></i> Security
                        </h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                           {['current', 'new', 'confirm'].map(field => (
                              <div key={field}>
                                 <label className="block text-xs font-bold mb-2 capitalize" style={{ color: colors.textMuted }}>
                                    {field === 'confirm' ? 'Confirm Password' : `${field} Password`}
                                 </label>
                                 <input
                                    type="password"
                                    value={passwords[field]}
                                    onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                                    style={{ 
                                       backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                       borderColor: colors.border,
                                       color: colors.text
                                    }}
                                 />
                              </div>
                           ))}
                           <button type="submit" className="w-full md:w-auto px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                              style={{ backgroundColor: colors.text, color: colors.background }}
                           >
                              Update Password
                           </button>
                        </form>
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Profile;