import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";
import { useGlobalContext } from '../../context/GlobalContext';

const CreateAdmin = () => {
  const { colors } = useTheme();
  const { api } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const phoneRefs = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Fetch Admin List
  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/users/admins');
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Format date to DDMMYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handlePhoneChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const phoneArray = formData.phone.split('').slice(0, 10);
    while (phoneArray.length < 10) phoneArray.push('');
    
    phoneArray[index] = value.slice(-1);
    const newPhone = phoneArray.join('');
    setFormData({ ...formData, phone: newPhone });

    if (value && index < 9) phoneRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      phoneRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.phone.length < 10) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    setLoading(true);
    const loadId = toast.loading("Creating admin account...");
    try {
      await api.post('/auth/register-admin', formData); //
      toast.success("New Admin created successfully!", { id: loadId });
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      fetchAdmins(); // Refresh list after creation
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed", { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Registration Form */}
      <div 
        className="p-8 rounded-3xl shadow-sm border"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: colors.text }}>
            <i className="fa-solid fa-user-plus text-gray-300"></i> Create New Admin
          </h2>
          <p className="text-sm opacity-60 mt-1" style={{ color: colors.text }}>
            Registered admins will have full access to the management dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.text }}>Full Name</label>
              <input 
                required type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 rounded-xl outline-none border"
                style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.text }}>Email Address</label>
              <input 
                required type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded-xl outline-none border"
                style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.text }}>Mobile Number</label>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm mr-1" style={{ color: colors.text }}>+91</span>
              {[...Array(10)].map((_, i) => (
                <input
                  key={i}
                  ref={el => phoneRefs.current[i] = el}
                  type="text" maxLength="1"
                  value={formData.phone[i] || ''}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onChange={(e) => handlePhoneChange(e.target.value, i)}
                  className="w-8 h-10 text-center rounded-lg font-bold outline-none border"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.text }}>Password</label>
              <input 
                required type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 rounded-xl outline-none border"
                style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.text }}>Confirm Password</label>
              <input 
                required type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full p-3 rounded-xl outline-none border"
                style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: colors.primary, color: '#111' }}
          >
            {loading ? 'Processing...' : 'Register Admin'}
          </button>
        </form>
      </div>

      {/* Admin List Section */}
      <div 
        className="p-8 rounded-3xl shadow-sm border"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <h3 className="text-xl font-black mb-6" style={{ color: colors.text }}>
          <i className="fa-solid fa-users-gear text-gray-300 mr-2"></i> Existing Administrators
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: colors.text }}>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr 
                  key={admin._id} 
                  className="transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: colors.background }}
                >
                  <td className="px-4 py-3 rounded-l-xl font-bold" style={{ color: colors.text }}>{admin.name}</td>
                  <td className="px-4 py-3 opacity-80" style={{ color: colors.text }}>{admin.email}</td>
                  <td className="px-4 py-3 rounded-r-xl font-mono text-sm" style={{ color: colors.primary }}>
                    {formatDate(admin.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;