import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";


const ManageTrainer = () => {
  const { api } = useGlobalContext()
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
      console.log(res.data)
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
      // toast.error("Could not load assigned members."); // Optional
      setAssignedMembers([]); // Fallback
    }
  };

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-[#D9F17F] text-green-800 border-green-200";
      case "On Leave": return "bg-[#FEEF75] text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
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

        certifications: formData.certifications
          .split(",")
          .map(c => c.trim())
          .filter(Boolean),

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
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          trainerDetails: {
            specialization: formData.specialization,
            experience: formData.experience,
            certifications: formData.certifications
              .split(",")
              .map(c => c.trim())
              .filter(Boolean),
            schedule: formData.schedule,
            salary: {
              monthly: Number(formData.salaryAmount),
              status: "Pending",
            },
          },
        };

        await api.post("/auth/register-trainer", payload);
        toast.success("Trainer registered successfully");
      }
      setViewState("list");
      fetchTrainers(); // Refresh list
      
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
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
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Trainers</h1>
          <p className="text-sm text-gray-500 mt-1">Total Trainers: {trainers.length}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            <i className="fa-solid fa-download mr-2"></i> Export CSV
          </button>
          <button onClick={handleAddClick} className="px-5 py-2 rounded-full bg-[#CDE7FE] text-blue-900 text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm">
            <i className="fa-solid fa-plus mr-2"></i> Add Trainer
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gray-300"></i>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                  />
                  <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                </div>
                <select
                  value={filterSpec}
                  onChange={(e) => setFilterSpec(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE]"
                >
                  <option value="All">All Specializations</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Yoga">Yoga</option>
                  <option value="CrossFit">CrossFit</option>
                </select>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-900">Trainer Info</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Expertise</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 text-center">Active Clients</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTrainers.map((trainer) => (
                      <tr key={trainer._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#CDE7FE] flex items-center justify-center text-blue-600 font-bold text-xs">
                              {trainer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{trainer.name}</div>
                              <div className="text-xs text-gray-400">{trainer.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{trainer.specialization}</span>
                            <span className="text-xs text-gray-400">{trainer.experience} Exp.</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
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
                            <button onClick={() => fetchTrainerDetails(trainer)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button onClick={() => handleEditClick(trainer)} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Edit">
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTrainers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No trainers found.</p>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? "Edit Trainer Profile" : "Register New Trainer"}</h2>

                <form onSubmit={handleSaveTrainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Personal Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />

                      {!isEditing && (
                        <input
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300"
                          type="password"
                          placeholder="Temporary Password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          required
                        />
                      )}

                      <input required type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required type="text" placeholder="Specialization (e.g. Yoga)" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <input required type="text" placeholder="Experience (e.g. 5 Years)" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <input type="text" placeholder="Certifications (comma separated)" value={formData.certifications} onChange={e => setFormData({ ...formData, certifications: e.target.value })} className="md:col-span-2 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                    </div>
                  </div>

                  {/* Schedule & Salary */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">Work & Pay</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required type="text" placeholder="Working Hours (e.g. Mon-Fri 6AM-12PM)" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input type="number" placeholder="Monthly Salary" value={formData.salaryAmount} onChange={e => setFormData({ ...formData, salaryAmount: e.target.value })} className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                      </div>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                        <option>Active</option>
                        <option>On Leave</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setViewState("list")} className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-[#FEEF75] text-yellow-900 font-bold hover:bg-yellow-300 shadow-sm flex items-center gap-2">
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
            <div className="max-w-5xl mx-auto">
              <button onClick={() => setViewState("list")} className="mb-6 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> Back to List
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: Profile Card */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm md:col-span-1 h-fit">
                  <div className="w-24 h-24 bg-[#CDE7FE] rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 mb-4 shadow-inner">
                    {selectedTrainer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTrainer.name}</h2>
                    <p className="text-sm text-gray-500">{selectedTrainer.specialization} Specialist</p>
                    <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedTrainer.status)}`}>
                      {selectedTrainer.status}
                    </div>
                  </div>

                  <div className="space-y-4 text-sm border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <i className="fa-solid fa-envelope w-5 text-gray-400"></i> {selectedTrainer.email}
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <i className="fa-solid fa-phone w-5 text-gray-400"></i> {selectedTrainer.phone}
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <i className="fa-solid fa-calendar w-5 text-gray-400"></i> Joined: {new Date(selectedTrainer.joinDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <i className="fa-solid fa-certificate w-5 text-gray-400"></i> {selectedTrainer.certifications?.length > 0
                        ? selectedTrainer.certifications.join(", ")
                        : "No certifications"}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800">
                      <i className="fa-regular fa-comment-dots mr-2"></i> Chat
                    </button>
                    <button className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50">
                      Notify
                    </button>
                  </div>
                </div>

                {/* Right: Detailed Tabs */}
                <div className="md:col-span-2 space-y-6">

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#f0fdf4] border border-green-100 p-4 rounded-2xl text-center">
                      <p className="text-xs text-gray-500 mb-1">Rating</p>
                      <p className="text-2xl font-bold text-green-700">{selectedTrainer.performance?.rating || 0} <span className="text-xs text-gray-400">/ 5</span></p>
                    </div>
                    <div className="bg-[#fffbeb] border border-yellow-100 p-4 rounded-2xl text-center">
                      <p className="text-xs text-gray-500 mb-1">Sessions</p>
                      <p className="text-2xl font-bold text-yellow-700">{selectedTrainer.performance?.totalSessions || 0}</p>
                    </div>
                    <div className="bg-[#eff6ff] border border-blue-100 p-4 rounded-2xl text-center">
                      <p className="text-xs text-gray-500 mb-1">Clients</p>
                      <p className="text-2xl font-bold text-blue-700">{selectedTrainer.performance?.activeMembers || 0}</p>
                    </div>
                  </div>

                  {/* Assigned Members */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Assigned Members</h3>
                      {/* Note: In dynamic version, assignment is done via AssignTrainers module, so no 'Add' button here */}
                    </div>
                    <div className="space-y-3">
                      {assignedMembers.length > 0 ? (
                        assignedMembers.map(m => (
                          <div key={m._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                {m.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                                <p className="text-[10px] text-gray-500">{m.plan}</p>
                              </div>
                            </div>
                            <span className="text-xs text-green-600 font-bold">{m.status}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No members assigned.</p>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Sessions - Kept as UI placeholder since specific endpoint wasn't requested, assuming included in trainer object or separate module */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Sessions & Schedule</h3>
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-center gap-2">
                      <i className="fa-regular fa-clock"></i>
                      <strong>Working Hours:</strong>{" "}
                      {selectedTrainer.schedule || "Not set"}
                    </div>

                    <div className="space-y-3">
                      {selectedTrainer.sessions?.length > 0 ? selectedTrainer.sessions.map(s => (
                        <div key={s.id || Math.random()} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{s.type}</p>
                            <p className="text-xs text-gray-500">with {s.client}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-700">{s.time}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === 'Upcoming' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                              {s.status}
                            </span>
                          </div>
                        </div>
                      )) : <p className="text-sm text-gray-400">No sessions scheduled.</p>}
                    </div>
                  </div>

                  {/* Financials (Admin View) */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Salary & Payments</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500">Monthly Salary</p>
                        <p className="text-lg font-bold text-gray-900">₹{selectedTrainer.salary?.monthly
                          ? selectedTrainer.salary.monthly.toLocaleString()
                          : "0"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Status</p>
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