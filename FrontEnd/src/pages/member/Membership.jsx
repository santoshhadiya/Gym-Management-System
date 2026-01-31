import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Context
import toast from 'react-hot-toast'; // React Hot Toast

const Membership = () => {
   const { api } = useGlobalContext();
   const { colors, theme } = useTheme(); // Consume Theme
   const navigate = useNavigate();

   // --- STATES ---
   const [member, setMember] = useState(null);
   const [payments, setPayments] = useState([]);
   const [plans, setPlans] = useState([]);
   const [loading, setLoading] = useState(true);

   // --- FETCH DATA ---
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [memberRes, paymentRes, planRes] = await Promise.all([
               api.get("/members/profile"),
               api.get("/payments/my"),
               api.get("/plans"),
            ]);

            setMember(memberRes.data);
            setPayments(paymentRes.data);
            setPlans(planRes.data);
         } catch (error) {
            console.error(error);
            toast.error("Failed to load membership data");
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   // --- CALCULATIONS ---
   const currentPlan = member?.plan;
   const startDate = member?.startDate ? new Date(member.startDate) : null;
   const expiryDate = member?.expiryDate ? new Date(member.expiryDate) : null;
   const totalDays = currentPlan?.durationInDays || 365;

   const daysRemaining = expiryDate
      ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

   const planPrice = currentPlan?.price || 0;
   const amountPaid = payments
      .filter(p => p.status === 'Approved' || p.status === 'Success')
      .reduce((acc, curr) => acc + curr.amount, 0);
   const pendingAmount = Math.max(0, planPrice - amountPaid);
   const lastPaymentDate = payments.length > 0 ? new Date(payments[0].paidAt).toLocaleDateString() : "N/A";

   const calculateProgress = () => {
      if (!startDate || !expiryDate) return 0;
      const totalDuration = expiryDate.getTime() - startDate.getTime();
      const timeElapsed = Date.now() - startDate.getTime();
      const percent = (timeElapsed / totalDuration) * 100;
      return Math.min(Math.max(percent, 0), 100);
   };
  
   const getStatusLabel = () => {
      if (!currentPlan) return "Inactive";
      if (daysRemaining <= 0) return "Expired";
      if (daysRemaining <= 30) return "Expiring Soon";
      return "Active";
   };

   // --- HANDLERS ---
   const handleUpgrade = (plan) => {
      navigate("/member/payment", { state: { plan } });
   };

   const handleDownloadReceipt = () => toast.success("Receipt download coming soon");
   const handleRenewalRequest = () => toast.success("Renewal request sent to Admin!");

   if (loading) {
      return (
         <div className="w-full h-screen flex items-center justify-center" style={{ color: colors.textMuted }}>
            <div className="text-center">
               <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4" style={{ color: colors.secondary }}></i>
               <p className="font-bold">Loading Membership...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-6 lg:px-8">

         {/* --- HEADER --- */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>My Membership</h1>
               <p className="text-sm md:text-base mt-1" style={{ color: colors.textMuted }}>Manage your plan, payments, and renewals.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button 
                  onClick={handleDownloadReceipt}
                  className="flex-1 md:flex-none justify-center px-5 py-2.5 border rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                  style={{ 
                     backgroundColor: colors.card, 
                     borderColor: colors.border, 
                     color: colors.textMuted 
                  }}
               >
                  <i className="fa-solid fa-file-invoice"></i> Receipt
               </button>
               <button 
                  onClick={handleRenewalRequest}
                  className="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                  style={{ 
                     backgroundColor: colors.secondary, 
                     color: theme === 'dark' ? '#fff' : '#1e3a8a' 
                  }}
               >
                  <i className="fa-solid fa-rotate"></i> Request Renewal
               </button>
            </div>
         </div>

         {/* --- MAIN MEMBERSHIP CARD --- */}
         {/* Kept dark gradient always for consistency, updated text colors */}
         <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9F17F] rounded-full filter blur-[120px] opacity-10 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusLabel() === 'Active' ? 'bg-[#D9F17F] text-green-900' : 'bg-red-500 text-white'}`}>
                        {getStatusLabel()}
                     </span>
                     <span className="text-gray-400 text-sm font-mono">#{member?._id?.slice(-6) || "NA"}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-2">{currentPlan?.name || "No Active Plan"}</h2>
                  <p className="text-gray-300 text-base md:text-lg">{currentPlan ? `${totalDays} Days Plan` : "Please select a plan"}</p>
                  
                  <div className="mt-8 flex flex-wrap gap-8">
                     <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                        <p className="font-bold text-lg">{startDate?.toLocaleDateString() || "-"}</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expiry Date</p>
                        <p className="font-bold text-lg text-[#FEEF75]">{expiryDate?.toLocaleDateString() || "-"}</p>
                     </div>
                  </div>
               </div>

               {currentPlan && (
                  <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col justify-center">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-gray-200">Validity</span>
                        <span className="text-2xl font-black text-[#D9F17F]">{daysRemaining} <span className="text-sm text-white font-normal">Days Left</span></span>
                     </div>
                     <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 ${daysRemaining <= 30 ? 'bg-red-500' : 'bg-[#D9F17F]'}`} 
                           style={{ width: `${100 - calculateProgress()}%` }}
                        ></div>
                     </div>
                     <p className="text-xs text-gray-400 mt-3 text-center">
                        Plan expires on {expiryDate?.toLocaleDateString()}.
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* --- DETAILS GRID --- */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Payment Summary */}
            <div 
               className="rounded-3xl p-6 md:p-8 border shadow-sm transition-colors"
               style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                  <i className="fa-solid fa-file-invoice-dollar text-[#CDE7FE] text-xl"></i> Payment Summary
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb' }}>
                     <span className="text-sm" style={{ color: colors.textMuted }}>Plan Price</span>
                     <span className="font-bold" style={{ color: colors.text }}>₹{planPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-green-900/20 bg-green-50 dark:bg-green-900/20">
                     <span className="text-sm text-green-800 dark:text-green-400">Amount Paid</span>
                     <span className="font-bold text-green-900 dark:text-green-300">₹{amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-red-900/20 bg-red-50 dark:bg-red-900/20">
                     <span className="text-sm text-red-800 dark:text-red-400">Pending Dues</span>
                     <span className="font-bold text-red-600 dark:text-red-400">₹{pendingAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-right mt-2" style={{ color: colors.textMuted }}>Last Payment: {lastPaymentDate}</p>
               </div>
            </div>

            {/* Plan Benefits */}
            <div 
               className="rounded-3xl p-6 md:p-8 border shadow-sm transition-colors"
               style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                  <i className="fa-solid fa-star text-[#FEEF75] text-xl"></i> Plan Benefits
               </h3>
               <ul className="space-y-3">
                  {currentPlan?.benefits ? (
                     currentPlan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-check text-green-500 mt-0.5 shrink-0"></i>
                           <span>{benefit}</span>
                        </li>
                     ))
                  ) : (
                     <p className="text-sm" style={{ color: colors.textMuted }}>No specific benefits listed.</p>
                  )}
               </ul>
            </div>
         </div>

         {/* --- UPGRADE OPTIONS --- */}
         <div 
            className="rounded-[2.5rem] p-6 md:p-8 border"
            style={{ 
               backgroundColor: theme === 'dark' ? '#111827' : '#f8fbff', 
               borderColor: theme === 'dark' ? '#374151' : '#dbeafe' 
            }}
         >
            <div className="text-center mb-8">
               <h3 className="text-xl md:text-2xl font-black" style={{ color: colors.text }}>Upgrade Your Experience</h3>
               <p className="text-sm md:text-base" style={{ color: colors.textMuted }}>Switch to a premium plan for exclusive features.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {plans.filter(p => !currentPlan || p._id !== currentPlan._id).map((p) => (
                  <div 
                     key={p._id} 
                     className="p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4"
                     style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  >
                     <div>
                        <h4 className="font-bold text-lg" style={{ color: colors.text }}>{p.name}</h4>
                        <p className="text-sm mb-2" style={{ color: colors.textMuted }}>{p.description || `${p.durationInDays} days validity`}</p>
                        <p className="font-black text-blue-600 dark:text-blue-400">₹{p.price.toLocaleString()}</p>
                     </div>
                     <button 
                        onClick={() => handleUpgrade(p)}
                        className="px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
                        style={{ backgroundColor: colors.text, color: colors.background }} // Inverts text/bg for button
                     >
                        Upgrade
                     </button>
                  </div>
               ))}
               {plans.length === 0 && (
                  <p className="text-center col-span-2" style={{ color: colors.textMuted }}>No upgrade plans available.</p>
               )}
            </div>
         </div>

         {/* --- FOOTER --- */}
         <div className="text-center text-xs mt-8 px-4" style={{ color: colors.textMuted }}>
            <p className="mb-2">
               <span className="font-bold">Terms & Conditions:</span> Membership is non-transferable and non-refundable.
            </p>
         </div>
      </div>
   );
};

export default Membership;