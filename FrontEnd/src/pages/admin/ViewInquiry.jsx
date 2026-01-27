import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";


// Mock Data for Preview
const MOCK_INQUIRIES = [
  { _id: "iq1", name: "Rahul Verma", email: "rahul@test.com", phone: "9876543210", message: "Interested in the yearly plan prices.", status: "New", createdAt: "2024-10-25T10:00:00Z" },
  { _id: "iq2", name: "Sneha Gupta", email: "sneha@test.com", phone: "9123456789", message: "Do you have Zumba classes?", status: "Contacted", createdAt: "2024-10-24T14:30:00Z" },
  { _id: "iq3", name: "Vikram Singh", email: "vikram@test.com", phone: "9988776655", message: "Is personal training included in basic plan?", status: "Resolved", createdAt: "2024-10-23T09:15:00Z" },
];

const ViewInquiry = () => {
  const {BACKEND_URL}=useGlobalContext()
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  // Style Injection
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    const font = document.createElement("link");
    font.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    return () => { 
       document.head.removeChild(link); 
       document.head.removeChild(font);
    };
  }, []);

  // Fetch Data
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      const isPreview = false; // Set to false when backend is live

      if (!isPreview) {
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          const token = userInfo?.token;

          const res = await fetch(`${BACKEND_URL}/api/inquiries`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) throw new Error("Failed to load inquiries");
          
          const data = await res.json();
          setInquiries(data);
      } else {
          // Use mock data
          setTimeout(() => setInquiries(MOCK_INQUIRIES), 500);
      }
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
      // Optimistic update for UI
      setInquiries(prev => prev.map(iq => iq._id === id ? { ...iq, status: newStatus } : iq));

      const isPreview = false;
      if (!isPreview) {
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
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Update failed");
      fetchInquiries(); // Revert on error
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      setInquiries(prev => prev.filter(iq => iq._id !== id));

      const isPreview = false;
      if (!isPreview) {
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          const token = userInfo?.token;

          await fetch(`${BACKEND_URL}/api/inquiries/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
      }
      toast.info("Inquiry deleted");
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
      case "New": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Contacted": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Resolved": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage visitor questions and leads.</p>
        </div>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading inquiries...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredInquiries.length > 0 ? filteredInquiries.map((iq) => (
            <div key={iq._id} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {iq.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getStatusColor(iq.status)}`}>
                      {iq.status}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><i className="fa-regular fa-envelope"></i> {iq.email}</span>
                    <span className="flex items-center gap-1"><i className="fa-solid fa-phone"></i> {iq.phone}</span>
                    <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {new Date(iq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {iq.status !== "Resolved" && (
                    <button 
                      onClick={() => handleStatusUpdate(iq._id, "Resolved")}
                      className="px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 text-xs font-bold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {iq.status === "New" && (
                    <button 
                      onClick={() => handleStatusUpdate(iq._id, "Contacted")}
                      className="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50 text-xs font-bold transition-colors"
                    >
                      Mark Contacted
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(iq._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Inquiry"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed italic">"{iq.message}"</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500">No inquiries found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewInquiry;