import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Updated Toast
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from "../../context/ThemeContext"; // Import Context

const Payment = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme(); // Consume Theme

   const plan = location.state?.plan;

   // --- STATE ---
   const [payMethod, setPayMethod] = useState("UPI");
   const [isProcessing, setIsProcessing] = useState(false);
   const [paymentHistory, setPaymentHistory] = useState([]);
   const [lastTransaction, setLastTransaction] = useState(null);

   // --- STYLE INJECTION ---
   useEffect(() => {
      // Only injecting FA
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      return () => {
         document.head.removeChild(linkFA);
      };
   }, []);

   // --- LOGIC: REDIRECT IF NO PLAN ---
   useEffect(() => {
      if (!plan) {
         toast.error("No plan selected");
         navigate("/member/plans");
      }
   }, [plan, navigate]);

   // --- LOGIC: FETCH HISTORY ---
   useEffect(() => {
      const fetchPayments = async () => {
         try {
            const res = await api.get("/payments/my");
            setPaymentHistory(res.data);
         } catch (error) {
            console.error("Error fetching payments:", error);
         }
      };

      fetchPayments();
   }, []);

   // --- LOGIC: HANDLE PAYMENT ---
   const handlePayment = async (e) => {
      e.preventDefault();

      if (!plan?._id) {
         toast.error("Invalid plan");
         return;
      }

      try {
         setIsProcessing(true);

         const res = await api.post("/payments", {
            planId: plan._id,
            method: payMethod,
         });

         toast.success("Payment successful. Membership activated!");

         const newPayment = res.data.payment;
         setPaymentHistory((prev) => [newPayment, ...prev]);
         setLastTransaction(newPayment);

         setTimeout(() => {
            navigate("/member/profile");
         }, 1500);

      } catch (error) {
         console.error(error);
         toast.error(error.response?.data?.message || "Payment failed");
      } finally {
         setIsProcessing(false);
      }
   };

   // --- HELPERS ---
   const getStatusColor = (status) => {
      switch (status) {
         case "Approved": case "Completed": case "Success": return "bg-[#D9F17F] text-green-900 border-green-200";
         case "Pending": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
         case "Failed": return "bg-red-50 text-red-600 border-red-200";
         default: return "bg-gray-50 text-gray-600";
      }
   };

   const downloadReceipt = (txnId) => {
      toast("Receipt download started...", { icon: '🧾' });
   };

   if (!plan) return null;

   return (
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-6">

         {/* --- HEADER --- */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black" style={{ color: colors.text }}>Complete Payment</h1>
               <p className="mt-1" style={{ color: colors.textMuted }}>Full payment required to activate your membership.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: SUMMARY & FORM */}
            <div className="lg:col-span-2 space-y-6">

               {/* Payment Summary Card */}
               <div className="rounded-[2.5rem] p-8 border shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[80px] opacity-20"></div>

                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>Selected Plan</p>
                           <h2 className="text-2xl font-black" style={{ color: colors.text }}>{plan.name}</h2>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>Amount Due</p>
                           <p className="text-xl font-bold" style={{ color: colors.text }}>₹{plan.price.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Payment Form */}
               <div className="rounded-[2.5rem] p-8 border shadow-sm"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                     <i className="fa-solid fa-credit-card text-[#CDE7FE]"></i> Pay Now
                  </h3>

                  <form onSubmit={handlePayment} className="space-y-6">
                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Payment Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: colors.textMuted }}>₹</span>
                           <input
                              type="number"
                              value={plan.price}
                              disabled
                              className="w-full pl-8 pr-4 py-3 rounded-xl border-transparent cursor-not-allowed font-black text-xl"
                              style={{ 
                                 backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                 color: colors.textMuted 
                              }}
                           />
                           <p className="text-xs mt-2 italic" style={{ color: colors.textMuted }}>* Full payment only</p>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold mb-2 uppercase" style={{ color: colors.textMuted }}>Payment Method</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                           {['UPI', 'Card', 'Net Banking', 'Cash'].map(method => (
                              <button
                                 key={method}
                                 type="button"
                                 onClick={() => setPayMethod(method)}
                                 className={`py-3 rounded-xl text-xs font-bold border transition-all ${payMethod === method ? 'shadow-lg transform scale-105' : 'hover:opacity-80'}`}
                                 style={{ 
                                    backgroundColor: payMethod === method ? (theme === 'dark' ? '#fff' : '#111') : colors.background,
                                    color: payMethod === method ? (theme === 'dark' ? '#000' : '#fff') : colors.text,
                                    borderColor: colors.border
                                 }}
                              >
                                 {method}
                              </button>
                           ))}
                        </div>
                     </div>

                     <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 bg-[#D9F17F] text-green-900 rounded-xl font-bold text-lg hover:bg-green-300 transition-colors shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2"
                     >
                        {isProcessing ? (
                           <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                        ) : (
                           <>Pay ₹{plan.price} <i className="fa-solid fa-arrow-right"></i></>
                        )}
                     </button>
                  </form>
               </div>

            </div>

            {/* RIGHT COLUMN: HISTORY & INFO */}
            <div className="space-y-6">

               {/* Last Transaction Status */}
               {lastTransaction && (
                  <div className="rounded-3xl p-6 border shadow-sm animate-fade-in"
                       style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                     <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: colors.text }}>Status</h3>
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getStatusColor(lastTransaction.status)}`}>
                           <i className={`fa-solid ${lastTransaction.status === 'Approved' || lastTransaction.status === 'Success' ? 'fa-check' : 'fa-clock'}`}></i>
                        </div>
                        <div>
                           <p className="font-bold" style={{ color: colors.text }}>₹{lastTransaction.amount}</p>
                           <p className="text-xs" style={{ color: colors.textMuted }}>{lastTransaction.status} • {lastTransaction.method}</p>
                        </div>
                     </div>
                  </div>
               )}

               {/* Payment History */}
               <div className="rounded-3xl p-6 border shadow-sm"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: colors.text }}>Payment History</h3>
                  
                  {paymentHistory.length === 0 ? (
                     <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>No payments found</p>
                  ) : (
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {paymentHistory.map((txn) => (
                           <div key={txn._id || txn.id} className="flex flex-col p-3 rounded-xl border transition-colors"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <p className="text-sm font-bold" style={{ color: colors.text }}>
                                       {txn.plan?.name || "Membership Plan"}
                                    </p>
                                    <p className="text-xs" style={{ color: colors.textMuted }}>
                                       {new Date(txn.paidAt || txn.date).toLocaleDateString()} • {txn.method}
                                    </p>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(txn.status)}`}>
                                    {txn.status}
                                 </span>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2 mt-1" style={{ borderColor: colors.border }}>
                                 <p className="font-bold" style={{ color: colors.text }}>₹{txn.amount}</p>
                                 {(txn.status === 'Approved' || txn.status === 'Success') && (
                                    <button
                                       onClick={() => downloadReceipt(txn._id || txn.id)}
                                       className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                       <i className="fa-solid fa-download"></i> Receipt
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Help */}
               <div className="rounded-3xl p-6 border"
                    style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fffbeb', borderColor: theme === 'dark' ? '#374151' : '#FEEF75' }}>
                  <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: theme === 'dark' ? '#FEEF75' : '#713f12' }}>
                     <i className="fa-solid fa-circle-question"></i> Need Help?
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: theme === 'dark' ? '#d1d5db' : '#854d0e' }}>
                     Issues with payment? Contact admin support or visit the front desk.
                  </p>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
                          style={{ 
                             backgroundColor: colors.card, 
                             color: colors.text,
                             borderColor: colors.border
                          }}>
                     Contact Support
                  </button>
               </div>

            </div>

         </div>
      </div>
   );
};

export default Payment;