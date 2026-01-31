import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast'; // Updated Toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import Context

const ManageTrainer = () => {
  const { api } = useGlobalContext();
  const { colors, theme } = useTheme(); // Consume Theme

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

  // --- DATA STATE ---
  const [trainers, setTrainers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'form', 'details'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpec, setFilterSpec] = useState("All");

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: null, name: "", email: "", phone: "", gender: "Male",
    specialization: "", experience: "", certifications: "",
    schedule: "", salaryAmount: "", status: "Active", password: ""
  });

  // Selected Trainer for Details View
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // --- FETCH DATA ---
  const fetchTrainers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/trainers/data");
      setTrainers(res.data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast.error("Failed to load trainers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // --- FETCH DETAILS ---
  const fetchTrainerDetails = async (trainer) => {
    setSelectedTrainer(trainer);
    setViewState("details");
    try {
      const res = await api.get(`/trainers/${trainer._id}/members`);
      setAssignedMembers(res.data);
    } catch (error) {
      console.error("Error fetching assigned members:", error);
      setAssignedMembers([]); 
    }
  };

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": 
        return theme === 'dark' 
          ? "bg-green-900/30 text-green-400 border-green-800" 
          : "bg-[#D9F17F] text-green-800 border-green-200";
      case "On Leave": 
        return theme === 'dark' 
          ? "bg-yellow-900/30 text-yellow-400 border-yellow-800" 
          : "bg-[#FEEF75] text-yellow-800 border-yellow-200";
      default: 
        return theme === 'dark'
          ? "bg-gray-800 text-gray-400 border-gray-700"
          : "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID,Name,Email,Phone,Specialization,Status,Experience"];
    const rows = trainers.map(t =>
      `${t._id},${t.name},${t.email},${t.phone},${t.specialization},${t.status},${t.experience}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "trainers_list.csv";
    link.click();
    toast.success("CSV Exported");
  };

  // --- CRUD OPERATIONS ---
  const handleAddClick = () => {
    setFormData({
      _id: null, name: "", email: "", phone: "", gender: "Male",
      specialization: "", experience: "", certifications: "",
      schedule: "", salaryAmount: "", status: "Active"
    });
    setIsEditing(false);
    setViewState("form");
  };

  const handleEditClick = (trainer) => {
    setFormData({
      _id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      gender: trainer.gender,
      status: trainer.status,

      specialization: trainer.specialization || "",
      experience: trainer.experience || "",
      certifications: trainer.certifications?.join(", ") || "",
      schedule: trainer.schedule || "",
      salaryAmount: trainer.salary?.monthly || "",
    });

    setIsEditing(true);
    setViewState("form");
  };

  const handleSaveTrainer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      status: formData.status,

      trainerDetails: {
        specialization: formData.specialization,
        experience: formData.experience,
        certifications: formData.certifications.split(",").map(c => c.trim()).filter(Boolean),
        schedule: formData.schedule,
        salary: {
          monthly: Number(formData.salaryAmount),
          status: "Pending",
        },
      },
    };

    try {
      if (isEditing) {
        await api.put(`/trainers/${formData._id}`, payload);
        toast.success("Trainer updated successfully");
      } else {
        const registerPayload = {
          ...payload,
          password: formData.password,
        };
        await api.post("/auth/register-trainer", registerPayload);
        toast.success("Trainer registered successfully");
      }
      setViewState("list");
      fetchTrainers(); 
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTERING ---
  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm);
    const matchesSpec = filterSpec === "All" || t.specialization === filterSpec;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen transition-colors duration-300"
         style={{ backgroundColor: colors.background, borderColor: colors.border }}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Manage Trainers</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Total Trainers: {trainers.length}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV} 
            className="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
            style={{ 
               borderColor: colors.border, 
               color: colors.textMuted,
               backgroundColor: colors.card
            }}
          >
            <i className="fa-solid fa-download mr-2"></i> Export CSV
          </button>
          <button 
            onClick={handleAddClick} 
            className="px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
            style={{ backgroundColor: colors.primary, color: '#14532d' }} // Lime Green with dark text
          >
            <i className="fa-solid fa-plus mr-2"></i> Add Trainer
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.textMuted }}></i>
        </div>
      ) : (
        <>
          {/* 1. LIST VIEW */}
          {viewState === "list" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative col-span-3">
                  <input
                    type="text"
                    placeholder="Search by Name or Phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ 
                       backgroundColor: colors.card, 
                       borderColor: colors.border,
                       color: colors.text
                    }}
                  />
                  <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: colors.textMuted }}></i>
                </div>
                <select
                  value={filterSpec}
                  onChange={(e) => setFilterSpec(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 cursor-pointer"
                  style={{ 
                     backgroundColor: colors.card, 
                     borderColor: colors.border,
                     color: colors.text
                  }}
                >
                  <option value="All">All Specializations</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Yoga">Yoga</option>
                  <option value="CrossFit">CrossFit</option>
                </select>
              </div>

              <div className="overflow-hidden rounded-2xl border shadow-sm"
                   style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <table className="w-full border-collapse text-left text-sm" style={{ color: colors.textMuted }}>
                  <thead style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f8f9fa' }}>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Trainer Info</th>
                      <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Expertise</th>
                      <th className="px-6 py-4 font-semibold text-center" style={{ color: colors.text }}>Active Clients</th>
                      <th className="px-6 py-4 font-semibold text-center" style={{ color: colors.text }}>Status</th>
                      <th className="px-6 py-4 font-semibold text-right" style={{ color: colors.text }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: colors.border }}>
                    {filteredTrainers.map((trainer) => (
                      <tr key={trainer._id} className="transition-colors hover:bg-opacity-50" 
                          style={{ 
                             borderBottom: `1px solid ${colors.border}`,
                             backgroundColor: theme === 'dark' ? 'transparent' : '#fff'
                          }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs"
                                 style={{ backgroundColor: colors.secondary, color: '#1e3a8a' }}>
                              {trainer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: colors.text }}>{trainer.name}</div>
                              <div className="text-xs" style={{ color: colors.textMuted }}>{trainer.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium" style={{ color: colors.text }}>{trainer.specialization}</span>
                            <span className="text-xs" style={{ color: colors.textMuted }}>{trainer.experience} Exp.</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                                style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#eff6ff', color: theme === 'dark' ? '#93c5fd' : '#1d4ed8' }}>
                            {trainer.performance?.activeMembers || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(trainer.status)}`}>
                            {trainer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => fetchTrainerDetails(trainer)} className="p-2 transition-colors" style={{ color: colors.textMuted }} title="View Details">
                              <i className="fa-solid fa-eye hover:text-blue-500"></i>
                            </button>
                            <button onClick={() => handleEditClick(trainer)} className="p-2 transition-colors" style={{ color: colors.textMuted }} title="Edit">
                              <i className="fa-solid fa-pen-to-square hover:text-green-500"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTrainers.length === 0 && (
                  <div className="text-center py-12" style={{ color: colors.textMuted }}>
                    <p>No trainers found.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 2. ADD / EDIT FORM */}
          {viewState === "form" && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <button onClick={() => setViewState("list")} className="mb-6 text-sm flex items-center gap-2 transition-colors" style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-arrow-left"></i> Back to List
              </button>

              <div className="p-8 rounded-3xl border"
                   style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>{isEditing ? "Edit Trainer Profile" : "Register New Trainer"}</h2>

                <form onSubmit={handleSaveTrainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Personal Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textMuted }}>Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Full Name', 'Email Address', 'Phone Number'].map((label, i) => {
                          const field = i === 0 ? 'name' : i === 1 ? 'email' : 'phone';
                          return (
                             <input 
                                key={label}
                                required 
                                type={field === 'email' ? 'email' : 'text'}
                                placeholder={label} 
                                value={formData[field]} 
                                onChange={e => setFormData({ ...formData, [field]: e.target.value })} 
                                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]" 
                                style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                             />
                          )
                      })}

                      {!isEditing && (
                        <input
                          className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
                          style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                          type="password"
                          placeholder="Temporary Password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      )}

                      <select 
                         value={formData.gender} 
                         onChange={e => setFormData({ ...formData, gender: e.target.value })} 
                         className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                         style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: colors.textMuted }}>Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Specialization', 'Experience', 'Certifications'].map((label, i) => {
                          const field = i === 0 ? 'specialization' : i === 1 ? 'experience' : 'certifications';
                          return (
                             <input 
                                key={label}
                                required={i < 2}
                                type="text" 
                                placeholder={label === 'Certifications' ? 'Certifications (comma separated)' : label} 
                                value={formData[field]} 
                                onChange={e => setFormData({ ...formData, [field]: e.target.value })} 
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] ${i===2 ? 'md:col-span-2' : ''}`}
                                style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                             />
                          )
                      })}
                    </div>
                  </div>

                  {/* Schedule & Salary */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: colors.textMuted }}>Work & Pay</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                         required type="text" 
                         placeholder="Working Hours (e.g. Mon-Fri 6AM-12PM)" 
                         value={formData.schedule} 
                         onChange={e => setFormData({ ...formData, schedule: e.target.value })} 
                         className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]" 
                         style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                      />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: colors.textMuted }}>₹</span>
                        <input 
                           type="number" 
                           placeholder="Monthly Salary" 
                           value={formData.salaryAmount} 
                           onChange={e => setFormData({ ...formData, salaryAmount: e.target.value })} 
                           className="w-full pl-8 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]" 
                           style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                        />
                      </div>
                      <select 
                         value={formData.status} 
                         onChange={e => setFormData({ ...formData, status: e.target.value })} 
                         className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                         style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderColor: colors.border, color: colors.text }}
                      >
                        <option>Active</option>
                        <option>On Leave</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setViewState("list")} className="px-6 py-2 rounded-xl border font-medium hover:opacity-80 transition-colors"
                       style={{ borderColor: colors.border, color: colors.textMuted }}>
                       Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
                       style={{ backgroundColor: colors.primary, color: '#14532d' }}>
                      {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
                      {isEditing ? "Update Trainer" : "Onboard Trainer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. TRAINER DETAILS */}
          {viewState === "details" && selectedTrainer && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <button onClick={() => setViewState("list")} className="mb-6 text-sm flex items-center gap-2 transition-colors" style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-arrow-left"></i> Back to List
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: Profile Card */}
                <div className="p-6 rounded-3xl border shadow-sm md:col-span-1 h-fit"
                     style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-inner mb-4"
                       style={{ backgroundColor: colors.secondary, color: '#1e3a8a' }}>
                    {selectedTrainer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold" style={{ color: colors.text }}>{selectedTrainer.name}</h2>
                    <p className="text-sm" style={{ color: colors.textMuted }}>{selectedTrainer.specialization} Specialist</p>
                    <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedTrainer.status)}`}>
                      {selectedTrainer.status}
                    </div>
                  </div>

                  <div className="space-y-4 text-sm border-t pt-6" style={{ borderColor: colors.border }}>
                    {[{i: 'envelope', v: selectedTrainer.email}, {i: 'phone', v: selectedTrainer.phone}, {i: 'calendar', v: `Joined: ${new Date(selectedTrainer.joinDate).toLocaleDateString()}`}, {i: 'certificate', v: selectedTrainer.certifications?.length > 0 ? selectedTrainer.certifications.join(", ") : "No certifications"}].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3" style={{ color: colors.text }}>
                           <i className={`fa-solid fa-${item.i} w-5`} style={{ color: colors.textMuted }}></i> {item.v}
                        </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-colors"
                       style={{ backgroundColor: colors.text, color: colors.background }}>
                      <i className="fa-regular fa-comment-dots mr-2"></i> Chat
                    </button>
                    <button className="flex-1 py-2 border rounded-xl text-xs font-bold hover:bg-opacity-50 transition-colors"
                       style={{ borderColor: colors.border, color: colors.textMuted }}>
                      Notify
                    </button>
                  </div>
                </div>

                {/* Right: Detailed Tabs */}
                <div className="md:col-span-2 space-y-6">

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                       { label: 'Rating', val: selectedTrainer.performance?.rating || 0, bg: theme === 'dark' ? '#064e3b' : '#f0fdf4', txt: '#15803d', border: '#bbf7d0' },
                       { label: 'Sessions', val: selectedTrainer.performance?.totalSessions || 0, bg: theme === 'dark' ? '#422006' : '#fffbeb', txt: '#a16207', border: '#fef08a' },
                       { label: 'Clients', val: selectedTrainer.performance?.activeMembers || 0, bg: theme === 'dark' ? '#172554' : '#eff6ff', txt: '#1d4ed8', border: '#bfdbfe' }
                    ].map((stat, i) => (
                       <div key={i} className="p-4 rounded-2xl text-center border"
                            style={{ 
                               backgroundColor: theme === 'dark' ? `${stat.bg}40` : stat.bg, // 25% opacity in dark mode
                               borderColor: theme === 'dark' ? stat.bg : stat.border
                            }}>
                          <p className="text-xs mb-1" style={{ color: colors.textMuted }}>{stat.label}</p>
                          <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#e5e7eb' : stat.txt }}>{stat.val}</p>
                       </div>
                    ))}
                  </div>

                  {/* Assigned Members */}
                  <div className="rounded-3xl p-6 shadow-sm border"
                       style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold" style={{ color: colors.text }}>Assigned Members</h3>
                    </div>
                    <div className="space-y-3">
                      {assignedMembers.length > 0 ? (
                        assignedMembers.map(m => (
                          <div key={m._id} className="flex justify-between items-center p-3 rounded-xl transition-colors"
                               style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
                                   style={{ backgroundColor: colors.card, color: colors.textMuted, borderColor: colors.border }}>
                                {m.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: colors.text }}>{m.name}</p>
                                <p className="text-[10px]" style={{ color: colors.textMuted }}>{m.plan}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-green-600">{m.status}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm italic" style={{ color: colors.textMuted }}>No members assigned.</p>
                      )}
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="rounded-3xl p-6 shadow-sm border"
                       style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <h3 className="font-bold mb-4" style={{ color: colors.text }}>Sessions & Schedule</h3>
                    <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2 border"
                         style={{ 
                            backgroundColor: theme === 'dark' ? '#1e3a8a20' : '#eff6ff', 
                            color: theme === 'dark' ? '#93c5fd' : '#1e40af',
                            borderColor: theme === 'dark' ? '#1e3a8a40' : '#dbeafe'
                         }}>
                      <i className="fa-regular fa-clock"></i>
                      <strong>Working Hours:</strong>{" "}
                      {selectedTrainer.schedule || "Not set"}
                    </div>

                    <div className="space-y-3">
                      {selectedTrainer.sessions?.length > 0 ? selectedTrainer.sessions.map(s => (
                        <div key={s.id || Math.random()} className="flex justify-between items-center p-3 border rounded-xl hover:bg-opacity-50 transition-colors"
                             style={{ borderColor: colors.border, backgroundColor: theme === 'dark' ? '#1f2937' : '#fff' }}>
                          <div>
                            <p className="text-sm font-bold" style={{ color: colors.text }}>{s.type}</p>
                            <p className="text-xs" style={{ color: colors.textMuted }}>with {s.client}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold" style={{ color: colors.text }}>{s.time}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === 'Upcoming' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                              {s.status}
                            </span>
                          </div>
                        </div>
                      )) : <p className="text-sm" style={{ color: colors.textMuted }}>No sessions scheduled.</p>}
                    </div>
                  </div>

                  {/* Financials (Admin View) */}
                  <div className="rounded-3xl p-6 shadow-sm border"
                       style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <h3 className="font-bold mb-4" style={{ color: colors.text }}>Salary & Payments</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl"
                         style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
                      <div>
                        <p className="text-xs" style={{ color: colors.textMuted }}>Monthly Salary</p>
                        <p className="text-lg font-bold" style={{ color: colors.text }}>₹{selectedTrainer.salary?.monthly
                          ? selectedTrainer.salary.monthly.toLocaleString()
                          : "0"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${selectedTrainer.salary?.status === 'Paid' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                          {selectedTrainer.salary?.status}
                        </span>
                      </div>
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

export default ManageTrainer;