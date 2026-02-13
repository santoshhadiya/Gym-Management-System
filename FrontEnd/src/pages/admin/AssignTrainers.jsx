import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

const AssignTrainers = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme

  // --- STYLE INJECTION ---
  useEffect(() => {
    // Note: react-toastify link removed as it is no longer used
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
  const [members, setMembers] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI STATE ---
  const [viewState, setViewState] = useState("current");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("assign");

  // Form State
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [changeReason, setChangeReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      if (trainers.length === 0) setIsLoading(true);

      const [tRes, mRes, hRes] = await Promise.all([
        api.get("/trainers"),
        api.get("/members"),
        api.get("/assignments/history"),
      ]);

      setTrainers(tRes.data);
      setMembers(mRes.data);
      setAssignmentHistory(hRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPERS ---
  const getTrainerById = (id) => trainers.find(t => t._id === id);
  const getMemberById = (id) => members.find(m => m._id === id);

  // --- ACTIONS ---
  const handleOpenAssignModal = () => {
    setModalType("assign");
    setSelectedTrainer("");
    setSelectedMembers([]);
    setShowModal(true);
  };

  const handleOpenReassignModal = (member) => {
    setModalType("reassign");
    setSelectedMembers([member._id]);
    setSelectedTrainer("");
    setChangeReason("");
    setShowModal(true);
  };

  const handleUnassign = async (member) => {
    if (window.confirm(`Are you sure you want to remove ${member.name}'s trainer assignment?`)) {
      try {
        await api.delete(`/assignments/${member._id}`);
        toast.success("Member unassigned");
        await fetchData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to unassign member.");
      }
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();

    if (!selectedTrainer || selectedMembers.length === 0) {
      toast.error("Please select a trainer and at least one member.");
      return;
    }

    const trainer = getTrainerById(selectedTrainer);
    if (!trainer) {
      toast.error("Selected trainer not found.");
      return;
    }

    if (trainer.activeClients + selectedMembers.length > trainer.capacity) {
      toast.error(`Overload Warning! ${trainer.name} only has space for ${trainer.capacity - trainer.activeClients} more clients.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/assignments", {
        trainerId: selectedTrainer,
        memberIds: selectedMembers,
        reason: modalType === "reassign" ? changeReason : "Bulk Assignment",
      });

      toast.success(`Assigned & Intro Message Sent!`);
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Assignment failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTERING ---
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
      style={{  borderColor: colors.border, color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Trainer Assignments</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Manage client allocations. Intro msg sent automatically on assignment.</p>
        </div>
        <div className="flex p-1 rounded-xl" style={{ backgroundColor: colors.border }}>
          <button
            onClick={() => setViewState("current")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewState === 'current' ? 'shadow' : 'hover:opacity-80'}`}
            style={{ 
                backgroundColor: viewState === 'current' ? colors.card : 'transparent',
                color: viewState === 'current' ? colors.secondary : colors.textMuted 
            }}
          >
            Active Assignments
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.border }}></i>
        </div>
      ) : (
        <>
          {/* TRAINER CAPACITY OVERVIEW */}
          {viewState === "current" && (
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-4 pb-2">
                {trainers.map(t => (
                  <div 
                    key={t._id} 
                    className="min-w-[200px] p-4 rounded-2xl border transition-colors"
                    style={{ 
                        backgroundColor: t.status === 'Full' ? (theme === 'dark' ? '#450a0a' : '#fef2f2') : colors.card,
                        borderColor: colors.border 
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold" style={{ color: colors.text }}>{t.name}</span>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ 
                            backgroundColor: t.status === 'Full' ? '#fee2e2' : colors.primary,
                            color: t.status === 'Full' ? '#991b1b' : '#111827'
                        }}
                      >{t.status}</span>
                    </div>
                    <div className="w-full rounded-full h-2 mb-1" style={{ backgroundColor: colors.background }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                            width: `${(t.activeClients / t.capacity) * 100}%`,
                            backgroundColor: t.status === 'Full' ? '#ef4444' : colors.secondary
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-right" style={{ color: colors.textMuted }}>{t.activeClients} / {t.capacity} Clients</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTROLS */}
          {viewState === "current" && (
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border focus:outline-none focus:ring-2 text-sm transition-colors"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border, 
                    color: colors.text,
                    '--tw-ring-color': colors.secondary 
                  }}
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              </div>
              <button
                onClick={handleOpenAssignModal}
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                style={{ backgroundColor: colors.primary, color: '#111827' }}
              >
                <i className="fa-solid fa-user-plus"></i> New Assignment
              </button>
            </div>
          )}

          {/* ASSIGNMENTS TABLE */}
          {viewState === "current" ? (
            <div className="overflow-hidden rounded-2xl border shadow-sm transition-colors" style={{ borderColor: colors.border }}>
              <table className="w-full border-collapse text-left text-sm">
                <thead style={{ backgroundColor: colors.card }}>
                  <tr>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Member</th>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Plan</th>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Assigned Trainer</th>
                    
                    <th className="px-6 py-4 font-semibold text-right" style={{ color: colors.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: colors.border, backgroundColor: colors.background }}>
                  {filteredMembers.map((member) => {
                    const assignedTrainer = member.trainer;
                    return (
                      <tr key={member._id} className="hover:opacity-80 transition-opacity">
                        <td className="px-6 py-4 font-medium" style={{ color: colors.text }}>{member.name}</td>
                        <td className="px-6 py-4" style={{ color: colors.textMuted }}>{member.plan?.name || "No Plan"}</td>
                        <td className="px-6 py-4">
                          {assignedTrainer ? (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: colors.secondary, color: colors.text }}
                              >
                                {assignedTrainer.name ? assignedTrainer.name[0] : "T"}
                              </div>
                              <span className="font-medium" style={{ color: colors.text }}>{assignedTrainer.name}</span>
                            </div>
                          ) : (
                            <span className="italic" style={{ color: colors.textMuted }}>Unassigned</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          {assignedTrainer ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenReassignModal(member)} className="p-2 rounded-lg text-xs font-bold transition-colors" style={{ color: colors.secondary }}>
                                Change
                              </button>
                              <button onClick={() => handleUnassign(member)} className="text-red-400 hover:opacity-70 p-2 rounded-lg transition-colors">
                                <i className="fa-solid fa-user-xmark"></i>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-medium" style={{ color: colors.accent }}>Needs Trainer</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // HISTORY VIEW (Minimal styling update as logic remains)
            <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: colors.border }}>
              <table className="w-full border-collapse text-left text-sm" style={{ backgroundColor: colors.card }}>
                <thead>
                  <tr style={{ backgroundColor: colors.border }}>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Date</th>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Member</th>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Action</th>
                    <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: colors.border, backgroundColor: colors.background }}>
                  {assignmentHistory.map(h => (
                    <tr key={h._id}>
                      <td className="px-6 py-4" style={{ color: colors.text }}>{h.date}</td>
                      <td className="px-6 py-4 font-medium" style={{ color: colors.text }}>{h.member}</td>
                      <td className="px-6 py-4">
                        <span className="text-red-400 line-through mr-2">{h.oldTrainer || "Unassigned"}</span>
                        <i className="fa-solid fa-arrow-right text-xs mx-1" style={{ color: colors.textMuted }}></i>
                        <span className="font-medium ml-2" style={{ color: colors.primary }}>{h.newTrainer}</span>
                      </td>
                      <td className="px-6 py-4 text-xs italic" style={{ color: colors.textMuted }}>"{h.reason}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* --- ASSIGNMENT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: colors.card }}>
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
              <h3 className="font-bold" style={{ color: colors.text }}>{modalType === 'assign' ? "New Assignment" : "Reassign Trainer"}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6">
              {/* Step 1: Select Trainer */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Select Trainer</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {trainers.map(t => (
                    <label
                      key={t._id}
                      className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                      style={{ 
                        borderColor: selectedTrainer === t._id ? colors.secondary : colors.border,
                        backgroundColor: selectedTrainer === t._id ? colors.background : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="trainer"
                          value={t._id}
                          checked={selectedTrainer === t._id}
                          onChange={(e) => setSelectedTrainer(e.target.value)}
                          className="hidden"
                        />
                        <div 
                            className="w-4 h-4 rounded-full border flex items-center justify-center"
                            style={{ borderColor: selectedTrainer === t._id ? colors.secondary : colors.textMuted }}
                        >
                          {selectedTrainer === t._id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.secondary }}></div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: colors.text }}>{t.name}</p>
                          <p className="text-xs" style={{ color: colors.textMuted }}>{t.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: colors.primary, color: '#111827' }}>{t.status}</span>
                        <p className="text-[10px] mt-1" style={{ color: colors.textMuted }}>{t.activeClients}/{t.capacity} Active</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Members (Only visible for Bulk Assign) */}
              {modalType === 'assign' && (
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Select Members</label>
                  <select
                    multiple
                    value={selectedMembers}
                    onChange={(e) => setSelectedMembers(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full p-2 border rounded-xl text-sm focus:outline-none h-32 transition-colors"
                    style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                  >
                    {members.filter(m => !m.trainer).map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.plan?.name || "No Plan"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] mt-1" style={{ color: colors.textMuted }}>* Hold Ctrl/Cmd to select multiple</p>
                </div>
              )}

              {/* Step 2b: Reason (Only for Reassign) */}
              {modalType === 'reassign' && selectedMembers.length > 0 && (
                <div className="mb-6">
                  <div className="p-3 rounded-xl mb-4 text-xs border" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.secondary }}>
                    Reassigning <strong>{getMemberById(selectedMembers[0])?.name}</strong>
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Reason for Change</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Member Request"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none text-sm transition-colors"
                    style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
                style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
              >
                {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
                {isSubmitting ? "Processing..." : "Confirm Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTrainers;