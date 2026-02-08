import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ManageMember = () => {
  const { api, BACKEND_URL, user } = useGlobalContext();
  const { colors, theme } = useTheme();

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [purchaseData, setPurchaseData] = useState({ planId: "", amount: "", method: "Cash" });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: null, name: "", email: "", phone: "", password: "", age: "", gender: "Male",
    height: "", currentWeight: "", fitnessGoal: ""
  });

  const [selectedMember, setSelectedMember] = useState(null);

  // --- 1. INITIALIZE RAZORPAY SCRIPT ---
  useEffect(() => {
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(linkFA);
      document.body.removeChild(script);
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

      if (selectedMember) {
        const updated = membersRes.data.find(m => m._id === selectedMember._id);
        if (updated) setSelectedMember(updated);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. RAZORPAY PAYMENT HANDLER ---
  const handleRazorpayPayment = async (finalPlan) => {
    try {
      // Create Razorpay order on backend
      const orderRes = await api.post("/payments/razorpay-order", {
        planId: finalPlan._id,
        memberId: selectedMember._id
      });
      const order = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SC45T3ibqRcWn4",
        amount: order.amount,
        currency: order.currency,
        name: "Songar's GYM",
        description: `Membership: ${finalPlan.name} for ${selectedMember.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: finalPlan._id,
              memberId: selectedMember._id, 
              method: "Online"
            });
            toast.success("Online Payment Verified & Membership Activated!");
            fetchData();
          } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed.");
          }
        },
        prefill: {
          name: selectedMember.name,
          email: selectedMember.email,
          contact: selectedMember.phone
        },
        theme: { color: "#FEEF75" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate Razorpay.");
    }
  };

  // --- 3. MEMBERSHIP PURCHASE LOGIC WITH VALIDATIONS ---
  const handlePurchasePlan = async () => {
    if (!purchaseData.planId) return toast.error("Please select a plan");

    // A. Check if current plan is active
    if (selectedMember.expiryDate) {
      const expiry = new Date(selectedMember.expiryDate);
      const today = new Date();
      if (expiry > today) {
        toast.error(`Member has an active plan until ${expiry.toLocaleDateString()}. Restricted until expiry.`);
        return;
      }
    }

    const selectedPlan = plans.find(p => p._id === purchaseData.planId);

    // B. Validate Price Changes
    if (Number(selectedPlan.price) !== Number(purchaseData.amount)) {
      const diff = Number(selectedPlan.price) > Number(purchaseData.amount) ? "increased" : "decreased";
      const confirmPrice = window.confirm(
        `The price of this plan has ${diff} to ₹${selectedPlan.price}. Do you want to continue with the new price?`
      );
      if (!confirmPrice) return;
      // Sync UI amount with database price
      setPurchaseData(prev => ({ ...prev, amount: selectedPlan.price }));
    }

    // C. Route by Payment Method
    if (purchaseData.method === "Online") {
      await handleRazorpayPayment(selectedPlan);
    } else {
      // Direct Cash Activation
      try {
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + selectedPlan.duration);

        await api.put(`/members/${selectedMember._id}`, {
          plan: purchaseData.planId,
          startDate,
          expiryDate,
          status: "Active"
        });

        await api.post("/payments/record", {
          memberId: selectedMember._id,
          amount: purchaseData.amount,
          method: "Cash",
          planId: purchaseData.planId,
          date: startDate
        });

        toast.success("Cash Membership Activated!");
        fetchData();
      } catch (err) {
        toast.error("Cash activation failed.");
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === "Inactive") return theme === 'dark' ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-gray-100 text-gray-500 border-gray-200";
    return theme === 'dark' ? "bg-[#D9F17F]/20 text-[#D9F17F] border-[#D9F17F]/30" : "bg-[#D9F17F] text-green-800 border-green-200";
  };

  const getImageUrl = (path) => path ? (path.startsWith("http") ? path : `${BACKEND_URL}/${path}`) : null;

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/members/${id}/deactivate`);
      toast.success(`Account is now ${res.data.status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleEditClick = (member) => {
    setFormData({
      _id: member._id, name: member.name, email: member.email, phone: member.phone,
      password: "", age: member.age || "", gender: member.gender || "Male",
      height: member.height || "", currentWeight: member.currentWeight || "", fitnessGoal: member.fitnessGoal || ""
    });
    setIsEditing(true);
    setViewState("form");
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { password, ...updateData } = formData;
        await api.put(`/members/${formData._id}`, updateData);
        toast.success("Profile updated");
      } else {
        await api.post("/members", formData);
        toast.success("Member registered");
      }
      setViewState("list");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.name + m.email + m.phone).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="w-full rounded-3xl p-4 md:p-4 font-sans min-h-screen transition-colors duration-300" >

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Manage Members</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{members.length} total members enrolled</p>
        </div>
        <button onClick={() => { setIsEditing(false); setViewState("form"); }} className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-[#111827] text-white shadow-lg hover:bg-black transition-all">
          <i className="fa-solid fa-plus mr-2"></i> Register New Member
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 font-bold" style={{ color: colors.text }}>
          <i className="fa-solid fa-circle-notch fa-spin text-4xl" style={{ color: colors.primary }}></i>
        </div>
      ) : (
        <>
          {viewState === "list" && (
            <div className="space-y-8 ">
              <div className="flex flex-wrap gap-4">
                <input
                  type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow min-w-[300px] px-6 py-3 rounded-2xl border text-sm outline-none"
                  style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
                />
              </div>

              <div className="rounded-[1rem] border shadow-xl overflow-hidden"
                style={{
                  backgroundColor: getTransparentColor(colors.sidebar, 0.4),
                  borderColor: getTransparentColor(colors.border, 0.2),
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)'
                }}>
                <table className="w-full text-left text-sm">
                  <thead style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
                    <tr>
                      <th className="px-8 py-5 font-black uppercase tracking-wider text-[11px] text-gray-400">Member Info</th>
                      <th className="px-8 py-5 font-black uppercase tracking-wider text-[11px] text-gray-400">Membership</th>
                      <th className="px-8 py-5 font-black uppercase tracking-wider text-[11px] text-gray-400 text-center">Status</th>
                      <th className="px-8 py-5 font-black uppercase tracking-wider text-[11px] text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: colors.border }}>
                    {filteredMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-opacity-50 transition-colors">
                        <td className="px-8 py-5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold bg-blue-100 text-blue-700 overflow-hidden">
                            {getImageUrl(member.image) ? <img src={getImageUrl(member.image)} className="w-full h-full object-cover" alt="" /> : member.name[0]}
                          </div>
                          <div>
                            <div className="font-bold" style={{ color: colors.text }}>{member.name}</div>
                            <div className="text-[11px]" style={{ color: colors.textMuted }}>{member.email}</div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-semibold" style={{ color: colors.text }}>{member.plan?.name || "No Plan"}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black border ${getStatusColor(member.status)}`}>{member.status}</span>
                        </td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button onClick={() => { setSelectedMember(member); setViewState("details"); }} className="p-2 hover:text-blue-500 transition-colors"><i className="fa-solid fa-gear"></i></button>
                          <button onClick={() => handleEditClick(member)} className="p-2 hover:text-green-500 transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewState === "form" && (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setViewState("list")} className="mb-6 text-sm font-bold flex items-center gap-2" style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-arrow-left"></i> Back to Members
              </button>
              <div className="p-10 rounded-[2.5rem] border bg-white shadow-2xl" style={{ borderColor: colors.border }}>
                <h2 className="text-2xl font-black mb-8">{isEditing ? "Update Profile Details" : "Register New Member"}</h2>
                <form onSubmit={handleSaveMember} className="space-y-5">
                  <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 rounded-xl border bg-slate-50 outline-none" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3.5 rounded-xl border bg-slate-50 outline-none" />
                    <input required placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3.5 rounded-xl border bg-slate-50 outline-none" />
                  </div>
                  {!isEditing && <input required type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-3.5 rounded-xl border bg-slate-50 outline-none" />}
                  <button type="submit" className="w-full py-4 rounded-2xl font-black bg-[#FEEF75] text-black shadow-lg">
                    {isEditing ? "Update Profile" : "Create Account"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {viewState === "details" && selectedMember && (
            <div className="max-w-6xl mx-auto animate-fadeIn">
              <button onClick={() => setViewState("list")} className="mb-8 font-black flex items-center gap-2" style={{ color: colors.textMuted }}>
                <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
              </button>

              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 rounded-[2.5rem] border bg-white shadow-xl" style={{ borderColor: colors.border }}>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-slate-100 mb-4 flex items-center justify-center text-4xl font-black text-gray-300 overflow-hidden">
                        {getImageUrl(selectedMember.image) ? <img src={getImageUrl(selectedMember.image)} className="w-full h-full object-cover" alt="" /> : selectedMember.name[0]}
                      </div>
                      <h3 className="font-black text-2xl text-gray-800">{selectedMember.name}</h3>
                      <p className="text-xs font-bold text-gray-400 mb-6">{selectedMember.email}</p>

                      <button
                        onClick={() => handleToggleStatus(selectedMember._id)}
                        className={`w-full py-3 mb-6 rounded-xl text-xs font-black transition-all border ${selectedMember.status === "Active"
                          ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white"
                          : "bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white"
                          }`}
                      >
                        {selectedMember.status === "Active" ? "DEACTIVATE ACCOUNT" : "ACTIVATE ACCOUNT"}
                      </button>

                      <div className="w-full space-y-3 pt-6 border-t border-dashed">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-gray-400">Status</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getStatusColor(selectedMember.status)}`}>
                            {selectedMember.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-gray-400">Current Plan</span>
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{selectedMember.plan?.name || "None"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-gray-400">Plan Expiry</span>
                          <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg">
                            {selectedMember.expiryDate ? new Date(selectedMember.expiryDate).toLocaleDateString('en-GB') : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <div className="p-8 rounded-[2.5rem] border bg-white shadow-xl" style={{ borderColor: colors.border }}>
                    <h3 className="font-black text-lg flex items-center gap-2 mb-8">
                      <i className="fa-solid fa-cart-shopping text-green-500"></i> Assign Membership Plan
                    </h3>

                    {/* PLAN PURCHASE FIELDS */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Select Plan</label>
                        <select
                          className="w-full p-3 rounded-xl border bg-slate-50 text-xs font-bold outline-none"
                          value={purchaseData.planId}
                          onChange={(e) => {
                            const p = plans.find(pl => pl._id === e.target.value);
                            setPurchaseData({ ...purchaseData, planId: e.target.value, amount: p?.price || "" });
                          }}
                        >
                          <option value="">Choose Plan...</option>
                          {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Amount to Pay (₹)</label>
                        <input type="number" className="w-full p-3 rounded-xl border bg-slate-50 text-xs font-bold outline-none" value={purchaseData.amount} onChange={(e) => setPurchaseData({ ...purchaseData, amount: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Payment Method</label>
                        <select className="w-full p-3 rounded-xl border bg-slate-50 text-xs font-bold outline-none" value={purchaseData.method} onChange={(e) => setPurchaseData({ ...purchaseData, method: e.target.value })}>
                          <option value="Cash">Cash (Manual)</option>
                          <option value="Online">Online (Razorpay)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handlePurchasePlan}
                      className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all ${selectedMember.expiryDate && new Date(selectedMember.expiryDate) > new Date()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      disabled={selectedMember.expiryDate && new Date(selectedMember.expiryDate) > new Date()}
                    >
                      {selectedMember.expiryDate && new Date(selectedMember.expiryDate) > new Date()
                        ? "Current Plan Not Expired"
                        : "Activate Membership & Log Payment"}
                    </button>

                    {selectedMember.expiryDate && new Date(selectedMember.expiryDate) > new Date() && (
                      <p className="text-center text-[10px] font-black text-red-500 mt-2 uppercase">
                        Action Restricted until current plan expires.
                      </p>
                    )}
                  </div>

                  <div className="p-8 rounded-[2.5rem] border bg-white shadow-xl" style={{ borderColor: colors.border }}>
                    <h3 className="font-black text-lg mb-6">Payment History</h3>
                    <div className="space-y-3">
                      {selectedMember.history && selectedMember.history.length > 0 ? (
                        selectedMember.history.map((log, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div>
                              <p className="text-xs font-black text-gray-800">{new Date(log.date).toLocaleDateString('en-GB')}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{log.method} Payment</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-green-600">₹{log.amount}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Success</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-6 text-sm font-bold text-gray-400">No payment logs found.</p>
                      )}
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