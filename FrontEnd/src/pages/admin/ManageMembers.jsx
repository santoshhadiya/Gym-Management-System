import React, { useState, useEffect } from "react";

const ManageMember = () => {
  // --- MOCK DATA ---
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Riya Patel",
      email: "riya.patel@example.com",
      phone: "9876543210",
      age: 24,
      gender: "Female",
      plan: "Yearly Plan",
      joinDate: "2024-01-15",
      startDate: "2024-01-15",
      endDate: "2025-01-15", // Active
      trainer: "Raj Mehta",
      status: "Active",
      attendance: { present: 145, lastVisit: "2024-10-24" },
      payment: { lastPayment: "2024-01-15", pending: 0, historyLink: "#" },
      progress: { weightLoss: "5kg", workouts: 120 }
    },
    {
      id: 2,
      name: "Amit Sharma",
      email: "amit.sharma@test.com",
      phone: "9123456789",
      age: 30,
      gender: "Male",
      plan: "Monthly Plan",
      joinDate: "2024-09-01",
      startDate: "2024-10-01",
      endDate: "2024-10-31", // Expiring soon (assuming current date is around late Oct)
      trainer: "Vikram Singh",
      status: "Active",
      attendance: { present: 20, lastVisit: "2024-10-28" },
      payment: { lastPayment: "2024-10-01", pending: 500, historyLink: "#" },
      progress: { weightLoss: "2kg", workouts: 18 }
    },
    {
      id: 3,
      name: "John Doe",
      email: "john.doe@gym.com",
      phone: "9988776655",
      age: 28,
      gender: "Male",
      plan: "Quarterly Plan",
      joinDate: "2024-06-01",
      startDate: "2024-06-01",
      endDate: "2024-09-01", // Expired
      trainer: "Sneha Rathi",
      status: "Inactive",
      attendance: { present: 45, lastVisit: "2024-08-30" },
      payment: { lastPayment: "2024-06-01", pending: 0, historyLink: "#" },
      progress: { weightLoss: "0kg", workouts: 40 }
    },
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'form', 'details'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlan, setFilterPlan] = useState("All");
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: "", email: "", phone: "", age: "", gender: "Male",
    plan: "Monthly Plan", startDate: "", endDate: "", trainer: "",
  });

  // Selected Member for Details View
  const [selectedMember, setSelectedMember] = useState(null);

  // --- HELPER FUNCTIONS ---

  // Calculate Status based on End Date
  const calculateStatusInfo = (endDate, manualStatus) => {
    if (manualStatus === "Inactive") return { label: "Inactive", color: "bg-gray-100 text-gray-500 border-gray-200" };

    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Expired", color: "bg-red-50 text-red-600 border-red-100" };
    if (diffDays <= 7) return { label: `Expiring in ${diffDays}d`, color: "bg-[#FEEF75] text-yellow-800 border-yellow-200" };
    return { label: "Active", color: "bg-[#D9F17F] text-green-800 border-green-200" };
  };

  const handleExportCSV = () => {
    const headers = ["ID,Name,Email,Phone,Plan,Status,Trainer,EndDate"];
    const rows = members.map(m => 
      `${m.id},${m.name},${m.email},${m.phone},${m.plan},${m.status},${m.trainer},${m.endDate}`
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
    setFormData({ ...member });
    setIsEditing(true);
    setViewState("form");
  };

  const handleAddClick = () => {
    setFormData({
      id: null, name: "", email: "", phone: "", age: "", gender: "Male",
      plan: "Monthly Plan", startDate: new Date().toISOString().split('T')[0], endDate: "", trainer: "Unassigned",
    });
    setIsEditing(false);
    setViewState("form");
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (isEditing) {
      setMembers(members.map(m => m.id === formData.id ? { ...m, ...formData } : m));
    } else {
      const newMember = {
        ...formData,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        status: "Active",
        attendance: { present: 0, lastVisit: "N/A" },
        payment: { lastPayment: "Pending", pending: 0 },
        progress: { weightLoss: "0kg", workouts: 0 }
      };
      setMembers([newMember, ...members]);
    }
    setViewState("list");
  };

  const handleDelete = (id) => {
    if (window.confirm("Soft delete this member? Status will be set to Inactive.")) {
      setMembers(members.map(m => m.id === id ? { ...m, status: "Inactive" } : m));
    }
  };

  const handleSendNotification = (type, memberName) => {
    alert(`${type} notification sent to ${memberName}!`);
  };

  // --- FILTER LOGIC ---
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.phone.includes(searchTerm);
    const matchesPlan = filterPlan === "All" || member.plan === filterPlan;
    
    // Status Logic for Filter
    const statusInfo = calculateStatusInfo(member.endDate, member.status);
    const matchesStatus = filterStatus === "All" 
      ? true 
      : filterStatus === "Expiring" 
        ? statusInfo.label.includes("Expiring") 
        : statusInfo.label.includes(filterStatus);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen">
      
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

      {/* --- CONDITIONAL RENDERING --- */}
      
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
              <option value="Expiring">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select 
              value={filterPlan} 
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
            >
              <option value="All">All Plans</option>
              <option value="Monthly Plan">Monthly Plan</option>
              <option value="Quarterly Plan">Quarterly Plan</option>
              <option value="Yearly Plan">Yearly Plan</option>
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
                {filteredMembers.map((member) => {
                  const statusInfo = calculateStatusInfo(member.endDate, member.status);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-600 font-bold text-xs">
                              {member.name.slice(0,2).toUpperCase()}
                           </div>
                           <div>
                             <div className="font-medium text-gray-900">{member.name}</div>
                             <div className="text-xs text-gray-400">{member.phone}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-medium text-gray-900">{member.plan}</span>
                           <span className="text-xs text-gray-400">Ends: {member.endDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <i className="fa-solid fa-user-tie text-gray-300"></i>
                           <span>{member.trainer || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
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
                          <button onClick={() => handleSendNotification("Payment Reminder", member.name)} className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Send Reminder">
                            <i className="fa-solid fa-bell"></i>
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Soft Delete">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              
              {/* Personal Info */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  <input required type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  <div className="flex gap-4">
                    <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-1/2 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-1/2 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Membership Info */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">Membership & Training</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                    <option>Monthly Plan</option>
                    <option>Quarterly Plan</option>
                    <option>Yearly Plan</option>
                  </select>
                  <select value={formData.trainer} onChange={e => setFormData({...formData, trainer: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                    <option value="">Select Trainer</option>
                    <option>Raj Mehta</option>
                    <option>Sneha Rathi</option>
                    <option>Vikram Singh</option>
                    <option>Unassigned</option>
                  </select>
                  
                  <div>
                    <label className="text-xs text-gray-400 ml-1">Start Date</label>
                    <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 ml-1">End Date</label>
                    <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  </div>
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
                {selectedMember.name.slice(0,2).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Member Since: {selectedMember.joinDate}</p>
              
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-6 ${calculateStatusInfo(selectedMember.endDate, selectedMember.status).color}`}>
                {calculateStatusInfo(selectedMember.endDate, selectedMember.status).label}
              </div>

              <div className="text-left space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Plan</span>
                  <span className="font-medium text-gray-800">{selectedMember.plan}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Trainer</span>
                  <span className="font-medium text-gray-800">{selectedMember.trainer}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Expiry</span>
                  <span className="font-medium text-gray-800">{selectedMember.endDate}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Progress & Attendance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f0fdf4] border border-green-100 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-check-double text-green-500"></i>
                    <h3 className="font-semibold text-gray-700 text-sm">Attendance</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedMember.attendance.present} <span className="text-xs font-normal text-gray-400">Days</span></p>
                  <p className="text-xs text-gray-500 mt-1">Last Visit: {selectedMember.attendance.lastVisit}</p>
                </div>
                
                <div className="bg-[#fffbeb] border border-yellow-100 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-dumbbell text-yellow-500"></i>
                    <h3 className="font-semibold text-gray-700 text-sm">Progress</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedMember.progress.workouts} <span className="text-xs font-normal text-gray-400">Workouts</span></p>
                  <p className="text-xs text-gray-500 mt-1">Weight Change: {selectedMember.progress.weightLoss}</p>
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
                      <p className="font-medium text-gray-900">{selectedMember.payment.lastPayment}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-gray-400">Pending Dues</p>
                      <p className={`font-bold ${selectedMember.payment.pending > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ₹{selectedMember.payment.pending}
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

    </div>
  );
};

export default ManageMember;