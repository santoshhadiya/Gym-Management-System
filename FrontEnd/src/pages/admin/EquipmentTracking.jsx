import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EquipmentTracking = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme

  // --- STATE ---
  const [equipmentList, setEquipmentList] = useState([]);
  const [viewState, setViewState] = useState("list"); // 'list', 'analytics'
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    _id: null, name: "", category: "Cardio", quantity: 1, condition: "Good", 
    location: "", purchaseDate: ""
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

  // --- FETCH DATA ---
  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/equipment");
      setEquipmentList(res.data);
      
      const repairNeeded = res.data.filter(e => e.condition === "Repair Needed" || e.condition === "Out of Order").length;
      if (repairNeeded > 0) {
        toast(`${repairNeeded} Equipment items need attention!`, { icon: '⚠️' });
      }

    } catch (err) {
      toast.error("Failed to load equipment list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // --- HELPERS ---
  const getConditionStyle = (condition) => {
    switch(condition) {
      case "Good": return { backgroundColor: colors.primary, color: '#111827', borderColor: '#d1e675' };
      case "Repair Needed": return { backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e', borderColor: '#fde047' };
      case "Out of Order": return { backgroundColor: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' };
      case "Retired": return { backgroundColor: colors.border, color: colors.textMuted, borderColor: colors.border };
      default: return { backgroundColor: colors.background, color: colors.textMuted, borderColor: colors.border };
    }
  };

  // --- ACTIONS ---
  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ 
         ...item,
         purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : "" 
      });
      setIsEditing(true);
    } else {
      setFormData({ 
        _id: null, name: "", category: "Cardio", quantity: 1, condition: "Good", 
        location: "", purchaseDate: "" 
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast.error("Name and Location are required.");
      return;
    }

    const payload = {
       name: formData.name,
       category: formData.category,
       quantity: Number(formData.quantity),
       location: formData.location,
       condition: formData.condition,
       purchaseDate: formData.purchaseDate || null 
    };

    try {
      if (isEditing) {
        await api.put(`/equipment/${formData._id}`, payload);
        toast.success("Equipment updated.");
      } else {
        await api.post("/equipment", payload);
        toast.success("Equipment added.");
      }
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save equipment.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this equipment? This action cannot be undone.")) {
      try {
         await api.delete(`/equipment/${id}`);
         toast.success("Equipment deleted.");
         fetchEquipment();
      } catch (err) {
         toast.error("Failed to delete equipment.");
      }
    }
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
      backgroundColor: [colors.primary, colors.accent, "#ef4444", "#9ca3af"],
      borderWidth: 0
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
    <div 
      className="w-full rounded-3xl p-4 font-sans min-h-screen relative transition-colors duration-300"
      style={{color: colors.text }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Equipment Tracking</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Manage gym inventory and track asset condition.</p>
        </div>
        
        <div className="flex p-1.5 rounded-2xl border transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
           <button 
             onClick={() => setViewState("list")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'list' ? 'shadow' : 'hover:opacity-80'}`}
             style={{ 
               backgroundColor: viewState === 'list' ? colors.background : 'transparent',
               color: viewState === 'list' ? colors.secondary : colors.textMuted 
             }}
           >
             Inventory
           </button>
           <button 
             onClick={() => setViewState("analytics")}
             className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewState === 'analytics' ? 'shadow' : 'hover:opacity-80'}`}
             style={{ 
               backgroundColor: viewState === 'analytics' ? colors.background : 'transparent',
               color: viewState === 'analytics' ? colors.secondary : colors.textMuted 
             }}
           >
             Analytics
           </button>
        </div>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-20">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: colors.border }}></i>
         </div>
      ) : (
         <>
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
                            className="pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm w-64 transition-colors"
                            style={{ 
                              backgroundColor: colors.card, 
                              borderColor: colors.border, 
                              color: colors.text,
                              '--tw-ring-color': colors.secondary 
                            }}
                         />
                         <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                      </div>
                      <select 
                         value={filterCategory} 
                         onChange={(e) => setFilterCategory(e.target.value)}
                         className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 cursor-pointer transition-colors"
                         style={{ backgroundColor: colors.card, color: colors.text, borderColor: colors.border, '--tw-ring-color': colors.secondary }}
                      >
                         <option value="All">All Categories</option>
                         <option value="Cardio">Cardio</option>
                         <option value="Strength">Strength</option>
                         <option value="Accessories">Accessories</option>
                      </select>
                   </div>
                   <button 
                     onClick={() => handleOpenModal()}
                     className="px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                     style={{ backgroundColor: colors.primary, color: '#111827' }}
                   >
                     <i className="fa-solid fa-plus"></i> Add Equipment
                   </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border shadow-sm transition-colors" style={{ borderColor: colors.border }}>
                  <table className="w-full border-collapse text-left text-sm">
                    <thead style={{ backgroundColor: colors.card }}>
                      <tr>
                        <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Equipment</th>
                        <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Category & Loc</th>
                        <th className="px-6 py-4 font-semibold" style={{ color: colors.text }}>Purchase Date</th>
                        <th className="px-6 py-4 font-semibold text-center" style={{ color: colors.text }}>Condition</th>
                        <th className="px-6 py-4 font-semibold text-right" style={{ color: colors.text }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: colors.border, backgroundColor: colors.background }}>
                      {filteredList.length > 0 ? filteredList.map((eq) => (
                         <tr key={eq._id} className="transition-colors hover:opacity-80">
                            <td className="px-6 py-4">
                               <div className="font-bold" style={{ color: colors.text }}>{eq.name}</div>
                               <div className="text-xs" style={{ color: colors.textMuted }}>Qty: {eq.quantity}</div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="block font-medium" style={{ color: colors.text }}>{eq.location}</span>
                               <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#1e3a8a' }}>{eq.category}</span>
                            </td>
                            <td className="px-6 py-4" style={{ color: colors.text }}>
                               {eq.purchaseDate ? new Date(eq.purchaseDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${eq.condition === 'Repair Needed' ? 'animate-pulse' : ''}`}
                                style={getConditionStyle(eq.condition)}
                               >
                                  {eq.condition}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex justify-end gap-2 transition-opacity">
                                  <button onClick={() => handleOpenModal(eq)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: colors.secondary, color: colors.text }} title="Edit">
                                     <i className="fa-solid fa-pen text-xs"></i>
                                  </button>
                                  <button onClick={() => handleDelete(eq._id)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors" style={{ backgroundColor: colors.card }} title="Delete">
                                     <i className="fa-solid fa-trash text-xs"></i>
                                  </button>
                               </div>
                            </td>
                         </tr>
                      )) : (
                         <tr>
                            <td colSpan="5" className="px-6 py-12 text-center" style={{ color: colors.textMuted }}>
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
               <div className="max-w-md mx-auto">
                  <div className="border rounded-3xl p-6 shadow-sm flex flex-col items-center transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                     <h3 className="font-bold mb-4 w-full text-center" style={{ color: colors.text }}>Condition Overview</h3>
                     <div className="h-64 w-full relative">
                        <Doughnut 
                            data={conditionData} 
                            options={{ 
                                maintainAspectRatio: false, 
                                plugins: { 
                                    legend: { 
                                        position: 'bottom',
                                        labels: { color: colors.text }
                                    } 
                                } 
                            }} 
                        />
                     </div>
                  </div>
               </div>
            )}
         </>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: colors.card }}>
               <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: colors.sidebar, borderColor: colors.border }}>
                  <h3 className="font-bold" style={{ color: colors.text }}>{isEditing ? "Update Details" : "Add New Equipment"}</h3>
                  <button onClick={() => setShowModal(false)} style={{ color: colors.textMuted }}>
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="col-span-2">
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Equipment Name</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.name} 
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           placeholder="e.g. Treadmill Pro 5000"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Category</label>
                        <select 
                           value={formData.category} 
                           onChange={e => setFormData({...formData, category: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                        >
                           <option>Cardio</option>
                           <option>Strength</option>
                           <option>Accessories</option>
                           <option>Recovery</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Quantity</label>
                        <input 
                           type="number" 
                           required 
                           min="1"
                           value={formData.quantity} 
                           onChange={e => setFormData({...formData, quantity: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Location</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.location} 
                           onChange={e => setFormData({...formData, location: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                           placeholder="e.g. Floor 1"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Condition</label>
                        <select 
                           value={formData.condition} 
                           onChange={e => setFormData({...formData, condition: e.target.value})}
                           className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                           style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                        >
                           <option>Good</option>
                           <option>Repair Needed</option>
                           <option>Out of Order</option>
                           <option>Retired</option>
                        </select>
                     </div>
                  </div>

                  <div className="mb-6">
                     <label className="block text-xs font-bold mb-2" style={{ color: colors.textMuted }}>Purchase Date (Optional)</label>
                     <input 
                        type="date" 
                        value={formData.purchaseDate} 
                        onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-sm cursor-pointer transition-colors"
                        style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, '--tw-ring-color': colors.secondary }}
                     />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                    style={{ backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e' }}
                  >
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