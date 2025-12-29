import React, { useState } from "react";
import PlansAnalysis from "../../components/Analysis/PlansAnalysis";

const MembershipPlans = () => {
  // --- MOCK DATA ---
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Basic Monthly",
      duration: 30, // in days
      durationLabel: "1 Month",
      price: 1500,
      originalPrice: 2000,
      discount: 25,
      accessLevel: "Gym Only",
      features: ["Gym Access", "Locker Room", "Free Wi-Fi"],
      description: "Perfect for beginners getting started with fitness.",
      status: "Active",
      createdDate: "2023-01-10",
      analytics: { enrolled: 120, revenue: 180000, popular: false }
    },
    {
      id: 2,
      name: "Quarterly Pro",
      duration: 90,
      durationLabel: "3 Months",
      price: 4000,
      originalPrice: 4500,
      discount: 11,
      accessLevel: "Gym + Group",
      features: ["All Basic Benefits", "Group Classes", "Diet Consultation"],
      description: "Commit to a season of change with extra perks.",
      status: "Active",
      createdDate: "2023-03-15",
      analytics: { enrolled: 85, revenue: 340000, popular: true }
    },
    {
      id: 3,
      name: "Yearly Elite",
      duration: 365,
      durationLabel: "1 Year",
      price: 12000,
      originalPrice: 15000,
      discount: 20,
      accessLevel: "All Access",
      features: ["All Pro Benefits", "Unlimited PT Sessions", "Merchandise Pack", "Spa Access"],
      description: "The ultimate package for serious fitness enthusiasts.",
      status: "Active",
      createdDate: "2022-11-20",
      analytics: { enrolled: 45, revenue: 540000, popular: false }
    },
    {
      id: 4,
      name: "Student Saver",
      duration: 30,
      durationLabel: "1 Month",
      price: 1000,
      originalPrice: 1500,
      discount: 33,
      accessLevel: "Off-Peak Only",
      features: ["Gym Access (10AM-4PM)", "Student ID Required"],
      description: "Budget-friendly option for students.",
      status: "Inactive",
      createdDate: "2024-01-05",
      analytics: { enrolled: 10, revenue: 10000, popular: false }
    }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'form',"analysis"
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: "", duration: "", durationLabel: "", price: "",
    originalPrice: "", accessLevel: "Gym Only", description: "",
    features: "", status: "Active"
  });

  // --- HELPERS ---
  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-[#D9F17F] text-green-800 border-green-200"
      : "bg-gray-100 text-gray-500 border-gray-200";
  };

  const calculateDiscount = (price, original) => {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  };

  // --- CRUD OPERATIONS ---
  const handleAddClick = () => {
    setFormData({
      id: null, name: "", duration: "", durationLabel: "", price: "",
      originalPrice: "", accessLevel: "Gym Only", description: "",
      features: "", status: "Active"
    });
    setIsEditing(false);
    setViewState("form");
  };

  const handleEditClick = (plan) => {
    setFormData({
      ...plan,
      features: plan.features.join(", ") // Convert array to string for text input
    });
    setIsEditing(true);
    setViewState("form");
  };

  const handleSavePlan = (e) => {
    e.preventDefault();

    const processedFeatures = formData.features.split(",").map(f => f.trim()).filter(f => f !== "");
    const discount = calculateDiscount(Number(formData.price), Number(formData.originalPrice));

    const planData = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      duration: Number(formData.duration),
      features: processedFeatures,
      discount: discount,
      analytics: isEditing ? (plans.find(p => p.id === formData.id)?.analytics || { enrolled: 0, revenue: 0 }) : { enrolled: 0, revenue: 0, popular: false }
    };

    if (isEditing) {
      setPlans(plans.map(p => p.id === formData.id ? { ...p, ...planData } : p));
    } else {
      setPlans([...plans, { ...planData, id: Date.now(), createdDate: new Date().toISOString().split('T')[0] }]);
    }
    setViewState("list");
  };

  const handleToggleStatus = (id) => {
    setPlans(plans.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === "Active" ? "Inactive" : "Active" };
      }
      return p;
    }));
  };

  const handleSendNotification = (planName) => {
    alert(`Promotional notification for "${planName}" sent to eligible members!`);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>


          {
            viewState != "list" ? (
              <div className="flex gap-4 items-center mt-2w-fit cursor-pointer" onClick={() => setViewState("list")}>
                <i className="fa-solid fa-arrow-left text-sm text-gray-500"></i>
                <p className="text-sm text-gray-500  cursor-pointer" >Back</p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
                <p className="text-sm text-gray-500 mt-1">Manage pricing, features, and subscription offers.</p>
              </div>)
          }
        </div>
        <div className="flex gap-4">
          <div className="flex gap-3">
            {viewState === "list" && (
              <button onClick={handleAddClick} className="px-5 py-2 rounded-full bg-[#CDE7FE] text-blue-900 text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm">
                <i className="fa-solid fa-plus mr-2"></i> Create New Plan
              </button>
            )}
          </div>
          <div>
            <button onClick={() => setViewState('analysis')} className="px-5 py-2 rounded-full bg-[#CDE7FE] text-blue-900 text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm">
              <i class="fa-solid fa-chart-line"></i> Analysis
            </button>
          </div>
        </div>
      </div>

      {/* 1. PLANS VIEW (CARDS) */}
      {viewState === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-3xl p-6 transition-all duration-300 flex flex-col group ${plan.status === 'Inactive' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100 hover:shadow-lg'}`}
            >
              {/* Popular Badge */}
              {plan.analytics.popular && plan.status === 'Active' && (
                <div className="absolute top-0 right-0 bg-[#FEEF75] text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm z-10">
                  MOST POPULAR
                </div>
              )}

              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${plan.status === 'Active' ? 'bg-[#CDE7FE] text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <i className={`fa-solid ${plan.name.includes('Year') ? 'fa-crown' : 'fa-dumbbell'}`}></i>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </div>
              </div>

              {/* Plan Details */}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                  {plan.discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">₹{plan.originalPrice}</span>
                  )}
                </div>
                <div className="text-xs font-medium text-gray-500 flex items-center gap-2 mt-1">
                  <span>/ {plan.durationLabel}</span>
                  {plan.discount > 0 && (
                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      {plan.discount}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 mb-6 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Features</p>
                <ul className="space-y-2">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <i className="fa-solid fa-check text-green-500 mt-0.5 text-xs"></i>
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-xs text-blue-500 font-medium pl-5">+ {plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>

              {/* Analytics Mini-Dashboard */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-center border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Enrolled</p>
                  <p className="text-sm font-bold text-gray-800">{plan.analytics.enrolled}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Revenue/Mo</p>
                  <p className="text-sm font-bold text-gray-800">₹{(plan.analytics.revenue / 1000).toFixed(1)}k</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleEditClick(plan)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(plan.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${plan.status === 'Active' ? 'bg-white border border-red-100 text-red-500 hover:bg-red-50' : 'bg-[#D9F17F] text-green-900 hover:bg-green-300'}`}
                >
                  {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Promo Action */}
              {plan.status === 'Active' && (
                <button
                  onClick={() => handleSendNotification(plan.name)}
                  className="mt-2 w-full text-[10px] text-blue-500 font-bold hover:underline"
                >
                  <i className="fa-regular fa-paper-plane mr-1"></i> Send Promo Notification
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. ADD / EDIT FORM */}
      {viewState === "form" && (
        <div className="max-w-3xl mx-auto">


          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? "Edit Plan Details" : "Create New Plan"}</h2>

            <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Basic Info */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Plan Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Plan Name (e.g. Gold Monthly)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  <select value={formData.accessLevel} onChange={e => setFormData({ ...formData, accessLevel: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 bg-white">
                    <option>Gym Only</option>
                    <option>Gym + Group</option>
                    <option>All Access</option>
                    <option>Off-Peak Only</option>
                  </select>
                  <textarea placeholder="Short Description" rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="md:col-span-2 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300"></textarea>
                </div>
              </div>

              {/* Duration & Price */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">Duration & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <input required type="number" placeholder="Days" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-1/2 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                    <input required type="text" placeholder="Label (e.g. 1 Month)" value={formData.durationLabel} onChange={e => setFormData({ ...formData, durationLabel: e.target.value })} className="w-1/2 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative w-1/2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">MRP</span>
                      <input required type="number" placeholder="2000" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300" />
                    </div>
                    <div className="relative w-1/2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Offer</span>
                      <input required type="number" placeholder="1500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300 font-bold text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features & Status */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">Features & Settings</h3>
                <div className="space-y-4">
                  <textarea placeholder="List features separated by comma (e.g. Gym Access, Locker, Free Wi-Fi)" rows="3" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-300"></textarea>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-600">Initial Status:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="Active" checked={formData.status === "Active"} onChange={e => setFormData({ ...formData, status: e.target.value })} className="text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="Inactive" checked={formData.status === "Inactive"} onChange={e => setFormData({ ...formData, status: e.target.value })} className="text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-gray-200 pt-6">
                <button type="button" onClick={() => setViewState("list")} className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-[#FEEF75] text-yellow-900 font-bold hover:bg-yellow-300 shadow-sm shadow-yellow-100">
                  {isEditing ? "Update Plan" : "Launch Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {
        viewState == "analysis" && (
          <PlansAnalysis />
        )
      }
    </div>
  );
};

export default MembershipPlans;