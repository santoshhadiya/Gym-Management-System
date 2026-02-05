import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

const ManageOffers = () => {
  const { api } = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme

  // --- STATE ---
  const [offers, setOffers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState("list"); // 'list', 'form'

  const [formData, setFormData] = useState({
    planId: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: ""
  });

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice();
    return `${day}-${month}-${year}`;
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersRes, plansRes] = await Promise.all([
        api.get("/offers"),
        api.get("/plans")
      ]);
      setOffers(offersRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---
  const handleOpenForm = () => {
    setFormData({
      planId: "",
      discountType: "percentage",
      discountValue: "",
      startDate: "",
      endDate: ""
    });
    setViewState("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { startDate, endDate } = formData;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }
    if (end < today) {
      toast.error("End date cannot be in the past");
      return;
    }

    try {
      await api.post("/offers", formData);
      toast.success("Offer created successfully");
      setViewState("list");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create offer");
    }
  };

  const deactivateOffer = async (planId) => {
    if (!window.confirm("Are you sure you want to deactivate this offer?")) return;
    try {
      await api.put(`/offers/${planId}/deactivate`);
      toast.success("Offer Deactivated");
      fetchData();
    } catch (error) {
      toast.error("Failed to deactivate");
    }
  };
  
  const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div
      className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
      style={{
        color: colors.text
      }}
    >
      {/* Toaster is managed globally in ThemeContext.jsx */}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Manage Offers</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Create and manage discounts on membership plans.</p>
        </div>

        {viewState === 'list' && (
          <button
            onClick={handleOpenForm}
            className="px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: colors.primary, color: '#111827' }} // Lime Green with dark text
          >
            <i className="fa-solid fa-plus"></i> Create Offer
          </button>
        )}
        {viewState === 'form' && (
          <button
            onClick={() => setViewState("list")}
            className="px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer border"
            style={{ backgroundColor: colors.card, color: colors.text, borderColor: colors.border }}
          >
            Back to List
          </button>
        )}
      </div>

      {/* --- LIST VIEW --- */}
      {viewState === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.length > 0 ? offers.map(offer => (
            <div
              key={offer._id}
              className={`relative border rounded-3xl p-6 shadow-sm transition-opacity ${!offer.isActive && 'opacity-70'}`}
              style={{
                backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
                borderColor: getTransparentColor(colors.border, 0.2),
                backdropFilter: 'blur(16px)', // Blur effect
                WebkitBackdropFilter: 'blur(16px)'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                  style={{
                    backgroundColor: offer.isActive ? colors.accent : colors.background,
                    color: offer.isActive ? (theme === 'dark' ? '#fff' : '#854d0e') : colors.textMuted,
                    borderColor: offer.isActive ? colors.accent : colors.border
                  }}
                >
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
                {offer.isActive && (
                  <button onClick={() => deactivateOffer(offer.plan._id)} className="text-red-500 hover:text-red-700 text-xs font-bold underline">
                    Deactivate
                  </button>
                )}
              </div>

              <h3 className="font-bold text-lg mb-1" style={{ color: colors.text }}>{offer.plan.name || "Unknown Plan"}</h3>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-red-500">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                </span>
                <span className="text-sm font-bold" style={{ color: colors.textMuted }}>OFF</span>
              </div>

              <div className="text-xs space-y-1" style={{ color: colors.textMuted }}>
                <p><i className="fa-regular fa-calendar mr-2"></i> Start: <span className="font-medium" style={{ color: colors.text }}>{formatDate(offer.startDate)}</span></p>
                <p><i className="fa-regular fa-calendar-check mr-2"></i> End: <span className="font-medium" style={{ color: colors.text }}>{formatDate(offer.endDate)}</span></p>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center" style={{ color: colors.textMuted }}>
              <p>No active offers found.</p>
            </div>
          )}
        </div>
      )}

      {/* --- FORM VIEW --- */}
      {viewState === 'form' && (
        <div
          className="max-w-xl mx-auto p-8 rounded-3xl border transition-colors"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>Create New Offer</h2>

          <form onSubmit={handleSave} className="space-y-6">

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Select Plan</label>
              <select
                required
                value={formData.planId}
                onChange={e => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors"
                style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
              >
                <option value="">-- Choose a Plan --</option>
                {plans.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Value</label>
                <input
                  type="number"
                  required
                  value={formData.discountValue}
                  onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                  placeholder="e.g. 20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Start Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none text-sm"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>End Date</label>
                <input
                  type="date"
                  required
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none text-sm"
                  style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                />
              </div>
            </div>

            <div className="pt-4 border-t flex gap-4" style={{ borderColor: colors.border }}>
              <button
                type="button"
                onClick={() => setViewState("list")}
                className="flex-1 py-3 border rounded-xl font-bold transition-colors"
                style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold shadow-sm transition-colors"
                style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
              >
                Apply Offer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageOffers;