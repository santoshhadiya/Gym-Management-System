import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const MemberPayments = () => {
  // --- STYLE INJECTION ---
  useEffect(() => {
    // Inject React Toastify CSS from CDN
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // --- MOCK DATA ---
  const [payments, setPayments] = useState([
    {
      id: 1,
      name: "Riya Patel",
      plan: "Yearly Elite",
      price: 12000,
      paid: 8000,
      pending: 4000,
      dueDate: "2024-10-30", // Overdue
      status: "Partial",
      history: [
        { id: 101, date: "2024-01-15", amount: 5000, method: "UPI", ref: "UPI-12345" },
        { id: 102, date: "2024-06-15", amount: 3000, method: "Cash", ref: "-" },
      ]
    },
    {
      id: 2,
      name: "Arjun Singh",
      plan: "Quarterly Pro",
      price: 4000,
      paid: 4000,
      pending: 0,
      dueDate: "-",
      status: "Paid",
      history: [
        { id: 201, date: "2024-09-01", amount: 4000, method: "Card", ref: "TXN-998877" }
      ]
    },
    {
      id: 3,
      name: "Sneha Gupta",
      plan: "Monthly Basic",
      price: 1500,
      paid: 0,
      pending: 1500,
      dueDate: "2024-11-05", // Upcoming
      status: "Pending",
      history: []
    }
  ]);

  // --- STATE ---
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "Cash", date: "", ref: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // --- ALERTS ---
  useEffect(() => {
    // Check for overdue payments on load
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = payments.filter(p => p.pending > 0 && p.dueDate < today && p.dueDate !== "-").length;
    
    if (overdueCount > 0) {
      toast.error(`${overdueCount} Members have overdue payments!`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, []); // Run once on mount

  // --- HELPERS ---
  const getStatusStyle = (status, dueDate) => {
    const today = new Date().toISOString().split('T')[0];
    if (status === "Paid") return "bg-[#D9F17F] text-green-900 border-green-200";
    if (pending > 0 && dueDate < today) return "bg-red-50 text-red-600 border-red-200 animate-pulse";
    if (status === "Partial") return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
    return "bg-gray-100 text-gray-500 border-gray-200";
  };

  // --- HANDLERS ---
  const handleRecordClick = (member) => {
    setSelectedMember(member);
    setPaymentForm({ amount: "", method: "Cash", date: new Date().toISOString().split('T')[0], ref: "" });
    setShowModal(true);
  };

  const handleInvoiceClick = (member) => {
    setSelectedMember(member);
    setShowInvoice(true);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    const amount = parseFloat(paymentForm.amount);
    
    if (amount <= 0 || amount > selectedMember.pending) {
      toast.warning("Invalid amount! Cannot exceed pending balance.");
      return;
    }

    const updatedPayments = payments.map(p => {
      if (p.id === selectedMember.id) {
        const newPaid = p.paid + amount;
        const newPending = p.price - newPaid;
        const newStatus = newPending === 0 ? "Paid" : "Partial";
        
        return {
          ...p,
          paid: newPaid,
          pending: newPending,
          status: newStatus,
          history: [...p.history, { 
            id: Date.now(), 
            date: paymentForm.date, 
            amount: amount, 
            method: paymentForm.method, 
            ref: paymentForm.ref 
          }]
        };
      }
      return p;
    });

    setPayments(updatedPayments);
    setShowModal(false);
    toast.success(`Payment of ₹${amount} recorded for ${selectedMember.name}`);
  };

  const filteredPayments = payments.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
      <ToastContainer />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track dues, record transactions, and generate invoices.</p>
        </div>
        <div className="relative w-full md:w-64">
           <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#f0fdf4] border border-green-100 p-5 rounded-3xl">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{payments.reduce((acc, curr) => acc + curr.paid, 0).toLocaleString()}</p>
         </div>
         <div className="bg-[#fffbeb] border border-yellow-100 p-5 rounded-3xl">
            <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider">Pending Dues</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{payments.reduce((acc, curr) => acc + curr.pending, 0).toLocaleString()}</p>
         </div>
         <div className="bg-[#eff6ff] border border-blue-100 p-5 rounded-3xl">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Transactions Today</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
         </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Member</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Plan Details</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">Paid / Total</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">Pending</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPayments.map((member) => {
               const today = new Date().toISOString().split('T')[0];
               const isOverdue = member.pending > 0 && member.dueDate < today && member.dueDate !== "-";
               
               return (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-400">ID: #{member.id.toString().padStart(4, '0')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{member.plan}</div>
                  <div className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    Due: {member.dueDate}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-green-600 font-bold">₹{member.paid}</span>
                  <span className="text-gray-400"> / ₹{member.price}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-bold ${member.pending > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    ₹{member.pending}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${member.pending === 0 ? 'bg-[#D9F17F] text-green-900 border-green-200' : isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#FEEF75] text-yellow-900 border-yellow-200'}`}>
                    {isOverdue ? 'Overdue' : member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {member.pending > 0 && (
                      <button 
                        onClick={() => handleRecordClick(member)}
                        className="px-3 py-1.5 bg-[#CDE7FE] text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                      >
                        Pay
                      </button>
                    )}
                    <button 
                      onClick={() => handleInvoiceClick(member)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      Invoice
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmitPayment} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Paying for</p>
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                   <span className="font-bold text-blue-900">{selectedMember.name}</span>
                   <span className="text-xs font-bold bg-white px-2 py-1 rounded text-red-500 border border-red-100">Pending: ₹{selectedMember.pending}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Amount</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                       <input 
                         type="number" 
                         required
                         max={selectedMember.pending}
                         value={paymentForm.amount}
                         onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                         className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 font-bold text-gray-800"
                         placeholder="0"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                    <input 
                       type="date" 
                       required
                       value={paymentForm.date}
                       onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                       className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                    />
                 </div>
              </div>

              <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Payment Method</label>
                 <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'UPI', 'Card'].map(m => (
                       <button
                         type="button"
                         key={m}
                         onClick={() => setPaymentForm({...paymentForm, method: m})}
                         className={`py-2 rounded-xl text-xs font-bold border transition-colors ${paymentForm.method === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                       >
                         {m}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Transaction Ref (Optional)</label>
                 <input 
                    type="text" 
                    value={paymentForm.ref}
                    onChange={(e) => setPaymentForm({...paymentForm, ref: e.target.value})}
                    placeholder="e.g. UPI Ref ID"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                 />
              </div>

              <button type="submit" className="w-full py-3 bg-[#FEEF75] text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 shadow-sm transition-colors">
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE MODAL --- */}
      {showInvoice && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-8">
                 <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900">INVOICE</h2>
                       <p className="text-sm text-gray-400">#INV-{Date.now().toString().slice(-6)}</p>
                    </div>
                    <div className="text-right w-[70%]">
                       <h3 className="font-bold text-lg text-red-600">Songar's GYM</h3>
                       <p className="text-xs text-gray-400">B-409,410 Shivalik Yash Complex, Shastrinagar Cross Road, 132 Feet Ring Rd, Naranpura, Ahmedabad, Gujarat 380013</p>
                    </div>
                 </div>

                 <div className="mb-8">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
                    <h4 className="font-bold text-gray-900">{selectedMember.name}</h4>
                    <p className="text-sm text-gray-500">Plan: {selectedMember.plan}</p>
                 </div>

                 <table className="w-full mb-8">
                    <thead className="bg-gray-50">
                       <tr>
                          <th className="text-left py-2 px-3 text-xs font-bold text-gray-500">Description</th>
                          <th className="text-right py-2 px-3 text-xs font-bold text-gray-500">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       <tr>
                          <td className="py-3 px-3 text-gray-800">Total Plan Fee</td>
                          <td className="text-right py-3 px-3 font-medium">₹{selectedMember.price}</td>
                       </tr>
                       <tr>
                          <td className="py-3 px-3 text-gray-800">Total Paid</td>
                          <td className="text-right py-3 px-3 text-green-600 font-bold">- ₹{selectedMember.paid}</td>
                       </tr>
                       <tr className="border-t border-gray-100">
                          <td className="py-3 px-3 font-bold text-gray-900">Balance Due</td>
                          <td className="text-right py-3 px-3 font-bold text-red-500">₹{selectedMember.pending}</td>
                       </tr>
                    </tbody>
                 </table>

                 <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs font-bold text-gray-500 mb-2">Payment History</p>
                    {selectedMember.history.length > 0 ? selectedMember.history.map(h => (
                       <div key={h.id} className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{h.date} ({h.method})</span>
                          <span>₹{h.amount}</span>
                       </div>
                    )) : <p className="text-xs text-gray-400 italic">No payments recorded.</p>}
                 </div>

                 <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800">
                       Print Receipt
                    </button>
                    <button onClick={() => setShowInvoice(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">
                       Close
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default MemberPayments;