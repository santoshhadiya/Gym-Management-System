import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";
import { useGlobalContext } from '../../context/GlobalContext';

const AdminProfile = () => {
  const { colors, theme } = useTheme();
  const { api,BACKEND_URL } = useGlobalContext();
  
  // States for Loading and Editing Toggles
  const [loading, setLoading] = useState(true);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [isEditingGym, setIsEditingGym] = useState(false);

  // Separate States for Data
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', profileImage: ''
  });
  const [companyData, setCompanyData] = useState({
    name: '', address: '', mobile: '', email: '',
    instagram: '', facebook: '', logo: '' // Added facebook to state
  });
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const adminFileRef = useRef(null);

  // Fetch All Data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminRes, companyRes] = await Promise.all([
          api.get('/admin/profile'),
          api.get('/company')
        ]);
        setFormData({
          name: adminRes.data.name,
          email: adminRes.data.email,
          phone: adminRes.data.phone,
          address: adminRes.data.address || '',
          profileImage: adminRes.data.profileImage
        });
        setCompanyData(companyRes.data || companyData);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load profiles");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- ADMIN ACTIONS ---
  const handleAdminImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("file", file);
    const loadId = toast.loading("Uploading...");
    try {
      const { data } = await api.post("/admin/profile/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData(prev => ({ ...prev, profileImage: data.profileImage }));
      toast.success("Admin photo updated", { id: loadId });
    } catch (err) { toast.error("Upload failed", { id: loadId }); }
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    const loadId = toast.loading("Saving Admin details...");
    try {
      await api.put('/admin/profile', formData);
      setIsEditingAdmin(false);
      toast.success("Admin profile updated", { id: loadId });
    } catch (err) { toast.error("Update failed", { id: loadId }); }
  };

  // --- GYM ACTIONS ---
  const handleGymUpdate = async (e) => {
    e.preventDefault();
    const loadId = toast.loading("Saving Gym details...");
    try {
      await api.post('/company', companyData);
      setIsEditingGym(false);
      toast.success("Gym info updated", { id: loadId });
    } catch (err) { toast.error("Update failed", { id: loadId }); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwords mismatch");
    try {
      await api.put('/admin/profile', { password: passwords.new });
      toast.success("Password changed!");
      setPasswords({ new: '', confirm: '' });
    } catch (err) { toast.error("Update failed"); }
  };

  if (loading) return <div className="p-20 text-center" style={{ color: colors.text }}>Loading Profiles...</div>;

  const inputStyle = (editable) => ({
    backgroundColor: colors.background,
    color: colors.text,
    border: `1px solid ${editable ? colors.primary : colors.border}`,
    opacity: editable ? 1 : 0.7
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* SECTION 1: ADMIN PERSONAL PROFILE */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: colors.text }}>
            <i className="fa-solid fa-user-shield text-xl" style={{ color: colors.primary }}></i> Admin Personal Profile
          </h2>
          <button
            onClick={() => setIsEditingAdmin(!isEditingAdmin)}
            className="px-5 py-2 rounded-xl font-bold transition-all text-sm"
            style={{ backgroundColor: isEditingAdmin ? colors.card : colors.primary, color: isEditingAdmin ? colors.text : '#111' }}
          >
            {isEditingAdmin ? 'Cancel' : 'Edit Admin Info'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-3xl shadow-sm" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <form onSubmit={handleAdminUpdate} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative group cursor-pointer" onClick={() => isEditingAdmin && adminFileRef.current.click()}>
                  <img
                    src={formData.profileImage.startsWith('uploads') ? `${BACKEND_URL}/${formData.profileImage}` : formData.profileImage}
                    className="w-32 h-32 rounded-3xl object-cover border-4"
                    style={{ borderColor: colors.primary }}
                    alt="Admin"
                  />
                  {isEditingAdmin && <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center"><i className="fa-solid fa-camera text-white text-2xl"></i></div>}
                  <input type="file" ref={adminFileRef} hidden onChange={handleAdminImage} />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Full Name</label>
                    <input value={formData.name} disabled={!isEditingAdmin} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingAdmin)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Personal Email</label>
                    <input value={formData.email} disabled className="w-full p-3 rounded-xl opacity-50" style={inputStyle(false)} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Personal Phone</label>
                  <input value={formData.phone} disabled={!isEditingAdmin} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingAdmin)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Home Address</label>
                  <input value={formData.address} disabled={!isEditingAdmin} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingAdmin)} />
                </div>
              </div>
              {isEditingAdmin && (
                <button type="submit" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg" style={{ backgroundColor: colors.primary, color: '#111' }}>
                  Save Personal Changes
                </button>
              )}
            </form>
          </div>

          <div className="p-8 rounded-3xl shadow-sm h-fit" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><i className="fa-solid fa-key text-sm opacity-50"></i> Security</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input type="password" placeholder="New Password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(true)} />
              <input type="password" placeholder="Confirm Password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(true)} />
              <button type="submit" className="w-full py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest" style={{ backgroundColor: colors.text, color: colors.background }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION 2: GYM PUBLIC INFORMATION */}
      <div className="space-y-4 pt-4 border-t" style={{ borderColor: colors.border }}>
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: colors.text }}>
            <i className="fa-solid fa-dumbbell text-xl" style={{ color: colors.primary }}></i> Gym Public Information
          </h2>
          <button
            onClick={() => setIsEditingGym(!isEditingGym)}
            className="px-5 py-2 rounded-xl font-bold transition-all text-sm"
            style={{ backgroundColor: isEditingGym ? colors.card : colors.primary, color: isEditingGym ? colors.text : '#111' }}
          >
            {isEditingGym ? 'Cancel' : 'Edit Gym Info'}
          </button>
        </div>

        <div className="p-8 rounded-3xl shadow-sm" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
          <form onSubmit={handleGymUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Gym Name</label>
                <input value={companyData.name} disabled={!isEditingGym} onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingGym)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Gym Support Email</label>
                <input value={companyData.email} disabled={!isEditingGym} onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingGym)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Gym Mobile Number</label>
                <input value={companyData.mobile} disabled={!isEditingGym} onChange={(e) => setCompanyData({ ...companyData, mobile: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingGym)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Instagram URL</label>
                <input value={companyData.instagram} disabled={!isEditingGym} onChange={(e) => setCompanyData({ ...companyData, instagram: e.target.value })} className="w-full p-3 rounded-xl outline-none" style={inputStyle(isEditingGym)} />
              </div>
              {/* --- ADDED FACEBOOK INPUT --- */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Facebook URL</label>
                <input 
                  value={companyData.facebook} 
                  disabled={!isEditingGym} 
                  onChange={(e) => setCompanyData({ ...companyData, facebook: e.target.value })} 
                  className="w-full p-3 rounded-xl outline-none" 
                  style={inputStyle(isEditingGym)} 
                  placeholder="https://facebook.com/yourgym"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Gym Full Address</label>
                <textarea value={companyData.address} disabled={!isEditingGym} onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })} rows="4" className="w-full p-3 rounded-xl outline-none resize-none" style={inputStyle(isEditingGym)} />
              </div>
              {isEditingGym && (
                <button type="submit" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg" style={{ backgroundColor: colors.primary, color: '#111' }}>
                  Save Gym Info
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;