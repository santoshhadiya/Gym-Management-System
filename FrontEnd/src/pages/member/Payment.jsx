import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Payment = () => {
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
  const [memberDetails, setMemberDetails] = useState({
    plan: "Yearly Elite Membership",
    price: 12000,
    paid: 8000,
    pending: 4000,
    dueDate: "2024-10-30",
    status: "Active",
    expiryDate: "2025-01-15"
  });

  const [paymentHistory, setPaymentHistory] = useState([
    { id: "TXN-8821", date: "2024-01-15", amount: 5000, method: "UPI", status: "Approved" },
    { id: "TXN-9942", date: "2024-06-10", amount: 3000, method: "Card", status: "Approved" },
    { id: "TXN-1102", date: "2024-09-01", amount: 4000, method: "Net Banking", status: "Pending" },
  ]);

  // --- STATE ---
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-[#D9F17F] text-green-900 border-green-200";
      case "Pending": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
      case "Failed": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const calculateProgress = () => {
    return (memberDetails.paid / memberDetails.price) * 100;
  };

  // --- ACTIONS ---
  const handlePayment = (e) => {
    e.preventDefault();
    
    if (!payAmount || payAmount <= 0) {
      toast.warn("Please enter a valid amount.");
      return;
    }
    if (payAmount > memberDetails.pending) {
      toast.error(`Amount cannot exceed pending dues (₹${memberDetails.pending})`);
      return;
    }

    setIsProcessing(true);

    // Simulate Gateway Processing
    setTimeout(() => {
      const newTxn = {
        id: `TXN-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        amount: parseInt(payAmount),
        method: payMethod,
        status: "Pending" // Payments usually go to pending verification first
      };

      setPaymentHistory([newTxn, ...paymentHistory]);
      setLastTransaction(newTxn);
      setMemberDetails(prev => ({
         ...prev,
         // Note: In real app, 'paid' and 'pending' update after Admin approval
         // For UI feedback here, we show the transaction in history
      }));

      setIsProcessing(false);
      setPayAmount("");
      toast.success("Payment submitted successfully! Waiting for approval.");
    }, 2000);
  };

  const downloadReceipt = (txnId) => {
    toast.info(`Downloading Receipt for ${txnId}...`);
    // Mock download logic
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Make Payment</h1>
          <p className="text-gray-500 mt-1">Clear your dues or renew your membership securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SUMMARY & FORM */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Payment Summary Card */}
           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[80px] opacity-20"></div>
              
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Plan</p>
                       <h2 className="text-2xl font-black text-gray-900">{memberDetails.plan}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Price</p>
                       <p className="text-xl font-bold text-gray-900">₹{memberDetails.price.toLocaleString()}</p>
                    </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-bold text-green-600">Paid: ₹{memberDetails.paid.toLocaleString()}</span>
                       <span className={`font-bold ${memberDetails.pending > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {memberDetails.pending > 0 ? `Pending: ₹${memberDetails.pending.toLocaleString()}` : 'Fully Paid'}
                       </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                       <div 
                          className="h-full bg-gradient-to-r from-green-400 to-[#D9F17F] rounded-full transition-all duration-1000" 
                          style={{ width: `${calculateProgress()}%` }}
                       ></div>
                    </div>
                 </div>

                 {memberDetails.pending > 0 ? (
                    <div className="flex items-center gap-3 bg-[#FEEF75]/20 p-3 rounded-xl border border-[#FEEF75]">
                       <div className="w-8 h-8 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-900 shrink-0">
                          <i className="fa-solid fa-clock"></i>
                       </div>
                       <p className="text-sm text-yellow-900 font-medium">
                          Payment Due Date: <span className="font-bold">{memberDetails.dueDate}</span>
                       </p>
                    </div>
                 ) : (
                    <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
                       <div className="w-8 h-8 rounded-full bg-[#D9F17F] flex items-center justify-center text-green-900 shrink-0">
                          <i className="fa-solid fa-check"></i>
                       </div>
                       <p className="text-sm text-green-800 font-medium">
                          No pending dues! Your plan expires on <span className="font-bold">{memberDetails.expiryDate}</span>.
                       </p>
                    </div>
                 )}
              </div>
           </div>

           {/* Payment Form */}
           {memberDetails.pending > 0 ? (
             <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <i className="fa-solid fa-credit-card text-[#CDE7FE]"></i> Pay Now
                </h3>
                
                <form onSubmit={handlePayment} className="space-y-6">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Amount to Pay</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                         <input 
                            type="number" 
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            max={memberDetails.pending}
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all font-black text-xl text-gray-900"
                            placeholder="0"
                         />
                         <button 
                            type="button"
                            onClick={() => setPayAmount(memberDetails.pending)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#CDE7FE] text-blue-900 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                         >
                            Pay Full
                         </button>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Payment Method</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {['UPI', 'Card', 'Net Banking', 'Cash'].map(method => (
                            <button
                               key={method}
                               type="button"
                               onClick={() => setPayMethod(method)}
                               className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                                  payMethod === method 
                                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105' 
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                               }`}
                            >
                               {method}
                            </button>
                         ))}
                      </div>
                      {payMethod === 'Cash' && (
                         <p className="text-xs text-orange-500 mt-2 italic">
                            * For Cash payments, please visit the gym desk. This will create a pending request.
                         </p>
                      )}
                   </div>

                   <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#D9F17F] text-green-900 rounded-xl font-bold text-lg hover:bg-green-300 transition-colors shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2"
                   >
                      {isProcessing ? (
                         <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                      ) : (
                         <>Pay ₹{payAmount || '0'} <i className="fa-solid fa-arrow-right"></i></>
                      )}
                   </button>
                </form>
             </div>
           ) : (
             <div className="bg-[#f8fbff] rounded-[2.5rem] p-8 border border-blue-100 text-center">
                <div className="w-20 h-20 bg-[#CDE7FE] rounded-full flex items-center justify-center text-blue-900 text-4xl mx-auto mb-4 shadow-sm">
                   <i className="fa-solid fa-shield-heart"></i>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Membership is Active</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">You have cleared all your dues. Enjoy your workouts!</p>
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                   View Membership Details
                </button>
             </div>
           )}

        </div>

        {/* RIGHT COLUMN: HISTORY & INFO */}
        <div className="space-y-6">
           
           {/* Last Transaction Status (if any) */}
           {lastTransaction && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in">
                 <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Transaction Status</h3>
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${lastTransaction.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                       <i className={`fa-solid ${lastTransaction.status === 'Approved' ? 'fa-check' : 'fa-clock'}`}></i>
                    </div>
                    <div>
                       <p className="font-bold text-gray-900">₹{lastTransaction.amount}</p>
                       <p className="text-xs text-gray-500">{lastTransaction.status} • {lastTransaction.method}</p>
                    </div>
                 </div>
                 <p className="text-xs text-gray-400 mt-3 pl-16">Ref: {lastTransaction.id}</p>
              </div>
           )}

           {/* Payment History */}
           <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Recent Transactions</h3>
              <div className="space-y-4">
                 {paymentHistory.map((txn) => (
                    <div key={txn.id} className="flex flex-col p-3 rounded-xl border border-gray-100 hover:border-[#CDE7FE] transition-colors bg-gray-50">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                             <p className="text-sm font-bold text-gray-900">{txn.date}</p>
                             <p className="text-xs text-gray-500">{txn.method}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(txn.status)}`}>
                             {txn.status}
                          </span>
                       </div>
                       <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                          <p className="font-bold text-gray-800">₹{txn.amount.toLocaleString()}</p>
                          {txn.status === 'Approved' && (
                             <button 
                                onClick={() => downloadReceipt(txn.id)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                             >
                                <i className="fa-solid fa-download"></i> Receipt
                             </button>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Help */}
           <div className="bg-[#fffbeb] rounded-3xl p-6 border border-[#FEEF75]">
              <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                 <i className="fa-solid fa-circle-question"></i> Need Help?
              </h3>
              <p className="text-xs text-yellow-800 leading-relaxed mb-3">
                 Issues with payment? Contact admin support or visit the front desk.
              </p>
              <button className="text-xs font-bold bg-white text-yellow-900 px-3 py-1.5 rounded-lg border border-yellow-200 hover:bg-yellow-50">
                 Contact Support
              </button>
           </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;