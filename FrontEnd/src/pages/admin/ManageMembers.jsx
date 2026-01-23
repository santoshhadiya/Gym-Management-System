import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";


const ManageMember = () => {
  const { api } = useGlobalContext();
  // --- STATE ---
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]); // State for Plans
  const [isLoading, setIsLoading] = useState(true);

  const [viewState, setViewState] = useState("list"); // 'list', 'form', 'details'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlan, setFilterPlan] = useState("All");

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    email: "",
    phone: "",
    password: "", // Only for adding
    age: "",
    gender: "Male",
    plan: "", // Stores Plan ID
    height: "",
    currentWeight: "",
    fitnessGoal: ""
  });

  // Selected Member for Details View
  const [selectedMember, setSelectedMember] = useState(null);

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
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [membersRes, plansRes] = await Promise.all([
        api.get("/members/all"),
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

  // --- HELPER FUNCTIONS ---
  const getStatusColor = (status) => {
    if (status === "Inactive") return "bg-gray-100 text-gray-500 border-gray-200";
    return "bg-[#D9F17F] text-green-800 border-green-200";
  };

  const getPlanName = (planData) => {
    if (!planData) return "No Plan";

    // If populated object
    if (typeof planData === "object" && planData.name) {
      return planData.name;
    }

    // If ObjectId string
    if (typeof planData === "string") {
      return planData
    }

    return "No Plan";
  };


  const handleExportCSV = () => {
    const headers = ["ID,Name,Email,Phone,Plan,Status,Trainer"];

    const rows = members.map(m =>

      `${m._id},${m.name},${m.email},${m.phone},${getPlanName(m.plan)},${m.status},${m.trainer}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gym_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD OPERATIONS ---

  const handleEditClick = (member) => {
    // Populate form but DO NOT set password
    setFormData({
      _id: member._id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      password: "", // Ensure password is cleared
      age: member.age || "",
      gender: member.gender || "Male",

      // IMPORTANT: Extract Plan ID correctly whether it's populated or raw
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
        // Remove password from payload for updates
        const { password, ...updateData } = formData;
        await api.put(`/members/${formData._id}`, updateData);
        toast.success("Member updated successfully");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new members");
          return;
        }
        await api.post("/members", formData);
        toast.success("Member registered successfully");
      }

      setViewState("list");
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this member? They will not be able to login.")) {
      try {
        await api.put(`/members/${id}/deactivate`);
        toast.success("Member deactivated");
        fetchData();
      } catch (err) {
        toast.error("Failed to deactivate member");
      }
    }
  };

  // --- FILTER LOGIC ---
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);

    // Safely get plan ID string for filtering
    const memberPlanId = member.plan?._id || member.plan;
    const matchesPlan = filterPlan === "All" || memberPlanId === filterPlan;

    const matchesStatus = filterStatus === "All" || member.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Members</h1>
          <p className="text-sm text-gray-500 mt-1">Total Members: {members.length}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <i className="fa-solid fa-download mr-2"></i> Export CSV
          </button>
          <button
            onClick={handleAddClick}
            className="px-5 py-2 rounded-full bg-[#CDE7FE] text-blue-900 text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-plus mr-2"></i> Add Member
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
        </div>
      ) : (
        <>
          {/* 1. VIEW ALL (LIST) */}
          {viewState === "list" && (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative col-span-2">
                  <input
                    type="text"
                    placeholder="Search by Name, Phone, or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                  />
                  <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
                >
                  <option value="All">All Plans</option>
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-900">Member Info</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Membership</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Assigned Trainer</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-600 font-bold text-xs">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-xs text-gray-400">{member.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{getPlanName(member.plan)}</span>
                            <span className="text-xs text-gray-400">Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-user-tie text-gray-300"></i>
                            <span>{member.trainer || "Unassigned"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedMember(member); setViewState("details"); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button onClick={() => handleEditClick(member)} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Edit">
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onClick={() => handleDeactivate(member._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Deactivate">
                              <i className="fa-solid fa-ban"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredMembers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <i className="fa-solid fa-ghost text-2xl mb-2"></i>
                    <p>No members found matching your filters.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 2. ADD / EDIT FORM */}
          {viewState === "form" && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setViewState("list")} className="mb-6 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> Back to List
              </button>

              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? "Edit Member Details" : "Register New Member"}</h2>

                <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Account Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <input required type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />

                      {/* Password Field - Only for New Members */}
                      {!isEditing && (
                        <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-yellow-50" />
                      )}
                    </div>
                  </div>

                  {/* Physical Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">Physical Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex gap-2">
                        <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      </div>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Height (cm)" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      </div>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Weight (kg)" value={formData.currentWeight} onChange={e => setFormData({ ...formData, currentWeight: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      </div>
                      <div className="md:col-span-3">
                        <select value={formData.fitnessGoal} onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                          <option value="">Select Goal</option>
                          <option>Weight Loss</option>
                          <option>Muscle Gain</option>
                          <option>General Fitness</option>
                          <option>Endurance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Membership Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">Membership & Training</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dynamic Plan Selector */}
                      <select
                        required
                        value={formData.plan}
                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white"
                      >
                        <option value="">Select Plan</option>
                        {plans.map(p => (
                          <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                        ))}
                      </select>

                      {/* Replaced Trainer Select with Disabled Input */}
                      <input
                        disabled
                        value="Unassigned"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 focus:outline-none cursor-not-allowed"
                        placeholder="Trainer (Unassigned)"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setViewState("list")} className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 rounded-xl bg-[#FEEF75] text-yellow-900 font-bold hover:bg-yellow-300 shadow-sm">
                      {isEditing ? "Update Member" : "Create Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. MEMBER DETAILS (READ ONLY) */}
          {viewState === "details" && selectedMember && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setViewState("list")} className="mb-6 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> Back to List
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile Card */}
                <div className="bg-gradient-to-br from-[#f8f9fa] to-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center md:col-span-1">
                  <div className="w-24 h-24 bg-[#CDE7FE] rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
                    {selectedMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">Member Since: {new Date(selectedMember.joinDate).toLocaleDateString()}</p>

                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-6 ${getStatusColor(selectedMember.status)}`}>
                    {selectedMember.status}
                  </div>

                  <div className="text-left space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-400">Plan</span>
                      <span className="font-medium text-gray-800">{getPlanName(selectedMember.plan)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-400">Trainer</span>
                      <span className="font-medium text-gray-800">{selectedMember.trainer}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-gray-800 truncate w-32 text-right" title={selectedMember.email}>{selectedMember.email}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-2 space-y-6">

                  {/* Progress & Attendance (HARDCODED/MOCKED FROM API) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f0fdf4] border border-green-100 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-check-double text-green-500"></i>
                        <h3 className="font-semibold text-gray-700 text-sm">Attendance</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedMember.attendance?.present || 0} <span className="text-xs font-normal text-gray-400">Days</span></p>
                      <p className="text-xs text-gray-500 mt-1">Last Visit: {selectedMember.attendance?.lastVisit || "N/A"}</p>
                    </div>

                    <div className="bg-[#fffbeb] border border-yellow-100 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-dumbbell text-yellow-500"></i>
                        <h3 className="font-semibold text-gray-700 text-sm">Progress</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedMember.progress?.workouts || 0} <span className="text-xs font-normal text-gray-400">Workouts</span></p>
                      <p className="text-xs text-gray-500 mt-1">Weight Change: {selectedMember.progress?.weightLoss || "-"}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
                      Payment History
                      <button className="text-xs text-blue-500 hover:underline">View Full History</button>
                    </h3>
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-400">Last Payment</p>
                        <p className="font-medium text-gray-900">{selectedMember.payment?.lastPayment || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Pending Dues</p>
                        <p className={`font-bold ${selectedMember.payment?.pending > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ₹{selectedMember.payment?.pending || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 py-2 bg-[#D9F17F] text-green-900 rounded-xl text-sm font-bold hover:bg-green-300 transition-colors">
                        Record Payment
                      </button>
                      <button className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        Send Invoice
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageMember;