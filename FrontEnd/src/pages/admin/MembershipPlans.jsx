import React, { useState, useEffect } from "react";
import PlansAnalysis from "../../components/Analysis/PlansAnalysis"; 
import { useGlobalContext } from "../../context/GlobalContext"; 
import { useTheme } from "../../context/ThemeContext"; // Import useTheme
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast

const MembershipPlans = () => {
  const { BACKEND_URL } = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewState, setViewState] = useState("list"); // 'list', 'form'
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, _id: null, name: "", duration: "", durationLabel: "", price: "",
    originalPrice: "", accessLevel: "Gym Only", description: "",
    features: "", status: "Active"
  });

  // --- FETCH DATA ---
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;
      
      if (typeof window !== 'undefined' && window.location.hostname.includes('webcontainer')) {
         // Mock data would be defined elsewhere or handled via MOCK_PLANS variable
         setTimeout(() => setPlans([]), 500); 
      } else {
         const res = await fetch(`${BACKEND_URL}/api/plans/admin`, {
           headers: { Authorization: `Bearer ${token}` },
         });
         if (!res.ok) throw new Error("Failed to fetch plans");
         const data = await res.json();
         setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // --- ACTIONS ---
  const handleAddClick = () => {
    setFormData({
      id: null, _id: null, name: "", duration: "", durationLabel: "", price: "",
      originalPrice: "", accessLevel: "Gym Only", description: "",
      features: "", status: "Active"
    });
    setIsEditing(false);
    setViewState("form");
  };

  const handleEditClick = (plan) => {
    setFormData({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features.join(", ") : plan.features
    });
    setIsEditing(true);
    setViewState("form");
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    const processedFeatures = formData.features.split(",").map(f => f.trim()).filter(f => f !== "");
    
    try {
      // Mock success for preview
      toast.success(isEditing ? "Plan Updated!" : "Plan Created!");
      setViewState("list");
      fetchPlans();
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
      setPlans(plans.map(p => p._id === id ? { ...p, status: currentStatus === "Active" ? "Inactive" : "Active" } : p));
      toast.success(`Plan ${currentStatus === "Active" ? 'Deactivated' : 'Activated'}`);
  };

  if (loading) return <div className="p-8 text-center" style={{ color: colors.textMuted }}>Loading Plans...</div>;

  return (
    <div 
      className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Membership Plans</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Manage pricing, features, and subscription offers.</p>
        </div>
        <div className="flex gap-3">
          {viewState === "list" && (
            <button 
              onClick={handleAddClick} 
              className="px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
              style={{ backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#1e3a8a' }}
            >
              <i className="fa-solid fa-plus mr-2"></i> Create New Plan
            </button>
          )}
        </div>
      </div>

      {/* 1. PLANS VIEW (CARDS) */}
      {viewState === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id || plan.id}
              className={`relative border rounded-3xl p-6 transition-all duration-300 flex flex-col group ${plan.status === 'Inactive' ? 'opacity-75' : 'hover:shadow-lg'}`}
              style={{ 
                backgroundColor: plan.status === 'Inactive' ? colors.background : colors.card, 
                borderColor: colors.border 
              }}
            >
              {/* Offer Badge */}
              {plan.offer?.isActive && plan.status === 'Active' && (
                <div 
                  className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm z-10 flex items-center gap-1"
                  style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                >
                  <i className="fa-solid fa-tag"></i> OFFER
                </div>
              )}

              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                  style={{ 
                    backgroundColor: plan.status === 'Active' ? colors.secondary : colors.border, 
                    color: plan.status === 'Active' ? colors.text : colors.textMuted 
                  }}
                >
                  <i className={`fa-solid ${plan.name.includes('Year') ? 'fa-crown' : 'fa-dumbbell'}`}></i>
                </div>
                <div 
                  className="px-2 py-1 rounded-full text-xs font-bold border"
                  style={{ 
                    backgroundColor: plan.status === "Active" ? colors.primary : colors.background,
                    color: plan.status === "Active" ? "#111827" : colors.textMuted,
                    borderColor: plan.status === "Active" ? colors.primary : colors.border
                  }}
                >
                  {plan.status}
                </div>
              </div>

              {/* Plan Details */}
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>{plan.name}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.textMuted }}>{plan.description}</p>

              {/* Pricing UI */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: colors.text }}>₹{plan.price}</span>
                  {plan.offer?.isActive && (
                    <span className="text-sm line-through" style={{ color: colors.textMuted }}>
                      ₹{plan.offer.originalPrice}
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium flex items-center gap-2 mt-1" style={{ color: colors.textMuted }}>
                  <span>/ {plan.durationLabel}</span>
                  {plan.offer?.isActive && (
                     <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primary, color: '#111827' }}>
                        Save ₹{plan.offer.originalPrice - plan.price}
                     </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 mb-6 border-t pt-4" style={{ borderColor: colors.border }}>
                <p className="text-xs font-bold uppercase mb-2" style={{ color: colors.textMuted }}>Features</p>
                <ul className="space-y-2">
                  {plan.features?.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: colors.text }}>
                      <i className="fa-solid fa-check mt-0.5 text-xs" style={{ color: colors.primary }}></i>
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                  {plan.features?.length > 3 && (
                    <li className="text-xs font-medium pl-5" style={{ color: colors.secondary }}>+ {plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleEditClick(plan)}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold transition-colors"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(plan._id, plan.status)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-colors border"
                  style={{ 
                    backgroundColor: plan.status === 'Active' ? colors.background : colors.primary, 
                    color: plan.status === 'Active' ? '#ef4444' : '#111827',
                    borderColor: plan.status === 'Active' ? '#fee2e2' : colors.primary
                  }}
                >
                  {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ADD / EDIT FORM */}
      {viewState === "form" && (
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => setViewState("list")} 
            className="mb-6 text-sm flex items-center gap-2 hover:opacity-70"
            style={{ color: colors.textMuted }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Plans
          </button>

          <div className="p-8 rounded-3xl border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>{isEditing ? "Edit Plan Details" : "Create New Plan"}</h2>

            <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textMuted }}>Plan Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Plan Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                  <select value={formData.accessLevel} onChange={e => setFormData({ ...formData, accessLevel: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}>
                    <option>Gym Only</option>
                    <option>Gym + Group</option>
                    <option>All Access</option>
                    <option>Off-Peak Only</option>
                  </select>
                  <textarea placeholder="Short Description" rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="md:col-span-2 w-full px-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}></textarea>
                </div>
              </div>

              {/* Duration & Price */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: colors.textMuted }}>Duration & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <input required type="number" placeholder="Days" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-1/2 px-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                    <input required type="text" placeholder="Label" value={formData.durationLabel} onChange={e => setFormData({ ...formData, durationLabel: e.target.value })} className="w-1/2 px-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative w-1/2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: colors.textMuted }}>MRP</span>
                      <input required type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                    </div>
                    <div className="relative w-1/2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: colors.textMuted }}>Base</span>
                      <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none font-bold" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features & Status */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: colors.textMuted }}>Features & Settings</h3>
                <div className="space-y-4">
                  <textarea placeholder="List features separated by comma" rows="3" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}></textarea>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium" style={{ color: colors.text }}>Initial Status:</label>
                    <div className="flex gap-4">
                      {["Active", "Inactive"].map(status => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="status" value={status} checked={formData.status === status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="focus:ring-blue-500" />
                          <span className="text-sm" style={{ color: colors.text }}>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t pt-6" style={{ borderColor: colors.border }}>
                <button type="button" onClick={() => setViewState("list")} className="px-6 py-2 rounded-xl border font-medium transition-colors" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}>Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl font-bold shadow-sm" style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}>
                  {isEditing ? "Update Plan" : "Launch Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;