import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const VerifyAccounts = () => {
  // --- MOCK DATA ---
  const [accounts, setAccounts] = useState([
    {
      id: 101,
      name: "Santosh Hadiya",
      email: "santosh@example.com",
      phone: "9876543210",
      role: "Member",
      registeredDate: "2024-10-25",
      status: "Pending",
      documents: { idProof: "Aadhar Card", status: "Uploaded" },
      details: { age: 24, gender: "Male", address: "123, Gym Street, Ahmedabad" }
    },
    {
      id: 102,
      name: "Jay Patel",
      email: "jay.trainer@example.com",
      phone: "9123456789",
      role: "Trainer",
      registeredDate: "2024-10-24",
      status: "Pending",
      documents: { idProof: "PAN Card", cert: "ACE Certification", status: "Uploaded" },
      details: { age: 29, gender: "Male", specialization: "CrossFit" }
    },
    {
      id: 103,
      name: "Priya Sharma",
      email: "priya.s@example.com",
      phone: "8899776655",
      role: "Member",
      registeredDate: "2024-10-20",
      status: "Verified",
      verifiedBy: "Admin",
      verifiedDate: "2024-10-21",
      documents: { idProof: "Driving License", status: "Verified" },
      details: { age: 26, gender: "Female", address: "45, Green Avenue" }
    },
    {
      id: 104,
      name: "Rahul Verma",
      email: "rahul.v@example.com",
      phone: "7766554433",
      role: "Member",
      registeredDate: "2024-10-18",
      status: "Rejected",
      rejectedReason: "Blurry Document",
      documents: { idProof: "Voter ID", status: "Rejected" },
      details: { age: 22, gender: "Male", address: "Sector 5, Gandhinagar" }
    }
  ]);

  // --- STATE ---
  const [view, setView] = useState("pending"); // 'pending', 'all', 'history'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // For Bulk Actions

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

  // --- HELPERS ---
  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Pending": return "bg-[#FEEF75] text-yellow-900 border-yellow-200 animate-pulse";
      case "Rejected": return "bg-red-50 text-red-600 border-red-200";
      case "Suspended": return "bg-gray-200 text-gray-600 border-gray-300";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  // --- ACTIONS ---
  const handleVerify = (id) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { 
        ...acc, 
        status: "Verified", 
        verifiedBy: "You", 
        verifiedDate: new Date().toISOString().split('T')[0] 
      } : acc
    ));
    toast.success("Account verified successfully! Access granted.");
    setShowDetailModal(false);
  };

  const handleReject = () => {
    if (!rejectReason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setAccounts(prev => prev.map(acc => 
      acc.id === selectedAccount.id ? { 
        ...acc, 
        status: "Rejected", 
        rejectedReason: rejectReason 
      } : acc
    ));
    toast.info("Account rejected. Notification sent to user.");
    setShowRejectModal(false);
    setShowDetailModal(false);
    setRejectReason("");
  };

  const handleSuspend = (id) => {
    if(window.confirm("Are you sure you want to suspend this account? User will lose access immediately.")) {
      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, status: "Suspended" } : acc
      ));
      toast.warning("Account suspended.");
    }
  };

  const handleBulkVerify = () => {
    if (selectedIds.length === 0) return;
    if(window.confirm(`Approve ${selectedIds.length} selected accounts?`)) {
      setAccounts(prev => prev.map(acc => 
        selectedIds.includes(acc.id) ? { ...acc, status: "Verified", verifiedBy: "Batch Process", verifiedDate: new Date().toISOString().split('T')[0] } : acc
      ));
      toast.success(`${selectedIds.length} Accounts verified in bulk.`);
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // --- FILTERING ---
  const filteredAccounts = accounts.filter(acc => {
    if (view === 'pending') return acc.status === 'Pending';
    if (view === 'history') return acc.status !== 'Pending';
    return true; // 'all'
  });

  return (
    <div className="w-full bg-white font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
       
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setView("pending")}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'pending' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Pending <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{accounts.filter(a => a.status === 'Pending').length}</span>
           </button>
           <button 
             onClick={() => setView("history")}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             History Logs
           </button>
           <button 
             onClick={() => setView("all")}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             All Users
           </button>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedIds.length > 0 && view === 'pending' && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-6 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
           <span className="text-sm font-bold text-blue-800 ml-2">{selectedIds.length} users selected</span>
           <button 
             onClick={handleBulkVerify}
             className="px-4 py-1.5 bg-[#D9F17F] text-green-900 rounded-lg text-xs font-bold hover:bg-green-300 transition-colors shadow-sm"
           >
             Approve Selected
           </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-[#f8f9fa]">
            <tr>
              {view === 'pending' && (
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredAccounts.map(a => a.id));
                      else setSelectedIds([]);
                    }}
                    checked={selectedIds.length === filteredAccounts.length && filteredAccounts.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-4 font-semibold text-gray-900">User Profile</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Role Request</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Contact Info</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAccounts.length > 0 ? filteredAccounts.map((acc) => (
              <tr key={acc.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(acc.id) ? 'bg-blue-50/50' : ''}`}>
                {view === 'pending' && (
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(acc.id)}
                      onChange={() => toggleSelection(acc.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${acc.role === 'Trainer' ? 'bg-[#70a6d6]' : 'bg-gray-400'}`}>
                        {acc.name[0]}
                     </div>
                     <span className="font-medium text-gray-900">{acc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${acc.role === 'Trainer' ? 'bg-[#CDE7FE] text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
                      {acc.role}
                   </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="text-gray-900">{acc.email}</span>
                      <span className="text-xs text-gray-400">{acc.phone}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                   {acc.registeredDate}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(acc.status)}`}>
                    {acc.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setSelectedAccount(acc); setShowDetailModal(true); }}
                    className="text-gray-400 hover:text-blue-600 p-2 transition-colors font-medium text-xs border border-gray-200 rounded-lg hover:bg-blue-50"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                   <div className="flex flex-col items-center">
                      <i className="fa-regular fa-folder-open text-3xl mb-2 opacity-30"></i>
                      <p>No records found in this view.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- DETAILS MODAL --- */}
      {showDetailModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-[#f8f9fa] px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                       Verification Request 
                       <span className="text-sm font-normal text-gray-500">#{selectedAccount.id}</span>
                    </h2>
                 </div>
                 <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                 <div className="flex items-start gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-md ${selectedAccount.role === 'Trainer' ? 'bg-[#70a6d6]' : 'bg-gray-400'}`}>
                       {selectedAccount.name[0]}
                    </div>
                    <div className="flex-1">
                       <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedAccount.name}</h3>
                       <div className="flex gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedAccount.role === 'Trainer' ? 'bg-[#CDE7FE] text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
                             {selectedAccount.role}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusStyle(selectedAccount.status)}`}>
                             {selectedAccount.status}
                          </span>
                       </div>
                       <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                          <p><i className="fa-solid fa-envelope w-5 text-gray-300"></i> {selectedAccount.email}</p>
                          <p><i className="fa-solid fa-phone w-5 text-gray-300"></i> {selectedAccount.phone}</p>
                          <p><i className="fa-solid fa-location-dot w-5 text-gray-300"></i> {selectedAccount.details.address}</p>
                          <p><i className="fa-solid fa-calendar w-5 text-gray-300"></i> Reg: {selectedAccount.registeredDate}</p>
                       </div>
                    </div>
                 </div>

                 {/* Documents Section */}
                 <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Submitted Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                <i className="fa-solid fa-id-card"></i>
                             </div>
                             <div>
                                <p className="text-sm font-bold text-gray-800">ID Proof</p>
                                <p className="text-xs text-gray-500">{selectedAccount.documents.idProof}</p>
                             </div>
                          </div>
                          <button className="text-blue-600 text-xs font-bold hover:underline">View</button>
                       </div>
                       
                       {selectedAccount.role === 'Trainer' && (
                          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                                   <i className="fa-solid fa-certificate"></i>
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-gray-800">Certification</p>
                                   <p className="text-xs text-gray-500">{selectedAccount.documents.cert}</p>
                                </div>
                             </div>
                             <button className="text-blue-600 text-xs font-bold hover:underline">View</button>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {selectedAccount.status === "Pending" ? (
                       <>
                          <button 
                            onClick={() => handleVerify(selectedAccount.id)}
                            className="flex-1 py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold hover:bg-green-300 transition-colors shadow-sm"
                          >
                             <i className="fa-solid fa-check mr-2"></i> Approve Account
                          </button>
                          <button 
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
                          >
                             <i className="fa-solid fa-xmark mr-2"></i> Reject
                          </button>
                       </>
                    ) : selectedAccount.status === "Verified" ? (
                       <button 
                         onClick={() => handleSuspend(selectedAccount.id)}
                         className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
                       >
                          <i className="fa-solid fa-ban mr-2"></i> Suspend Account
                       </button>
                    ) : (
                       <div className="w-full p-3 bg-red-50 text-red-700 rounded-xl text-center text-sm font-medium border border-red-100">
                          Account Rejected: "{selectedAccount.rejectedReason}"
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- REJECT REASON MODAL --- */}
      {showRejectModal && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Reason for Rejection</h3>
               <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-300 mb-4 h-32 resize-none"
                  placeholder="e.g. ID proof is blurry, details mismatch..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
               ></textarea>
               <div className="flex gap-3">
                  <button 
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReject}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm"
                  >
                    Confirm Rejection
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default VerifyAccounts;