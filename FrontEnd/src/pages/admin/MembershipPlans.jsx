import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/GlobalContext"; 
import { useTheme } from "../../context/ThemeContext"; 
import { toast } from 'react-hot-toast'; 

const MembershipPlans = () => {
  const { BACKEND_URL } = useGlobalContext();
  const { colors, theme } = useTheme(); 
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true); // Initial fetch loading
  const [isSubmitting, setIsSubmitting] = useState(false); // Add/Update loading
  const [processingId, setProcessingId] = useState(null); // Active/Deactive loading per card
  
  const [viewState, setViewState] = useState("list"); // 'list', 'form'
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: null, name: "", duration: "", durationLabel: "", price: "",
    originalPrice: "", accessLevel: "Gym Only", description: "",
    features: "", status: "Active"
  });

  // --- API HELPERS ---
  const getAuthHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userInfo?.token}`,
    };
  };

  // --- FETCH DATA ---
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/plans/admin`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setPlans(data);
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
      _id: null, name: "", duration: "", durationLabel: "", price: "",
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
    setIsSubmitting(true);
    
    const processedPayload = {
      ...formData,
      features: formData.features.split(",").map(f => f.trim()).filter(f => f !== ""),
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      duration: Number(formData.duration)
    };
    
    try {
      const url = isEditing 
        ? `${BACKEND_URL}/api/plans/admin/${formData._id}` 
        : `${BACKEND_URL}/api/plans/admin`;
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeader(),
        body: JSON.stringify(processedPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Operation failed");
      }

      toast.success(isEditing ? "Plan updated!" : "Plan created!");
      setViewState("list");
      fetchPlans(); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setProcessingId(id); // Set which card is loading
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`${BACKEND_URL}/api/plans/admin/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Status update failed");

      setPlans(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
      toast.success(`Plan is now ${newStatus}`);
    } catch (error) {
      toast.error("Could not update status");
    } finally {
      setProcessingId(null);
    }
  };

  // --- LOADING SPINNER COMPONENT ---
  const Spinner = ({ size = "w-4 h-4", color = "border-white" }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ color: colors.textMuted }}>
       <Spinner size="w-12 h-12" color="border-primary" />
       <p className="mt-4 font-medium">Loading membership plans...</p>
    </div>
  );

  return (
    <div 
      className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Membership Plans</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Control your subscription business logic here.</p>
        </div>
        {viewState === "list" && (
          <button 
            onClick={handleAddClick} 
            className="px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#1e3a8a' }}
          >
            <i className="fa-solid fa-plus"></i> Create New Plan
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {viewState === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative border rounded-3xl p-6 transition-all duration-300 flex flex-col ${plan.status === 'Inactive' ? 'opacity-70 grayscale-[0.5]' : 'hover:shadow-lg'}`}
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                  style={{ backgroundColor: plan.status === 'Active' ? colors.secondary : colors.border, color: colors.text }}
                >
                  <i className={`fa-solid ${plan.name.toLowerCase().includes('year') ? 'fa-crown' : 'fa-dumbbell'}`}></i>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                  style={{ 
                    backgroundColor: plan.status === "Active" ? colors.primary : colors.background,
                    color: "#111827",
                    borderColor: plan.status === "Active" ? colors.primary : colors.border
                  }}
                >
                  {plan.status}
                </div>
              </div>

              <h3 className="text-lg font-bold" style={{ color: colors.text }}>{plan.name}</h3>
              <p className="text-sm mb-4 h-10 overflow-hidden" style={{ color: colors.textMuted }}>{plan.description}</p>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: colors.text }}>₹{plan.price}</span>
                  {plan.originalPrice > plan.price && (
                    <span className="text-sm line-through opacity-50">₹{plan.originalPrice}</span>
                  )}
                </div>
                <div className="text-xs font-medium mt-1 uppercase" style={{ color: colors.textMuted }}>
                  {plan.durationLabel} • {plan.duration} Days
                </div>
              </div>

              <div className="flex-1 mb-6 border-t pt-4" style={{ borderColor: colors.border }}>
                <ul className="space-y-2">
                  {plan.features?.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-circle-check text-[10px]" style={{ color: colors.primary }}></i>
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  disabled={processingId === plan._id}
                  onClick={() => handleEditClick(plan)}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold hover:brightness-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                >
                  Edit
                </button>
                <button
                  disabled={processingId === plan._id}
                  onClick={() => handleToggleStatus(plan._id, plan.status)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  style={{ 
                    backgroundColor: plan.status === 'Active' ? '#fee2e2' : colors.primary, 
                    color: plan.status === 'Active' ? '#ef4444' : '#111827'
                  }}
                >
                  {processingId === plan._id ? <Spinner size="w-3 h-3" color="border-current" /> : (plan.status === 'Active' ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM VIEW */}
      {viewState === "form" && (
        <div className="max-w-3xl mx-auto">
          <button 
            disabled={isSubmitting}
            onClick={() => setViewState("list")} 
            className="mb-6 text-sm flex items-center gap-2 hover:opacity-70 disabled:opacity-50"
            style={{ color: colors.textMuted }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Plans
          </button>

          <div className="p-8 rounded-3xl border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
              {isEditing ? "Update Membership" : "New Membership Plan"}
            </h2>

            <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                   <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Plan Name</label>
                   <input required disabled={isSubmitting} type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:ring-2 outline-none disabled:opacity-60" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                </div>
                <div className="flex flex-col gap-1">
                   <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Access Level</label>
                   <select disabled={isSubmitting} value={formData.accessLevel} onChange={e => setFormData({ ...formData, accessLevel: e.target.value })} className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-60" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}>
                    <option>Gym Only</option>
                    <option>Gym + Group</option>
                    <option>All Access</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Duration (Days)</label>
                  <input required disabled={isSubmitting} type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-2 rounded-xl border outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                </div>
                <div>
                  <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Label (e.g. Month)</label>
                  <input required disabled={isSubmitting} type="text" value={formData.durationLabel} onChange={e => setFormData({ ...formData, durationLabel: e.target.value })} className="w-full px-4 py-2 rounded-xl border outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                </div>
                <div>
                  <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Original (₹)</label>
                  <input required disabled={isSubmitting} type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full px-4 py-2 rounded-xl border outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                </div>
                <div>
                  <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Discounted (₹)</label>
                  <input required disabled={isSubmitting} type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 rounded-xl border outline-none font-bold" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold ml-1" style={{ color: colors.textMuted }}>Features (Comma Separated)</label>
                <textarea required disabled={isSubmitting} rows="3" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full px-4 py-2 rounded-xl border outline-none" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} placeholder="Free WiFi, Trainer Access, Locker..."></textarea>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t pt-6" style={{ borderColor: colors.border }}>
                <button type="button" disabled={isSubmitting} onClick={() => setViewState("list")} className="px-6 py-2 rounded-xl border font-medium disabled:opacity-50" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}>Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2 min-w-[140px] justify-center transition-all hover:scale-[1.02] cursor-pointer" 
                  style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                >
                  {isSubmitting ? <Spinner color="border-current" /> : (isEditing ? "Update Plan" : "Create Plan")}
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