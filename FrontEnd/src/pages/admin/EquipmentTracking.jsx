import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { ToastContainer, toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EquipmentTracking = () => {
  // --- MOCK DATA ---
  const [equipmentList, setEquipmentList] = useState([
    {
      id: 1,
      name: "Treadmill X100",
      category: "Cardio",
      quantity: 5,
      condition: "Good",
      location: "Cardio Zone",
      purchaseDate: "2023-01-15",
      warrantyExpiry: "2026-01-15",
      lastService: "2024-06-10",
      nextService: "2024-12-10",
      usage: "High"
    },
    {
      id: 2,
      name: "Dumbbell Set (5-25kg)",
      category: "Strength",
      quantity: 2,
      condition: "Repair Needed",
      location: "Free Weights",
      purchaseDate: "2022-05-20",
      warrantyExpiry: "2024-05-20", // Expired
      lastService: "2024-01-15",
      nextService: "2024-07-15", // Overdue
      usage: "Medium"
    },
    {
      id: 3,
      name: "Rowing Machine",
      category: "Cardio",
      quantity: 3,
      condition: "Good",
      location: "Cardio Zone",
      purchaseDate: "2023-11-01",
      warrantyExpiry: "2025-11-01",
      lastService: "2024-05-01",
      nextService: "2024-11-01",
      usage: "Low"
    },
    {
      id: 4,
      name: "Cable Crossover",
      category: "Strength",
      quantity: 1,
      condition: "Out of Order",
      location: "Machine Zone",
      purchaseDate: "2021-08-10",
      warrantyExpiry: "2024-08-10",
      lastService: "2024-02-20",
      nextService: "2024-08-20",
      usage: "High"
    }
  ]);

  const [maintenanceLog, setMaintenanceLog] = useState([
    { id: 101, equipment: "Dumbbell Set", date: "2024-01-15", cost: 2000, type: "Routine Check", technician: "GymFix Pros" },
    { id: 102, equipment: "Treadmill X100", date: "2024-06-10", cost: 5000, type: "Belt Replacement", technician: "Official Service" }
  ]);

  // --- STATE ---
  const [viewState, setViewState] = useState("list"); // 'list', 'maintenance', 'analytics'
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  
  const [formData, setFormData] = useState({
    id: null, name: "", category: "Cardio", quantity: 1, condition: "Good", 
    location: "", purchaseDate: "", warrantyExpiry: "", nextService: ""
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

    // Initial Alerts
    const repairNeeded = equipmentList.filter(e => e.condition === "Repair Needed" || e.condition === "Out of Order").length;
    if (repairNeeded > 0) {
      toast.warn(`${repairNeeded} Equipment items need attention!`, { autoClose: 5000 });
    }

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- HELPERS ---
  const getConditionStyle = (condition) => {
    switch(condition) {
      case "Good": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Repair Needed": return "bg-[#FEEF75] text-yellow-900 border-yellow-200 animate-pulse";
      case "Out of Order": return "bg-red-50 text-red-600 border-red-200";
      case "Retired": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getWarrantyStatus = (expiryDate) => {
    const today = new Date().toISOString().split('T')[0];
    return expiryDate < today ? "Expired" : "Active";
  };

  // --- ACTIONS ---
  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ ...item });
      setIsEditing(true);
    } else {
      setFormData({ 
        id: null, name: "", category: "Cardio", quantity: 1, condition: "Good", 
        location: "", purchaseDate: "", warrantyExpiry: "", nextService: "" 
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast.error("Please fill required fields.");
      return;
    }

    const newItem = {
      ...formData,
      id: formData.id || Date.now(),
      lastService: isEditing ? formData.lastService : "N/A",
      usage: isEditing ? formData.usage : "Low"
    };

    if (isEditing) {
      setEquipmentList(prev => prev.map(e => e.id === newItem.id ? newItem : e));
      toast.success("Equipment details updated.");
    } else {
      setEquipmentList([newItem, ...equipmentList]);
      toast.success("New equipment added to inventory.");
    }
    setShowModal(false);
  };

  const handleRetire = (id) => {
    if(window.confirm("Mark this equipment as Retired? This will archive it.")) {
      setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, condition: "Retired", location: "Storage" } : e));
      toast.info("Equipment retired.");
    }
  };

  const handleReportIssue = (id) => {
    // Simulating reporting flow
    setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, condition: "Repair Needed" } : e));
    toast.warn("Issue reported. Maintenance scheduled.");
  };

  // --- CHARTS DATA ---
  const conditionData = {
    labels: ["Good", "Repair Needed", "Out of Order", "Retired"],
    datasets: [{
      data: [
        equipmentList.filter(e => e.condition === "Good").length,
        equipmentList.filter(e => e.condition === "Repair Needed").length,
        equipmentList.filter(e => e.condition === "Out of Order").length,
        equipmentList.filter(e => e.condition === "Retired").length,
      ],
      backgroundColor: ["#D9F17F", "#FEEF75", "#ef4444", "#9ca3af"],
      borderWidth: 0
    }]
  };

  const costData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: "Maintenance Cost (₹)",
      data: [2000, 0, 1500, 800, 500, 5000],
      backgroundColor: "#CDE7FE",
      borderRadius: 6
    }]
  };

  // --- FILTERING ---
  const filteredList = equipmentList.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventory, maintenance, and asset health.</p>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
           <button 
             onClick={() => setViewState("list")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Inventory
           </button>
           <button 
             onClick={() => setViewState("maintenance")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'maintenance' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Maintenance Log
           </button>
           <button 
             onClick={() => setViewState("analytics")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'analytics' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Analytics
           </button>
        </div>
      </div>

      {/* --- INVENTORY VIEW --- */}
      {viewState === 'list' && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
             <div className="flex flex-wrap gap-3">
                <div className="relative">
                   <input
                      type="text"
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm w-64"
                   />
                   <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                </div>
                <select 
                   value={filterCategory} 
                   onChange={(e) => setFilterCategory(e.target.value)}
                   className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
                >
                   <option value="All">All Categories</option>
                   <option value="Cardio">Cardio</option>
                   <option value="Strength">Strength</option>
                   <option value="Accessories">Accessories</option>
                </select>
             </div>
             <button 
               onClick={() => handleOpenModal()}
               className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-full text-xs font-bold shadow-sm hover:bg-green-300 transition-colors flex items-center gap-2 cursor-pointer"
             >
               <i className="fa-solid fa-plus"></i> Add Equipment
             </button>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-900">Equipment</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Category & Loc</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Warranty</th>
                  <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.length > 0 ? filteredList.map((eq) => {
                   const warrantyStatus = getWarrantyStatus(eq.warrantyExpiry);
                   return (
                   <tr key={eq.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="font-bold text-gray-900">{eq.name}</div>
                         <div className="text-xs text-gray-400">Qty: {eq.quantity} • Bought: {eq.purchaseDate}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="block text-gray-900 font-medium">{eq.location}</span>
                         <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{eq.category}</span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${warrantyStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={warrantyStatus === 'Expired' ? 'text-red-500 font-medium' : 'text-gray-600'}>{warrantyStatus}</span>
                         </div>
                         <span className="text-xs text-gray-400">{eq.warrantyExpiry}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConditionStyle(eq.condition)}`}>
                            {eq.condition}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleReportIssue(eq.id)} className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 hover:bg-yellow-100 cursor-pointer" title="Report Issue">
                               <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                            </button>
                            <button onClick={() => handleOpenModal(eq)} className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 cursor-pointer" title="Edit">
                               <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onClick={() => handleRetire(eq.id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer" title="Retire">
                               <i className="fa-solid fa-box-archive text-xs"></i>
                            </button>
                         </div>
                      </td>
                   </tr>
                )}) : (
                   <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                         <p>No equipment found.</p>
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- ANALYTICS VIEW --- */}
      {viewState === 'analytics' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
               <h3 className="font-bold text-gray-900 mb-4 w-full">Condition Distribution</h3>
               <div className="h-64 w-full relative">
                  <Doughnut data={conditionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Maintenance Costs (6 Months)</h3>
               <div className="h-64 w-full">
                  <Bar data={costData} options={{ maintainAspectRatio: false }} />
               </div>
            </div>
         </div>
      )}

      {/* --- MAINTENANCE LOG VIEW --- */}
      {viewState === 'maintenance' && (
         <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-blue-600 uppercase">Upcoming Service</p>
                  <p className="text-xl font-bold text-gray-900">3 Items</p>
               </div>
               <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-green-600 uppercase">Total Spent (YTD)</p>
                  <p className="text-xl font-bold text-gray-900">₹45,000</p>
               </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
               <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                  <thead className="bg-[#f8f9fa]">
                     <tr>
                        <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 font-semibold text-gray-900">Equipment</th>
                        <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
                        <th className="px-6 py-4 font-semibold text-gray-900">Technician</th>
                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Cost</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {maintenanceLog.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4">{log.date}</td>
                           <td className="px-6 py-4 font-bold text-gray-900">{log.equipment}</td>
                           <td className="px-6 py-4">{log.type}</td>
                           <td className="px-6 py-4">{log.technician}</td>
                           <td className="px-6 py-4 text-right font-mono text-gray-800">₹{log.cost.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{isEditing ? "Update Details" : "Add New Equipment"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-6">
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Equipment Name</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.name} 
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                           placeholder="e.g. Treadmill Pro 5000"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Category</label>
                        <select 
                           value={formData.category} 
                           onChange={e => setFormData({...formData, category: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                        >
                           <option>Cardio</option>
                           <option>Strength</option>
                           <option>Accessories</option>
                           <option>Recovery</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Quantity</label>
                        <input 
                           type="number" 
                           required 
                           min="1"
                           value={formData.quantity} 
                           onChange={e => setFormData({...formData, quantity: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Location</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.location} 
                           onChange={e => setFormData({...formData, location: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
                           placeholder="e.g. Floor 1, Cardio Zone"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Condition</label>
                        <select 
                           value={formData.condition} 
                           onChange={e => setFormData({...formData, condition: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm bg-white cursor-pointer"
                        >
                           <option>Good</option>
                           <option>Repair Needed</option>
                           <option>Out of Order</option>
                           <option>Retired</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Purchase Date</label>
                        <input 
                           type="date" 
                           value={formData.purchaseDate} 
                           onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Warranty Expiry</label>
                        <input 
                           type="date" 
                           value={formData.warrantyExpiry} 
                           onChange={e => setFormData({...formData, warrantyExpiry: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                        />
                     </div>
                  </div>

                  <div className="mb-6">
                     <label className="block text-xs font-bold text-gray-500 mb-2">Next Service Date</label>
                     <input 
                        type="date" 
                        value={formData.nextService} 
                        onChange={e => setFormData({...formData, nextService: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm cursor-pointer"
                     />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors cursor-pointer">
                     {isEditing ? "Update Equipment" : "Add to Inventory"}
                  </button>

               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default EquipmentTracking;