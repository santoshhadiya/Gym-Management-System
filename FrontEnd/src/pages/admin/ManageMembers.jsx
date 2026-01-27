import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

const ManageMember = () => {
  const { api } = useGlobalContext();
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

  const getStatusColor = (status) => {
    if (status === "Inactive") return "bg-gray-100 text-gray-500 border-gray-200";
    return "bg-[#D9F17F] text-green-800 border-green-200";
  };

  const getPlanName = (planData) => {
    if (!planData) return "No Plan";
    return typeof planData === "object" ? planData.name : planData;
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
    <div className="w-full bg-[#fcfcfc] rounded-3xl p-6 md:p-10 font-sans min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Members</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Overview of your {members.length} gym members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-white hover:shadow-md transition-all duration-300">
            <i className="fa-solid fa-cloud-arrow-down mr-2"></i> Export CSV
          </button>
          <button onClick={handleAddClick} className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-gray-200">
            <i className="fa-solid fa-plus mr-2"></i> Add New Member
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading your team...</p>
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
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm" 
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium">
                  <option value="All">All Membership Plans</option>
                  {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Member Info</th>
                        <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Membership</th>
                        <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Trainer</th>
                        <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px] text-center">Status</th>
                        <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredMembers.map((member) => (
                        <tr key={member._id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{member.name}</div>
                                <div className="text-xs text-gray-400 font-medium">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{getPlanName(member.plan)}</span>
                              <span className="text-[11px] text-gray-400 font-medium">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                               <span className="text-gray-600 font-medium">{typeof member.trainer === 'object' ? member.trainer?.name : member.trainer || "Unassigned"}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { setSelectedMember(member); setViewState("details"); }} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Profile"><i className="fa-solid fa-user-gear"></i></button>
                              <button onClick={() => handleEditClick(member)} className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Edit Details"><i className="fa-solid fa-pen-nib"></i></button>
                              <button onClick={() => handleDeactivate(member._id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Toggle Status"><i className="fa-solid fa-ban"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && (
                    <div className="py-20 text-center text-gray-400">
                      <i className="fa-solid fa-inbox text-4xl mb-4 opacity-20"></i>
                      <p className="font-medium">No members match your current filters</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {viewState === "form" && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <button onClick={() => setViewState("list")} className="mb-8 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 group transition-all">
                <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-1 transition-transform"></i> Return to List
              </button>
              
              <form onSubmit={handleSaveMember} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100">
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900">{isEditing ? "Update Profile" : "Register Member"}</h2>
                  <p className="text-gray-400 mt-2 text-sm font-medium">Fill in the details below to manage your gym community member.</p>
                </div>

                <div className="space-y-10">
                  {/* Section: Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Personal Details</h3>
                    </div>
                    
                    <div className="relative">
                      <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium placeholder:text-gray-400" />
                    </div>

                    <div className="relative">
                      <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium placeholder:text-gray-400" />
                    </div>

                    <div className="relative">
                      <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <input required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium placeholder:text-gray-400" />
                    </div>

                    {!isEditing && (
                      <div className="relative">
                        <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <input required type="password" placeholder="Create Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-blue-50/50 border-2 border-dashed border-blue-100 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all font-medium" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <i className="fa-solid fa-venus-mars absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                           <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium appearance-none">
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                        <div className="relative">
                          <i className="fa-solid fa-calendar-day absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                          <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                        </div>
                    </div>
                  </div>

                  {/* Section: Physical Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <h3 className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-4">Physical Metrics</h3>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-ruler-vertical absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <input type="number" placeholder="Height (cm)" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-weight-scale absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <input type="number" placeholder="Weight (kg)" value={formData.currentWeight} onChange={e => setFormData({ ...formData, currentWeight: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                    </div>
                  </div>

                  {/* Section: Membership */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-4">Membership & Goals</h3>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-gem absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <select required value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium appearance-none">
                        <option value="">Choose a Plan</option>
                        {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-bullseye absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                      <select value={formData.fitnessGoal} onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-200 transition-all font-medium appearance-none">
                         <option value="">Select Primary Goal</option>
                         <option>Weight Loss</option>
                         <option>Muscle Gain</option>
                         <option>General Fitness</option>
                         <option>Endurance</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col md:flex-row justify-end gap-4">
                  <button type="button" onClick={() => setViewState("list")} className="px-8 py-3 rounded-2xl font-bold text-gray-400 hover:text-gray-900 transition-all order-2 md:order-1">
                    Discard Changes
                  </button>
                  <button type="submit" className="px-12 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-xl shadow-blue-100 order-1 md:order-2">
                    {isEditing ? "Save Profile" : "Register Now"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {viewState === "details" && selectedMember && (
            <div className="max-w-6xl mx-auto animate-fadeIn">
              <button onClick={() => setViewState("list")} className="mb-8 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 group transition-all">
                <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-1 transition-transform"></i> Back to Members
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Sidebar Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 text-center">
                    <div className="relative inline-block mb-6">
                       <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 to-blue-300 rounded-[2rem] mx-auto flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-200">
                        {selectedMember.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${selectedMember.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'}`}>
                         <i className={`fa-solid ${selectedMember.status === 'Active' ? 'fa-check' : 'fa-xmark'} text-[10px] text-white`}></i>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900">{selectedMember.name}</h2>
                    <p className="text-sm text-gray-400 font-medium mb-4">{selectedMember.email}</p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                       <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">{getPlanName(selectedMember.plan)}</span>
                       <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider">{selectedMember.fitnessGoal || "No Goal"}</span>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-50">
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium">Phone</span>
                          <span className="text-gray-900 font-bold">{selectedMember.phone}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium">Joined On</span>
                          <span className="text-gray-900 font-bold">{new Date(selectedMember.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium">Gender</span>
                          <span className="text-gray-900 font-bold">{selectedMember.gender || "N/A"}</span>
                       </div>
                    </div>
                  </div>

                  {/* Physical Metrics Card */}
                  <div className="bg-gray-900 p-8 rounded-[2rem] text-white">
                     <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Health Profile</h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <p className="text-2xl font-black">{selectedMember.height || "--"} <span className="text-[10px] text-gray-500">CM</span></p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Height</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-2xl font-black">{selectedMember.currentWeight || "--"} <span className="text-[10px] text-gray-500">KG</span></p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Weight</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-2xl font-black">{selectedMember.age || "--"}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Age</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-2xl font-black">--</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">BMI Score</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#D9F17F] p-8 rounded-[2.5rem] relative overflow-hidden group">
                      <div className="relative z-10">
                        <h3 className="text-[11px] text-green-800 font-black uppercase tracking-wider mb-2">Total Paid</h3>
                        <p className="text-4xl font-black text-green-900">₹{selectedMember.paid || 0}</p>
                      </div>
                      <i className="fa-solid fa-circle-check absolute -right-4 -bottom-4 text-9xl text-green-800/10 group-hover:scale-110 transition-transform"></i>
                    </div>
                    
                    <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 relative overflow-hidden group">
                      <div className="relative z-10">
                        <h3 className="text-[11px] text-red-600 font-black uppercase tracking-wider mb-2">Balance Due</h3>
                        <p className="text-4xl font-black text-red-900">₹{selectedMember.pending || 0}</p>
                      </div>
                      <i className="fa-solid fa-clock-rotate-left absolute -right-4 -bottom-4 text-9xl text-red-600/10 group-hover:rotate-12 transition-transform"></i>
                    </div>
                  </div>

                  {/* Payment History List */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 overflow-hidden">
                    <div className="p-8 flex justify-between items-center border-b border-gray-50">
                      <h3 className="font-black text-gray-900 flex items-center gap-3">
                        <i className="fa-solid fa-receipt text-blue-500"></i>
                        Recent Payments
                      </h3>
                      <button className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700">View All</button>
                    </div>
                    
                    <div className="px-8 pb-8 pt-2">
                      {selectedMember.history?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedMember.history.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-gray-100">
                                    <i className="fa-solid fa-arrow-up-right-dots text-xs"></i>
                                 </div>
                                 <div>
                                   <div className="font-bold text-gray-900">Payment Received</div>
                                   <div className="text-[10px] text-gray-400 font-bold uppercase">{h.date} via {h.method}</div>
                                 </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-black text-gray-900">₹{h.amount}</div>
                                <div className="text-[10px] text-green-500 font-black uppercase">Success</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-magnifying-glass-dollar text-gray-200 text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-400 font-medium">No payment history available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-end gap-3">
                     <button onClick={() => handleDeactivate(selectedMember._id)} className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-white transition-all">
                        {selectedMember.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                     </button>
                     <button onClick={() => handleEditClick(selectedMember)} className="px-8 py-3 rounded-2xl bg-gray-900 text-white font-black text-sm hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all">
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