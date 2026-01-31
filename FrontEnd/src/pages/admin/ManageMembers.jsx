import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast'; // Updated Toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import Context

const ManageMember = () => {
  const { api, BACKEND_URL } = useGlobalContext();
  const { colors, theme } = useTheme(); // Consume Theme

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlan, setFilterPlan] = useState("All");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    gender: "Male",
    plan: "",
    height: "",
    currentWeight: "",
    fitnessGoal: ""
  });

  const [selectedMember, setSelectedMember] = useState(null);

  // --- STYLE INJECTION ---
  useEffect(() => {
    // Only injecting FA
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkFA);
    };
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [membersRes, plansRes] = await Promise.all([
        api.get("/members/all/manage"),
        api.get("/plans")
      ]);
      setMembers(membersRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPERS ---
  const getStatusColor = (status) => {
    if (status === "Inactive") return theme === 'dark' 
        ? "bg-gray-800 text-gray-400 border-gray-700" 
        : "bg-gray-100 text-gray-500 border-gray-200";
    
    return theme === 'dark'
        ? "bg-[#D9F17F]/20 text-[#D9F17F] border-[#D9F17F]/30"
        : "bg-[#D9F17F] text-green-800 border-green-200";
  };

  const getPlanName = (planData) => {
    if (!planData) return "No Plan";
    return typeof planData === "object" ? planData.name : planData;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/${path}`;
  };

  const handleExportCSV = () => {
    const headers = ["ID,Name,Email,Phone,Plan,Status"];
    const rows = members.map(m => `${m._id},${m.name},${m.email},${m.phone},${getPlanName(m.plan)},${m.status}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gym_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported!");
  };

  const handleEditClick = (member) => {
    setFormData({
      _id: member._id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      password: "",
      age: member.age || "",
      gender: member.gender || "Male",
      plan: member.plan?._id || member.plan || "",
      height: member.height || "",
      currentWeight: member.currentWeight || "",
      fitnessGoal: member.fitnessGoal || ""
    });
    setIsEditing(true);
    setViewState("form");
  };

  const handleAddClick = () => {
    setFormData({
      _id: null, name: "", email: "", phone: "", password: "", age: "", gender: "Male",
      plan: "", height: "", currentWeight: "", fitnessGoal: ""
    });
    setIsEditing(false);
    setViewState("form");
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { password, ...updateData } = formData;
        await api.put(`/members/${formData._id}`, updateData);
        toast.success("Member updated successfully");
      } else {
        if (!formData.password) return toast.error("Password is required");
        await api.post("/members", formData);
        toast.success("Member registered successfully");
      }
      setViewState("list");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Change status for this member?")) {
      try {
        await api.put(`/members/${id}/deactivate`);
        toast.success("Status updated");
        fetchData();
      } catch (err) {
        toast.error("Failed to update status");
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (member.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (member.phone || "").includes(searchTerm);
    const memberPlanId = member.plan?._id || member.plan;
    const matchesPlan = filterPlan === "All" || memberPlanId === filterPlan;
    const matchesStatus = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="w-full rounded-3xl p-6 md:p-10 font-sans min-h-screen transition-colors duration-300"
         style={{ backgroundColor: colors.background }}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: colors.text }}>Manage Members</h1>
          <p className="text-sm mt-1 flex items-center gap-2" style={{ color: colors.textMuted }}>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Overview of your {members.length} gym members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV} 
            className="px-5 py-2.5 rounded-2xl border text-sm font-semibold hover:shadow-md transition-all duration-300"
            style={{ 
                borderColor: colors.border,
                color: colors.textMuted,
                backgroundColor: colors.card
            }}
          >
            <i className="fa-solid fa-cloud-arrow-down mr-2"></i> Export CSV
          </button>
          <button 
            onClick={handleAddClick} 
            className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg"
            style={{ 
                backgroundColor: theme === 'dark' ? colors.primary : '#111827', 
                color: theme === 'dark' ? '#14532d' : '#fff' 
            }}
          >
            <i className="fa-solid fa-plus mr-2"></i> Add New Member
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 font-medium" style={{ color: colors.textMuted }}>Loading your team...</p>
        </div>
      ) : (
        <>
          {viewState === "list" && (
            <>
              {/* Filters Bar */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="relative flex-grow min-w-[300px]">
                  <input 
                    type="text" 
                    placeholder="Search by name, email or phone..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border shadow-sm focus:outline-none focus:ring-2 transition-all text-sm" 
                    style={{ 
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                        focusRingColor: colors.secondary
                    }}
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}></i>
                </div>
                
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    className="px-4 py-3 rounded-2xl border shadow-sm text-sm focus:outline-none focus:ring-2 font-medium cursor-pointer"
                    style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                
                <select 
                    value={filterPlan} 
                    onChange={(e) => setFilterPlan(e.target.value)} 
                    className="px-4 py-3 rounded-2xl border shadow-sm text-sm focus:outline-none focus:ring-2 font-medium cursor-pointer"
                    style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
                >
                  <option value="All">All Membership Plans</option>
                  {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              {/* Table Container */}
              <div className="rounded-[2rem] border shadow-xl overflow-hidden"
                   style={{ 
                       backgroundColor: colors.card, 
                       borderColor: colors.border,
                       boxShadow: theme === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(243, 244, 246, 0.5)'
                   }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb', borderBottom: `1px solid ${colors.border}` }}>
                        <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textMuted }}>Member Info</th>
                        <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textMuted }}>Membership</th>
                        <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textMuted }}>Trainer</th>
                        <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px] text-center" style={{ color: colors.textMuted }}>Status</th>
                        <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px] text-right" style={{ color: colors.textMuted }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: colors.border }}>
                      {filteredMembers.map((member) => {
                        const imageUrl = getImageUrl(member.image);
                        return (
                        <tr key={member._id} className="transition-all duration-200 group hover:bg-opacity-50" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold shadow-sm overflow-hidden relative"
                                   style={{ backgroundColor: colors.secondary, color: '#1e3a8a' }}>
                                {imageUrl ? (
                                  <img src={imageUrl} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                  member.name.slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-bold transition-colors" style={{ color: colors.text }}>{member.name}</div>
                                <div className="text-xs font-medium" style={{ color: colors.textMuted }}>{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-semibold" style={{ color: colors.text }}>{getPlanName(member.plan)}</span>
                              <span className="text-[11px] font-medium" style={{ color: colors.textMuted }}>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                               <span className="font-medium" style={{ color: colors.textMuted }}>{typeof member.trainer === 'object' ? member.trainer?.name : member.trainer || "Unassigned"}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { setSelectedMember(member); setViewState("details"); }} className="p-2.5 rounded-xl transition-all" style={{ color: colors.textMuted }} title="View Profile"><i className="fa-solid fa-user-gear hover:text-blue-500"></i></button>
                              <button onClick={() => handleEditClick(member)} className="p-2.5 rounded-xl transition-all" style={{ color: colors.textMuted }} title="Edit Details"><i className="fa-solid fa-pen-nib hover:text-green-500"></i></button>
                              <button onClick={() => handleDeactivate(member._id)} className="p-2.5 rounded-xl transition-all" style={{ color: colors.textMuted }} title="Toggle Status"><i className="fa-solid fa-ban hover:text-red-500"></i></button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && (
                    <div className="py-20 text-center" style={{ color: colors.textMuted }}>
                      <i className="fa-solid fa-inbox text-4xl mb-4 opacity-20"></i>
                      <p className="font-medium">No members match your current filters</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {viewState === "form" && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <button onClick={() => setViewState("list")} className="mb-8 px-4 py-2 text-sm font-bold flex items-center gap-2 group transition-all" style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-1 transition-transform"></i> Return to List
              </button>
              
              <div className="p-8 md:p-10 rounded-[2.5rem] border shadow-xl"
                   style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="mb-8 border-b pb-6" style={{ borderColor: colors.border }}>
                  <h2 className="text-2xl font-black" style={{ color: colors.text }}>{isEditing ? "Update Profile" : "Register Member"}</h2>
                  <p className="mt-1 text-sm font-medium" style={{ color: colors.textMuted }}>Manage member details and access.</p>
                </div>

                <form onSubmit={handleSaveMember} className="space-y-6">
                  
                  {/* Personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {['Full Name', 'Email Address', 'Phone Number'].map((label, i) => {
                        const field = i === 0 ? 'name' : i === 1 ? 'email' : 'phone';
                        return (
                            <div key={label}>
                                <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>{label}</label>
                                <input 
                                    required 
                                    type={field === 'email' ? 'email' : 'text'}
                                    value={formData[field]} 
                                    onChange={e => setFormData({ ...formData, [field]: e.target.value })} 
                                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm" 
                                    style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: colors.text, borderColor: colors.border }}
                                    placeholder={`Enter ${label.toLowerCase()}`} 
                                />
                            </div>
                        )
                    })}
                    {!isEditing && (
                      <div>
                          <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Create Password</label>
                          <input 
                             required type="password" 
                             value={formData.password} 
                             onChange={e => setFormData({ ...formData, password: e.target.value })} 
                             className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm" 
                             style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: colors.text, borderColor: colors.border }}
                             placeholder="••••••••" 
                          />
                      </div>
                    )}
                  </div>

                  {/* Demographics & Physical */}
                  <div className="grid grid-cols-2 gap-5">
                     {['Gender', 'Age', 'Height (cm)', 'Weight (kg)'].map((label, i) => {
                         const field = i === 0 ? 'gender' : i === 1 ? 'age' : i === 2 ? 'height' : 'currentWeight';
                         return (
                             <div key={label}>
                                <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>{label}</label>
                                {field === 'gender' ? (
                                    <select 
                                        value={formData.gender} 
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })} 
                                        className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                                        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: colors.text, borderColor: colors.border }}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <input 
                                        type="number" 
                                        value={formData[field]} 
                                        onChange={e => setFormData({ ...formData, [field]: e.target.value })} 
                                        className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                                        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: colors.text, borderColor: colors.border }}
                                    />
                                )}
                             </div>
                         )
                     })}
                  </div>

                  {/* Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Assign Plan</label>
                        <select 
                            required value={formData.plan} 
                            onChange={e => setFormData({ ...formData, plan: e.target.value })} 
                            className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: colors.text, borderColor: colors.border }}
                        >
                           <option value="">Select Membership</option>
                           {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Primary Goal</label>
                        <select 
                            value={formData.fitnessGoal} 
                            onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })} 
                            className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: colors.text, borderColor: colors.border }}
                        >
                           <option value="">Select Goal</option>
                           <option>Weight Loss</option>
                           <option>Muscle Gain</option>
                           <option>General Fitness</option>
                           <option>Endurance</option>
                        </select>
                     </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setViewState("list")} className="px-6 py-2.5 rounded-xl border text-sm font-bold transition-all" style={{ borderColor: colors.border, color: colors.textMuted }}>
                      Cancel
                    </button>
                    <button type="submit" className="px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all" style={{ backgroundColor: colors.accent, color: '#422006' }}>
                      {isEditing ? "Update Member" : "Register Member"}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {viewState === "details" && selectedMember && (
            <div className="max-w-6xl mx-auto animate-fadeIn">
              <button onClick={() => setViewState("list")} className="mb-8 px-4 py-2 text-sm font-bold flex items-center gap-2 group transition-all" style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-1 transition-transform"></i> Back to Members
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Sidebar Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 rounded-[2.5rem] border shadow-xl text-center"
                       style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <div className="relative inline-block mb-6">
                       <div className="w-28 h-28 rounded-[2rem] mx-auto flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden"
                            style={{ backgroundColor: colors.secondary, color: '#1e3a8a' }}>
                        {getImageUrl(selectedMember.image) ? (
                           <img src={getImageUrl(selectedMember.image)} alt={selectedMember.name} className="w-full h-full object-cover" />
                        ) : (
                           selectedMember.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${selectedMember.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'}`}>
                         <i className={`fa-solid ${selectedMember.status === 'Active' ? 'fa-check' : 'fa-xmark'} text-[10px] text-white`}></i>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-black" style={{ color: colors.text }}>{selectedMember.name}</h2>
                    <p className="text-sm font-medium mb-4" style={{ color: colors.textMuted }}>{selectedMember.email}</p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                       <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: colors.secondary, color: '#1e3a8a' }}>{getPlanName(selectedMember.plan)}</span>
                       <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6', color: colors.textMuted }}>{selectedMember.fitnessGoal || "No Goal"}</span>
                    </div>

                    <div className="space-y-4 pt-6 border-t" style={{ borderColor: colors.border }}>
                       <div className="flex items-center justify-between text-sm">
                          <span style={{ color: colors.textMuted }}>Phone</span>
                          <span className="font-bold" style={{ color: colors.text }}>{selectedMember.phone}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                          <span style={{ color: colors.textMuted }}>Joined On</span>
                          <span className="font-bold" style={{ color: colors.text }}>{new Date(selectedMember.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                          <span style={{ color: colors.textMuted }}>Gender</span>
                          <span className="font-bold" style={{ color: colors.text }}>{selectedMember.gender || "N/A"}</span>
                       </div>
                    </div>
                  </div>

                  {/* Physical Metrics Card */}
                  <div className="p-8 rounded-[2rem] text-white shadow-lg"
                       style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#111827' }}>
                     <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Health Profile</h3>
                     <div className="grid grid-cols-2 gap-6">
                        {['Height', 'Weight', 'Age', 'BMI Score'].map((l, i) => (
                            <div className="space-y-1" key={l}>
                                <p className="text-2xl font-black">
                                    {i === 0 ? selectedMember.height : i === 1 ? selectedMember.currentWeight : i === 2 ? selectedMember.age : "--"}
                                    <span className="text-[10px] text-gray-500 ml-1">{i === 0 ? 'CM' : i === 1 ? 'KG' : ''}</span>
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{l}</p>
                            </div>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem] relative overflow-hidden group" style={{ backgroundColor: colors.primary }}>
                      <div className="relative z-10">
                        <h3 className="text-[11px] text-green-800 font-black uppercase tracking-wider mb-2">Total Paid</h3>
                        <p className="text-4xl font-black text-green-900">₹{selectedMember.paid || 0}</p>
                      </div>
                      <i className="fa-solid fa-circle-check absolute -right-4 -bottom-4 text-9xl text-green-800/10 group-hover:scale-110 transition-transform"></i>
                    </div>
                    
                    <div className="p-8 rounded-[2.5rem] border relative overflow-hidden group"
                         style={{ 
                             backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                             borderColor: theme === 'dark' ? '#7f1d1d' : '#fee2e2'
                         }}>
                      <div className="relative z-10">
                        <h3 className="text-[11px] text-red-600 font-black uppercase tracking-wider mb-2">Balance Due</h3>
                        <p className="text-4xl font-black text-red-900 dark:text-red-400">₹{selectedMember.pending || 0}</p>
                      </div>
                      <i className="fa-solid fa-clock-rotate-left absolute -right-4 -bottom-4 text-9xl text-red-600/10 group-hover:rotate-12 transition-transform"></i>
                    </div>
                  </div>

                  {/* Payment History List */}
                  <div className="rounded-[2.5rem] border shadow-xl overflow-hidden"
                       style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <div className="p-8 flex justify-between items-center border-b" style={{ borderColor: colors.border }}>
                      <h3 className="font-black flex items-center gap-3" style={{ color: colors.text }}>
                        <i className="fa-solid fa-receipt text-blue-500"></i>
                        Recent Payments
                      </h3>
                      <button className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700">View All</button>
                    </div>
                    
                    <div className="px-8 pb-8 pt-2">
                      {selectedMember.history?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedMember.history.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border transition-colors hover:opacity-80"
                                 style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb', borderColor: colors.border }}>
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                      style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.textMuted }}>
                                    <i className="fa-solid fa-arrow-up-right-dots text-xs"></i>
                                 </div>
                                 <div>
                                   <div className="font-bold" style={{ color: colors.text }}>Payment Received</div>
                                   <div className="text-[10px] font-bold uppercase" style={{ color: colors.textMuted }}>{h.date} via {h.method}</div>
                                 </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-black" style={{ color: colors.text }}>₹{h.amount}</div>
                                <div className="text-[10px] text-green-500 font-black uppercase">Success</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                               style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb' }}>
                            <i className="fa-solid fa-magnifying-glass-dollar text-2xl" style={{ color: colors.textMuted }}></i>
                          </div>
                          <p className="text-sm font-medium" style={{ color: colors.textMuted }}>No payment history available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-end gap-3">
                     <button onClick={() => handleDeactivate(selectedMember._id)} className="px-6 py-3 rounded-2xl border font-bold text-sm transition-all hover:opacity-80"
                             style={{ borderColor: colors.border, color: colors.textMuted }}>
                        {selectedMember.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                     </button>
                     <button onClick={() => handleEditClick(selectedMember)} className="px-8 py-3 rounded-2xl font-black text-sm shadow-xl transition-all"
                             style={{ backgroundColor: colors.text, color: colors.background }}>
                        Edit Member Details
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ManageMember;