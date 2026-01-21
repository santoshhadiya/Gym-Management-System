import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';


const Membership = () => {
   const {api}=useGlobalContext()
  const navigate = useNavigate();

  // --- STATES (Backend Driven) ---
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate loading time for effect
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

  // --- DERIVED DATA CALCULATIONS ---
  const currentPlan = member?.plan;
  const startDate = member?.startDate ? new Date(member.startDate) : null;
  const expiryDate = member?.expiryDate ? new Date(member.expiryDate) : null;
  const totalDays = currentPlan?.durationInDays || 365;

  // Calculate Days Remaining
  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Calculate Financials
  const planPrice = currentPlan?.price || 0;
  const amountPaid = payments
    .filter(p => p.status === 'Approved' || p.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = Math.max(0, planPrice - amountPaid);
  const lastPaymentDate = payments.length > 0 ? new Date(payments[0].paidAt).toLocaleDateString() : "N/A";

  // Calculate Progress Bar
  const calculateProgress = () => {
    if (!startDate || !expiryDate) return 0;
    const totalDuration = expiryDate.getTime() - startDate.getTime();
    const timeElapsed = Date.now() - startDate.getTime();
    const percent = (timeElapsed / totalDuration) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };
  
  // Status Logic
  const getStatusLabel = () => {
    if (!currentPlan) return "Inactive";
    if (daysRemaining <= 0) return "Expired";
    if (daysRemaining <= 30) return "Expiring Soon";
    return "Active";
  };

  const getStatusColor = () => {
    const status = getStatusLabel();
    if (status === "Expired") return "bg-red-50 text-red-600 border-red-200";
    if (status === "Expiring Soon") return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
    return "bg-[#D9F17F] text-green-900 border-green-200";
  };

  // --- HANDLERS ---
  const handleUpgrade = (plan) => {
    navigate("/member/payment", { state: { plan } });
  };

  const handleDownloadReceipt = () => {
    toast.info("Receipt download coming soon");
  };

  const handleRenewalRequest = () => {
    toast.success("Renewal request sent to Admin!");
  };

  if (loading) {
     return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
           <div className="text-center">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#CDE7FE] mb-4"></i>
              <p className="text-gray-500 font-bold">Loading Membership...</p>
           </div>
        </div>
     );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Membership</h1>
          <p className="text-gray-500 mt-1">Manage your plan, payments, and renewals.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleDownloadReceipt}
             className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
           >
             <i className="fa-solid fa-file-invoice"></i> Receipt
           </button>
           <button 
             onClick={handleRenewalRequest}
             className="px-5 py-2.5 bg-[#CDE7FE] text-blue-900 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors shadow-sm flex items-center gap-2"
           >
             <i className="fa-solid fa-rotate"></i> Request Renewal
           </button>
        </div>
      </div>

      {/* --- MAIN MEMBERSHIP CARD --- */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9F17F] rounded-full filter blur-[120px] opacity-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
          
          {/* Plan Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()}`}>
                  {getStatusLabel()}
               </span>
               <span className="text-gray-400 text-sm font-mono">#{member?._id || "NA"}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-2">{currentPlan?.name || "No Active Plan"}</h2>
            <p className="text-gray-300 text-lg">{currentPlan ? `${totalDays} Days Plan` : "Please select a plan"}</p>
            
            <div className="mt-8 flex gap-8">
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

          {/* Validity Tracker */}
          {currentPlan && (
            <div className="md:w-1/3 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col justify-center">
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
                  Your plan expires on {expiryDate?.toLocaleDateString()}. <br/>
                  <span className="text-white underline cursor-pointer" onClick={handleRenewalRequest}>Renew now</span> to avoid interruption.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAILS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Payment Summary */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
               <i className="fa-solid fa-file-invoice-dollar text-[#CDE7FE] text-xl"></i> Payment Summary
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Plan Price</span>
                  <span className="font-bold text-gray-900">₹{planPrice.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-sm text-green-800">Amount Paid</span>
                  <span className="font-bold text-green-900">₹{amountPaid.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-sm text-red-800">Pending Dues</span>
                  <span className="font-bold text-red-600">₹{pendingAmount.toLocaleString()}</span>
               </div>
               <p className="text-xs text-gray-400 text-right mt-2">Last Payment: {lastPaymentDate}</p>
            </div>
         </div>

         {/* Plan Benefits */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
               <i className="fa-solid fa-star text-[#FEEF75] text-xl"></i> Plan Benefits
            </h3>
            <ul className="space-y-3">
               {currentPlan?.benefits ? (
                  currentPlan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                        <i className="fa-solid fa-check text-green-500 mt-0.5"></i>
                        <span>{benefit}</span>
                    </li>
                  ))
               ) : (
                  <p className="text-gray-400 text-sm">No specific benefits listed for this plan.</p>
               )}
            </ul>
         </div>

      </div>

      {/* --- UPGRADE OPTIONS (Dynamic from API) --- */}
      <div className="bg-[#f8fbff] rounded-[2.5rem] p-8 border border-[#CDE7FE]/30">
         <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-gray-900">Upgrade Your Experience</h3>
            <p className="text-gray-500">Switch to a premium plan for exclusive features.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans
              .filter(p => !currentPlan || p._id !== currentPlan._id)
              .map((p) => (
               <div key={p._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
                  <div>
                     <h4 className="font-bold text-gray-900 text-lg">{p.name}</h4>
                     <p className="text-sm text-gray-500 mb-2">{p.description || `${p.durationInDays} days validity`}</p>
                     <p className="font-black text-blue-600">₹{p.price.toLocaleString()}</p>
                  </div>
                  <button 
                     onClick={() => handleUpgrade(p)}
                     className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                  >
                     Upgrade
                  </button>
               </div>
            ))}
            {plans.length === 0 && (
               <p className="text-center text-gray-400 col-span-2">No upgrade plans available at the moment.</p>
            )}
         </div>
      </div>

      {/* --- FOOTER: TERMS --- */}
      <div className="text-center text-xs text-gray-400 mt-8 px-4">
         <p className="mb-2">
            <span className="font-bold">Terms & Conditions:</span> Membership is non-transferable and non-refundable. 
            Renewal must be completed before the expiry date to avoid re-joining fees.
         </p>
         <div className="flex justify-center gap-4 underline">
            <a href="#" className="hover:text-gray-600">Refund Policy</a>
            <a href="#" className="hover:text-gray-600">Gym Rules</a>
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
         </div>
      </div>

    </div>
  );
};

export default Membership;