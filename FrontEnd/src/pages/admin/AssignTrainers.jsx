import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

const AssignTrainers = () => {

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

        toast.info("Member unassigned");
        // Refresh data from DB to ensure sync
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
      toast.warn("Please select a trainer and at least one member.");
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

      // --- API CALL ---
      // The backend assignmentController will handle creating the automatic "Hello" message
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
      toast.error(error.response?.data?.message || "Assignment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTERING ---
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client allocations. Intro msg sent automatically on assignment.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewState("current")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewState === 'current' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active Assignments
          </button>
          <button
            onClick={() => setViewState("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewState === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            History Log
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gray-300"></i>
        </div>
      ) : (
        <>
          {/* TRAINER CAPACITY OVERVIEW */}
          {viewState === "current" && (
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-4 pb-2">
                {trainers.map(t => (
                  <div key={t._id} className={`min-w-[200px] p-4 rounded-2xl border ${t.status === 'Full' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{t.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.status === 'Full' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>{t.status}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${t.status === 'Full' ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${(t.activeClients / t.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{t.activeClients} / {t.capacity} Clients</p>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              </div>
              <button
                onClick={handleOpenAssignModal}
                className="px-5 py-2.5 rounded-full bg-[#D9F17F] text-green-900 text-sm font-bold hover:bg-green-300 transition-colors shadow-sm flex items-center gap-2"
              >
                <i className="fa-solid fa-user-plus"></i> New Assignment
              </button>
            </div>
          )}

          {/* ASSIGNMENTS TABLE */}
          {viewState === "current" ? (
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                <thead className="bg-[#f8f9fa]">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-900">Member</th>
                    <th className="px-6 py-4 font-semibold text-gray-900">Plan</th>
                    <th className="px-6 py-4 font-semibold text-gray-900">Assigned Trainer</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 text-center">Since</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map((member) => {
                    const assignedTrainer = member.trainer;

                    return (
                      <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-4 text-gray-500">{member.plan?.name || "No Plan"}</td>
                        <td className="px-6 py-4">
                          {assignedTrainer ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#CDE7FE] flex items-center justify-center text-xs font-bold text-blue-600">
                                {assignedTrainer.name ? assignedTrainer.name[0] : "T"}
                              </div>
                              <span className="text-gray-900 font-medium">{assignedTrainer.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-xs">
                          {member.assignedDate ? new Date(member.assignedDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {assignedTrainer ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenReassignModal(member)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg text-xs font-bold transition-colors">
                                Change
                              </button>
                              <button onClick={() => handleUnassign(member)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <i className="fa-solid fa-user-xmark"></i>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-orange-400 font-medium">Needs Trainer</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-400">No members found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // HISTORY VIEW
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Member</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignmentHistory.length > 0 ? assignmentHistory.map(h => (
                    <tr key={h._id}>
                      <td className="px-6 py-4 text-gray-900">{h.date}</td>
                      <td className="px-6 py-4 font-medium">{h.member}</td>
                      <td className="px-6 py-4">
                        <span className="text-red-400 line-through mr-2">{h.oldTrainer || "Unassigned"}</span>
                        <i className="fa-solid fa-arrow-right text-gray-400 text-xs mx-1"></i>
                        <span className="text-green-600 font-medium ml-2">{h.newTrainer}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs italic">"{h.reason}"</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-400">No session history recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* --- ASSIGNMENT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{modalType === 'assign' ? "New Assignment" : "Reassign Trainer"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6">

              {/* Step 1: Select Trainer */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Trainer</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {trainers.map(t => (
                    <label
                      key={t._id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedTrainer === t._id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
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
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTrainer === t._id ? 'border-blue-600' : 'border-gray-300'}`}>
                          {selectedTrainer === t._id && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${t.status === 'Full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{t.activeClients}/{t.capacity} Active</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Members (Only visible for Bulk Assign) */}
              {modalType === 'assign' && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Members</label>
                  <select
                    multiple
                    value={selectedMembers}
                    onChange={(e) => setSelectedMembers(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 h-32 bg-gray-50"
                  >
                    {/* Show only unassigned members here */}
                    {members.filter(m => !m.trainer).map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.plan?.name || "No Plan"})
                      </option>
                    ))}
                    {members.filter(m => !m.trainer).length === 0 && <option disabled>No unassigned members available</option>}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">* Hold Ctrl/Cmd to select multiple</p>
                </div>
              )}

              {/* Step 2b: Reason (Only for Reassign) */}
              {modalType === 'reassign' && selectedMembers.length > 0 && (
                <div className="mb-6">
                  <div className="bg-yellow-50 p-3 rounded-xl mb-4 text-xs text-yellow-800 border border-yellow-100">
                    Reassigning <strong>{getMemberById(selectedMembers[0])?.name}</strong>
                  </div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Change</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Member Request, Schedule Conflict"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors flex justify-center items-center gap-2"
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