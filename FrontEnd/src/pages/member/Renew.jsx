import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const Renew = () => {
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
  const currentPlan = {
    name: "Yearly Elite",
    expiryDate: "2025-01-15",
    daysLeft: 10,
    status: "Expiring Soon",
    price: 12000
  };

  const renewalOptions = [
    {
      id: 1,
      name: "Yearly Elite (Renewal)",
      duration: "12 Months",
      price: 12000,
      discount: "10% Loyalty Off",
      finalPrice: 10800,
      features: ["Continue current benefits", "No re-joining fee", "2 Free PT Sessions"],
      recommended: true,
      color: "bg-[#D9F17F]",
      btnColor: "bg-green-900 text-[#D9F17F]"
    },
    {
      id: 2,
      name: "Lifetime Platinum (Upgrade)",
      duration: "Lifetime",
      price: 25000,
      discount: "Limited Offer",
      finalPrice: 22000,
      features: ["Lifetime Access", "All Locations", "Priority Support"],
      recommended: false,
      color: "bg-[#CDE7FE]",
      btnColor: "bg-blue-900 text-[#CDE7FE]"
    },
    {
      id: 3,
      name: "Quarterly Pro (Downgrade)",
      duration: "3 Months",
      price: 4000,
      discount: null,
      finalPrice: 4000,
      features: ["Standard Access", "Group Classes"],
      recommended: false,
      color: "bg-[#FEEF75]",
      btnColor: "bg-yellow-900 text-[#FEEF75]"
    }
  ];

  // --- STATE ---
  const [selectedPlanId, setSelectedPlanId] = useState(1); // Default to current renewal
  const [renewalStatus, setRenewalStatus] = useState("Idle"); // Idle, Requested, PaymentPending, Active

  const selectedOption = renewalOptions.find(o => o.id === selectedPlanId);

  // --- ACTIONS ---
  const handleRequestRenewal = () => {
    if (!selectedOption) return;
    
    // Simulate API call
    toast.info("Sending renewal request...");
    setTimeout(() => {
      setRenewalStatus("PaymentPending");
      toast.success("Request Approved! Please proceed to payment.");
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Renew Membership</h1>
          <p className="text-gray-500 mt-1">Don't lose your streak! Extend your plan today.</p>
        </div>
      </div>

      {/* --- CURRENT STATUS CARD --- */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full filter blur-[80px] opacity-50"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-3xl">
                  <i className="fa-solid fa-hourglass-half"></i>
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Plan</p>
                  <h2 className="text-2xl font-black text-gray-900">{currentPlan.name}</h2>
                  <p className="text-sm font-medium text-red-500 mt-1">
                     Expires on {currentPlan.expiryDate} ({currentPlan.daysLeft} days left)
                  </p>
               </div>
            </div>

            {renewalStatus === "Idle" && (
               <div className="text-center md:text-right">
                  <p className="text-sm text-gray-500 mb-2">Status: <span className="font-bold text-gray-800">{currentPlan.status}</span></p>
                  <div className="w-full md:w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-red-500 w-[90%]"></div>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* --- RENEWAL WORKFLOW --- */}
      {renewalStatus === "PaymentPending" ? (
         <div className="bg-[#f0fdf4] rounded-[2.5rem] p-10 border border-green-200 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl mx-auto mb-6">
               <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="text-2xl font-black text-green-900 mb-2">Request Approved!</h2>
            <p className="text-green-700 max-w-md mx-auto mb-8">
               Your request to renew <strong>{selectedOption.name}</strong> for <strong>₹{selectedOption.finalPrice.toLocaleString()}</strong> has been approved. Please complete the payment to activate.
            </p>
            <Link to="/member/payment">
               <button className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-600/30 transform hover:-translate-y-1">
                  Proceed to Payment <i className="fa-solid fa-arrow-right ml-2"></i>
               </button>
            </Link>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renewalOptions.map((option) => (
               <div 
                  key={option.id}
                  onClick={() => setSelectedPlanId(option.id)}
                  className={`relative p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col ${
                     selectedPlanId === option.id 
                     ? `${option.color} border-transparent scale-[1.02]` 
                     : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
               >
                  {option.recommended && (
                     <span className="absolute top-6 right-6 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Best Value
                     </span>
                  )}

                  <div className="mb-4">
                     <h3 className="text-lg font-black text-gray-900 leading-tight">{option.name}</h3>
                     <p className="text-sm opacity-70 font-medium">{option.duration}</p>
                  </div>

                  <div className="mb-6">
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-900">₹{option.finalPrice.toLocaleString()}</span>
                        {option.discount && (
                           <span className="text-sm line-through opacity-50 font-bold">₹{option.price}</span>
                        )}
                     </div>
                     {option.discount && (
                        <p className="text-xs font-bold text-red-600 mt-1">{option.discount}</p>
                     )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                     {option.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm opacity-80">
                           <i className="fa-solid fa-circle-check mt-1 text-xs"></i> {feat}
                        </li>
                     ))}
                  </ul>

                  <button 
                     onClick={(e) => { e.stopPropagation(); handleRequestRenewal(); }}
                     className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                        selectedPlanId === option.id ? option.btnColor : 'bg-gray-100 text-gray-500'
                     }`}
                  >
                     {selectedPlanId === option.id ? "Request Renewal" : "Select Plan"}
                  </button>
               </div>
            ))}
         </div>
      )}

      {/* --- INFO SECTION --- */}
      <div className="bg-gray-50 rounded-[2rem] p-6 text-center">
         <h3 className="text-sm font-bold text-gray-900 mb-2">Why Renew Early?</h3>
         <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            Renewing before your plan expires ensures you keep your locker slot, loyalty points, and avoid any re-joining administration fees.
         </p>
      </div>

    </div>
  );
};

export default Renew;