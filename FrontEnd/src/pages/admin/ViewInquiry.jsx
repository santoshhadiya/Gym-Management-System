import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'; // Switched to react-hot-toast
import { useGlobalContext } from "../../context/GlobalContext";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

// Mock Data for Preview
const MOCK_INQUIRIES = [
  { _id: "iq1", name: "Rahul Verma", email: "rahul@test.com", phone: "9876543210", message: "Interested in the yearly plan prices.", status: "New", createdAt: "2024-10-25T10:00:00Z" },
  { _id: "iq2", name: "Sneha Gupta", email: "sneha@test.com", phone: "9123456789", message: "Do you have Zumba classes?", status: "Contacted", createdAt: "2024-10-24T14:30:00Z" },
  { _id: "iq3", name: "Vikram Singh", email: "vikram@test.com", phone: "9988776655", message: "Is personal training included in basic plan?", status: "Resolved", createdAt: "2024-10-23T09:15:00Z" },
];

const ViewInquiry = () => {
  const { BACKEND_URL } = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  // Style Injection
  useEffect(() => {
    // Note: react-toastify link removed as it is no longer used
    const font = document.createElement("link");
    font.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    return () => { 
       document.head.removeChild(font);
    };
  }, []);

  // Fetch Data
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const res = await fetch(`${BACKEND_URL}/api/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load inquiries");
      
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Actions
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setInquiries(prev => prev.map(iq => iq._id === id ? { ...iq, status: newStatus } : iq));

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      await fetch(`${BACKEND_URL}/api/inquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Update failed");
      fetchInquiries(); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      setInquiries(prev => prev.filter(iq => iq._id !== id));

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      await fetch(`${BACKEND_URL}/api/inquiries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Inquiry deleted");
    } catch (err) {
      toast.error("Delete failed");
      fetchInquiries();
    }
  };

  // Filter
  const filteredInquiries = inquiries.filter(iq => 
    filterStatus === "All" || iq.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return { backgroundColor: colors.secondary, color: theme === 'dark' ? '#fff' : '#1e3a8a', borderColor: colors.secondary };
      case "Contacted": return { backgroundColor: colors.accent, color: theme === 'dark' ? '#fff' : '#854d0e', borderColor: colors.accent };
      case "Resolved": return { backgroundColor: colors.primary, color: '#111827', borderColor: colors.primary };
      default: return { backgroundColor: colors.background, color: colors.textMuted, borderColor: colors.border };
    }
  };

  return (
    <div 
      className="w-full rounded-3xl p-8 shadow-sm border font-sans min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Inquiries</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Manage visitor questions and leads.</p>
        </div>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 cursor-pointer transition-colors"
          style={{ 
            backgroundColor: colors.card, 
            borderColor: colors.border, 
            color: colors.text,
            borderWidth: '1px',
            '--tw-ring-color': colors.secondary 
          }}
        >
          <option value="All">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20" style={{ color: colors.textMuted }}>Loading inquiries...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredInquiries.length > 0 ? filteredInquiries.map((iq) => (
            <div 
              key={iq._id} 
              className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: colors.text }}>
                    {iq.name}
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold transition-colors"
                      style={getStatusColor(iq.status)}
                    >
                      {iq.status}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm mt-1" style={{ color: colors.textMuted }}>
                    <span className="flex items-center gap-1"><i className="fa-regular fa-envelope"></i> {iq.email}</span>
                    <span className="flex items-center gap-1"><i className="fa-solid fa-phone"></i> {iq.phone}</span>
                    <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {new Date(iq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {iq.status !== "Resolved" && (
                    <button 
                      onClick={() => handleStatusUpdate(iq._id, "Resolved")}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all"
                      style={{ 
                        backgroundColor: colors.primary, 
                        color: '#111827', 
                        borderColor: colors.primary 
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {iq.status === "New" && (
                    <button 
                      onClick={() => handleStatusUpdate(iq._id, "Contacted")}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all"
                      style={{ 
                        backgroundColor: colors.accent, 
                        color: theme === 'dark' ? '#fff' : '#854d0e', 
                        borderColor: colors.accent 
                      }}
                    >
                      Mark Contacted
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(iq._id)}
                    className="p-2 transition-colors hover:opacity-70"
                    style={{ color: colors.textMuted }}
                    title="Delete Inquiry"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              <div 
                className="p-4 rounded-xl border transition-colors"
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
              >
                <p className="text-sm leading-relaxed italic" style={{ color: colors.text }}>"{iq.message}"</p>
              </div>
            </div>
          )) : (
            <div 
              className="text-center py-16 rounded-3xl border border-dashed transition-colors"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
               <p style={{ color: colors.textMuted }}>No inquiries found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewInquiry;