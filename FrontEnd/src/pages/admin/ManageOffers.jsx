import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";

const ManageOffers = () => {
  // Use local mock API directly to avoid context errors in preview
  const { api } = useGlobalContext()


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

    // ❌ End date before start date
    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

    //  End date before today
    if (end < today) {
      toast.error("End date cannot be in the past");
      return;
    }

    // Continue if valid
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
      fetchData(); // Refresh list
    } catch (error) {
      toast.error("Failed to deactivate");
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage discounts on membership plans.</p>
        </div>

        {viewState === 'list' && (
          <button
            onClick={handleOpenForm}
            className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i> Create Offer
          </button>
        )}
        {viewState === 'form' && (
          <button
            onClick={() => setViewState("list")}
            className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Back to List
          </button>
        )}
      </div>

      {/* --- LIST VIEW --- */}
      {viewState === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.length > 0 ? offers.map(offer => (
            <div key={offer._id} className={`relative bg-white border ${offer.isActive ? 'border-[#FEEF75]' : 'border-gray-200 opacity-70'} rounded-3xl p-6 shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${offer.isActive ? 'bg-[#FEEF75] text-yellow-900 border-yellow-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
                {offer.isActive && (
                  <button onClick={() => deactivateOffer(offer.plan._id)} className="text-red-500 hover:text-red-700 text-xs font-bold underline">
                    Deactivate

                  </button>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{offer.plan.name || "Unknown Plan"}</h3>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-red-500">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                </span>
                <span className="text-sm font-bold text-gray-400">OFF</span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><i className="fa-regular fa-calendar mr-2"></i> Start: <span className="font-medium text-gray-800">{formatDate(offer.startDate)}</span></p>
                <p><i className="fa-regular fa-calendar-check mr-2"></i> End: <span className="font-medium text-gray-800">{formatDate(offer.endDate)}</span></p>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-400">
              <p>No active offers found.</p>
            </div>
          )}
        </div>
      )}

      {/* --- FORM VIEW --- */}
      {viewState === 'form' && (
        <div className="max-w-xl mx-auto bg-gray-50 p-8 rounded-3xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Offer</h2>

          <form onSubmit={handleSave} className="space-y-6">

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Select Plan</label>
              <select
                required
                value={formData.planId}
                onChange={e => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="">-- Choose a Plan --</option>
                {plans.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Value</label>
                <input
                  type="number"
                  required
                  value={formData.discountValue}
                  onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
                  placeholder="e.g. 20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">End Date</label>
                <input
                  type="date"
                  required
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-4">
              <button type="button" onClick={() => setViewState("list")} className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-[#FEEF75] text-yellow-900 rounded-xl font-bold hover:bg-yellow-300 shadow-sm">Apply Offer</button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default ManageOffers;