import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const ManageOffers = () => {
  // --- MOCK DATA ---
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "New Year Resolution",
      code: "NY2025",
      type: "Percentage",
      value: 20,
      plans: ["Yearly Elite", "Quarterly Pro"],
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      status: "Expired",
      usage: 145,
      revenue: 290000,
      target: "New Members"
    },
    {
      id: 2,
      title: "Student Summer Saver",
      code: "STUDENT500",
      type: "Flat",
      value: 500,
      plans: ["Monthly Basic"],
      startDate: "2025-05-01",
      endDate: "2025-08-31",
      status: "Active",
      usage: 42,
      revenue: 21000,
      target: "Students"
    },
    {
      id: 3,
      title: "Flash Sale Weekend",
      code: "FLASH30",
      type: "Percentage",
      value: 30,
      plans: ["All Plans"],
      startDate: "2025-08-15",
      endDate: "2025-08-17",
      status: "Scheduled",
      usage: 0,
      revenue: 0,
      target: "All Users"
    }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'form'
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    id: null, title: "", code: "", type: "Percentage", value: "", 
    plans: [], startDate: "", endDate: "", status: "Active", target: "All Users"
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

  // --- HELPERS ---
  const getStatusColor = (status, endDate) => {
    const today = new Date().toISOString().split('T')[0];
    if (status === "Inactive") return "bg-gray-100 text-gray-500 border-gray-200";
    if (endDate < today) return "bg-red-50 text-red-600 border-red-200"; // Expired logic
    if (status === "Scheduled") return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-[#D9F17F] text-green-900 border-green-200"; // Active
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // --- ACTIONS ---
  const handleOpenForm = (offer = null) => {
    if (offer) {
      setFormData({ ...offer });
      setIsEditing(true);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: null, title: "", code: "", type: "Percentage", value: "", 
        plans: [], startDate: today, endDate: "", status: "Active", target: "All Users"
      });
      setIsEditing(false);
    }
    setViewState("form");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.code || !formData.value) {
      toast.error("Please fill all required fields.");
      return;
    }

    const newOffer = {
      ...formData,
      id: formData.id || Date.now(),
      usage: isEditing ? formData.usage : 0,
      revenue: isEditing ? formData.revenue : 0,
      status: calculateDaysLeft(formData.endDate) < 0 ? "Expired" : formData.status
    };

    if (isEditing) {
      setOffers(prev => prev.map(o => o.id === newOffer.id ? newOffer : o));
      toast.success("Offer updated successfully.");
    } else {
      setOffers([newOffer, ...offers]);
      toast.success("New offer created & live!");
      // Simulate Notification Integration
      toast.info(`Notification sent to ${formData.target}`);
    }
    setViewState("list");
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this offer? This cannot be undone.")) {
      setOffers(prev => prev.filter(o => o.id !== id));
      toast.info("Offer deleted.");
    }
  };

  const toggleStatus = (id) => {
    setOffers(prev => prev.map(o => {
      if (o.id === id) {
        const newStatus = o.status === "Active" ? "Inactive" : "Active";
        toast.info(`Offer marked as ${newStatus}`);
        return { ...o, status: newStatus };
      }
      return o;
    }));
  };

  // --- FILTERING ---
  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || o.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
          <p className="text-sm text-gray-500 mt-1">Create coupons, discounts, and promotional campaigns.</p>
        </div>
        
        {viewState === 'list' && (
          <button 
            onClick={() => handleOpenForm()}
            className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-tags"></i> Create Offer
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
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center">
             <div className="relative flex-grow md:max-w-xs">
                <input
                   type="text"
                   placeholder="Search offers..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
             </div>
             
             <div className="flex gap-2">
                {['All', 'Active', 'Expired', 'Scheduled'].map(st => (
                   <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${filterStatus === st ? 'bg-[#CDE7FE] text-blue-900 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                   >
                      {st}
                   </button>
                ))}
             </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredOffers.map(offer => {
                const daysLeft = calculateDaysLeft(offer.endDate);
                const isExpired = daysLeft < 0;
                
                return (
                <div key={offer.id} className={`relative bg-white border rounded-3xl p-0 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden ${isExpired ? 'border-gray-200 opacity-80' : 'border-[#FEEF75]'}`}>
                   
                   {/* Top Section (Ticket Style) */}
                   <div className={`p-5 relative ${isExpired ? 'bg-gray-50' : 'bg-[#FEEF75]/20'}`}>
                      <div className="flex justify-between items-start mb-2">
                         <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(isExpired ? "Expired" : offer.status, offer.endDate)}`}>
                            {isExpired ? "Expired" : offer.status}
                         </span>
                         <div className="flex gap-2">
                            <button onClick={() => toggleStatus(offer.id)} className="text-gray-400 hover:text-blue-600 cursor-pointer" title="Toggle Status">
                               <i className={`fa-solid ${offer.status === 'Active' ? 'fa-toggle-on text-green-500' : 'fa-toggle-off'}`}></i>
                            </button>
                            <button onClick={() => handleOpenForm(offer)} className="text-gray-400 hover:text-blue-600 cursor-pointer">
                               <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onClick={() => handleDelete(offer.id)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                               <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                         </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{offer.title}</h3>
                      <div className="flex items-center gap-2 mb-4">
                         <span className="font-mono text-sm bg-white border border-dashed border-gray-400 px-2 py-1 rounded text-gray-700 tracking-wider">
                            {offer.code}
                         </span>
                         <span className="text-xs font-bold text-red-500">
                            {offer.type === 'Percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                         </span>
                      </div>

                      <div className="flex justify-between items-end text-xs text-gray-500">
                         <div>
                            <p>Valid: <span className="font-medium text-gray-800">{offer.startDate}</span> to</p>
                            <p className="font-medium text-gray-800">{offer.endDate}</p>
                         </div>
                         {!isExpired && (
                            <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg">
                               {daysLeft} days left
                            </span>
                         )}
                      </div>
                   </div>

                   {/* Perforation Line */}
                   <div className="relative h-4 bg-white">
                      <div className="absolute top-1/2 w-full border-t-2 border-dashed border-gray-200"></div>
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full"></div>
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full"></div>
                   </div>

                   {/* Bottom Section (Analytics) */}
                   <div className="p-5 pt-2 flex-grow flex flex-col justify-end bg-white">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Performance</p>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-blue-50 p-2 rounded-xl text-center">
                            <p className="text-lg font-bold text-blue-900">{offer.usage}</p>
                            <p className="text-[10px] text-blue-600">Redemptions</p>
                         </div>
                         <div className="bg-green-50 p-2 rounded-xl text-center">
                            <p className="text-lg font-bold text-green-900">₹{(offer.revenue/1000).toFixed(1)}k</p>
                            <p className="text-[10px] text-green-600">Revenue</p>
                         </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                         <p className="text-xs text-gray-500 flex items-center gap-1">
                            <i className="fa-solid fa-layer-group"></i> 
                            Applies to: <span className="font-medium text-gray-800 truncate" title={offer.plans.join(", ")}>{offer.plans.length > 2 ? `${offer.plans[0]} +${offer.plans.length-1}` : offer.plans.join(", ")}</span>
                         </p>
                      </div>
                   </div>

                </div>
             )})}
             {filteredOffers.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400">
                   <p>No offers found matching your filters.</p>
                </div>
             )}
          </div>
        </>
      )}

      {/* --- FORM VIEW --- */}
      {viewState === 'form' && (
        <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-3xl border border-gray-200">
           <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? "Edit Offer" : "Create New Campaign"}</h2>
           
           <form onSubmit={handleSave} className="space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Campaign Title</label>
                    <input 
                       type="text" 
                       required 
                       value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 font-medium"
                       placeholder="e.g. Summer Sale"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Promo Code</label>
                    <input 
                       type="text" 
                       required 
                       value={formData.code} 
                       onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 uppercase font-mono text-sm"
                       placeholder="SUMMER25"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Target Audience</label>
                    <select 
                       value={formData.target}
                       onChange={e => setFormData({...formData, target: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm bg-white cursor-pointer"
                    >
                       <option>All Users</option>
                       <option>New Members</option>
                       <option>Students</option>
                       <option>Renewals</option>
                    </select>
                 </div>
              </div>

              {/* Value & Type */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 grid grid-cols-3 gap-4">
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Discount Type</label>
                    <div className="flex flex-col gap-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="type" checked={formData.type === 'Percentage'} onChange={() => setFormData({...formData, type: 'Percentage'})} />
                          <span className="text-sm">Percentage (%)</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="type" checked={formData.type === 'Flat'} onChange={() => setFormData({...formData, type: 'Flat'})} />
                          <span className="text-sm">Flat Amount (₹)</span>
                       </label>
                    </div>
                 </div>
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Discount Value</label>
                    <input 
                       type="number" 
                       required 
                       value={formData.value} 
                       onChange={e => setFormData({...formData, value: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-lg font-bold"
                       placeholder={formData.type === 'Percentage' ? "20" : "500"}
                    />
                 </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
                    <input 
                       type="date" 
                       required 
                       value={formData.startDate} 
                       onChange={e => setFormData({...formData, startDate: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
                    <input 
                       type="date" 
                       required 
                       value={formData.endDate} 
                       onChange={e => setFormData({...formData, endDate: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm cursor-pointer"
                    />
                 </div>
              </div>

              {/* Plans Selection */}
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2">Applicable Plans</label>
                 <div className="flex flex-wrap gap-2">
                    {['All Plans', 'Monthly Basic', 'Quarterly Pro', 'Yearly Elite'].map(plan => (
                       <button
                          key={plan}
                          type="button"
                          onClick={() => {
                             const newPlans = formData.plans.includes(plan) 
                                ? formData.plans.filter(p => p !== plan)
                                : [...formData.plans, plan];
                             setFormData({...formData, plans: newPlans});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${formData.plans.includes(plan) ? 'bg-[#CDE7FE] text-blue-900 border-blue-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                       >
                          {plan}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                 <button type="button" onClick={() => setViewState("list")} className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 cursor-pointer">
                    Cancel
                 </button>
                 <button type="submit" className="flex-1 py-3 bg-[#FEEF75] text-yellow-900 rounded-xl font-bold hover:bg-yellow-300 shadow-sm cursor-pointer">
                    {isEditing ? "Update Offer" : "Launch Campaign"}
                 </button>
              </div>

           </form>
        </div>
      )}

    </div>
  );
};

export default ManageOffers;