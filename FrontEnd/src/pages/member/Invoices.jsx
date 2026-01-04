import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Invoices = () => {
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

  // --- MOCK DATA ---
  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      plan: 'Yearly Elite Membership',
      amount: 12000,
      tax: 2160,
      total: 14160,
      method: 'UPI',
      status: 'Paid',
      member: { name: "Santosh Hadiya", id: "MEM001", address: "Ahmedabad, Gujarat" }
    },
    {
      id: 'INV-2024-002',
      date: '2024-06-10',
      plan: 'Personal Training (10 Sessions)',
      amount: 5000,
      tax: 900,
      total: 5900,
      method: 'Card',
      status: 'Paid',
      member: { name: "Santosh Hadiya", id: "MEM001", address: "Ahmedabad, Gujarat" }
    },
    {
      id: 'INV-2024-003',
      date: '2024-09-01',
      plan: 'Nutrition Plan - Q3',
      amount: 1500,
      tax: 270,
      total: 1770,
      method: 'Pending',
      status: 'Unpaid',
      member: { name: "Santosh Hadiya", id: "MEM001", address: "Ahmedabad, Gujarat" }
    },
  ]);

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- HELPERS ---
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Paid': return "bg-[#D9F17F] text-green-900 border-green-200";
      case 'Unpaid': return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      case 'Overdue': return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  // --- ACTIONS ---
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleDownload = (id) => {
    toast.success(`Downloading Invoice #${id}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- FILTERING ---
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Your Invoices</h1>
          <p className="text-gray-500 mt-1">View and download your payment receipts.</p>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
         <div className="relative flex-grow md:max-w-xs">
            <input
               type="text"
               placeholder="Search Invoice ID..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm transition-all"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
         </div>
         
         <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Paid', 'Unpaid'].map(status => (
               <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                     filterStatus === status 
                     ? 'bg-[#CDE7FE] text-blue-900 shadow-sm' 
                     : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
               >
                  {status}
               </button>
            ))}
         </div>
      </div>

      {/* --- INVOICE LIST --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan / Service</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6 font-mono text-sm font-medium text-gray-700">{inv.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{inv.date}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-800">{inv.plan}</td>
                  <td className="py-4 px-6 text-sm font-black text-gray-900 text-right">₹{inv.total.toLocaleString()}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={() => handleViewInvoice(inv)}
                         className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                         title="View Details"
                       >
                          <i className="fa-regular fa-eye text-xs"></i>
                       </button>
                       <button 
                         onClick={() => handleDownload(inv.id)}
                         disabled={inv.status !== 'Paid'}
                         className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                           inv.status === 'Paid' 
                           ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer' 
                           : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                         }`}
                         title={inv.status === 'Paid' ? "Download PDF" : "Payment Pending"}
                       >
                          <i className="fa-solid fa-download text-xs"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="6" className="py-12 text-center text-gray-400">
                      <i className="fa-solid fa-file-invoice text-4xl mb-3 opacity-20"></i>
                      <p>No invoices found.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- INVOICE DETAILS MODAL --- */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           {/* Added [&::-webkit-scrollbar]:hidden to hide scrollbar in Chrome/Safari/Edge 
              Added scrollbar-width: none logic via custom inline style below for Firefox support
           */}
           <div 
             className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in relative flex flex-col [&::-webkit-scrollbar]:hidden"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
           >
              
              {/* Modal Header */}
              <div className="bg-[#f8f9fa] px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0 sticky top-0 z-10">
                 <h2 className="text-xl font-black text-gray-900">INVOICE DETAILS</h2>
                 <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>

              {/* Receipt Body */}
              <div className="p-8 font-mono text-sm">
                 
                 {/* Top Row */}
                 <div className="flex justify-between mb-8">
                    <div>
                       <h3 className="text-lg font-bold text-gray-800">Songar's GYM</h3>
                       <p className="text-gray-500">123 Fitness Street, Naranpura</p>
                       <p className="text-gray-500">Ahmedabad, Gujarat</p>
                    </div>
                    <div className="text-right">
                       <p className="text-gray-500">Invoice #</p>
                       <p className="font-bold text-gray-900 text-lg">{selectedInvoice.id}</p>
                       <p className="text-gray-500 mt-1">Date: {selectedInvoice.date}</p>
                    </div>
                 </div>

                 {/* Bill To */}
                 <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Billed To</p>
                    <p className="font-bold text-gray-900">{selectedInvoice.member.name}</p>
                    <p className="text-gray-500">{selectedInvoice.member.id}</p>
                    <p className="text-gray-500">{selectedInvoice.member.address}</p>
                 </div>

                 {/* Line Items */}
                 <table className="w-full mb-6">
                    <thead className="border-b border-gray-200">
                       <tr>
                          <th className="text-left py-2 text-gray-500">Description</th>
                          <th className="text-right py-2 text-gray-500">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       <tr>
                          <td className="py-4 text-gray-800">{selectedInvoice.plan}</td>
                          <td className="py-4 text-right font-bold">₹{selectedInvoice.amount.toLocaleString()}</td>
                       </tr>
                       <tr>
                          <td className="py-4 text-gray-500">Tax (18% GST)</td>
                          <td className="py-4 text-right text-gray-500">₹{selectedInvoice.tax.toLocaleString()}</td>
                       </tr>
                    </tbody>
                 </table>

                 {/* Total */}
                 <div className="flex justify-between items-center border-t-2 border-gray-800 pt-4 mb-8">
                    <span className="font-bold text-xl text-gray-900">Total</span>
                    <span className="font-black text-2xl text-green-600">₹{selectedInvoice.total.toLocaleString()}</span>
                 </div>

                 {/* Footer Actions */}
                 {selectedInvoice.status === 'Paid' ? (
                   <div className="flex gap-4">
                      <button 
                         onClick={handlePrint}
                         className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                         <i className="fa-solid fa-print"></i> Print
                      </button>
                      <button 
                         onClick={() => handleDownload(selectedInvoice.id)}
                         className="flex-1 py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold hover:bg-green-300 transition-colors flex items-center justify-center gap-2"
                      >
                         <i className="fa-solid fa-download"></i> Download PDF
                      </button>
                   </div>
                 ) : (
                    <div className="mt-4 text-center bg-red-50 border border-red-100 rounded-xl p-4">
                       <p className="text-sm text-red-600 font-bold mb-2">
                          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                          This invoice is pending payment.
                       </p>
                       <p className="text-xs text-red-500">Download and Print options are disabled until payment is cleared.</p>
                    </div>
                 )}

              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;