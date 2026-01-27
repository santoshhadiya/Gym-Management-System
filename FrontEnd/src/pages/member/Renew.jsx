import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalContext';


const Renew = () => {
   const {BACKEND_URL}=useGlobalContext()
  const navigate = useNavigate();
  
  // --- STATE ---
  const [currentPlan, setCurrentPlan] = useState(null);
  const [renewalOptions, setRenewalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

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
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        // 1. Get Current Member Profile
        const memberRes = await fetch(`${BACKEND_URL}/api/members/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!memberRes.ok) throw new Error("Failed to load profile");
        const memberData = await memberRes.json();
        
        // Calculate Days Left
        if (memberData.expiryDate) {
           const expiry = new Date(memberData.expiryDate);
           const today = new Date();
           const diffTime = expiry - today;
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
           setDaysLeft(diffDays > 0 ? diffDays : 0);
        }

        const currentPlanDetails = memberData.plan ? {
           ...memberData.plan,
           expiryDate: memberData.expiryDate ? new Date(memberData.expiryDate).toLocaleDateString() : "-"
        } : null;
        
        setCurrentPlan(currentPlanDetails);

        // 2. Get All Plans for Renewal Options
        const plansRes = await fetch(`${BACKEND_URL}/api/plans`, {
           headers: { Authorization: `Bearer ${token}` } // Optional if public
        });
        
        if (!plansRes.ok) throw new Error("Failed to load plans");
        const allPlans = await plansRes.json();

        // Filter: Show only plans with price >= current plan price (Upgrade/Renew logic)
        // If no current plan, show all.
        const currentPrice = currentPlanDetails?.price || 0;
        const filteredOptions = allPlans.filter(p => p.price >= currentPrice && p.status === 'Active');
        
        setRenewalOptions(filteredOptions);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load renewal options");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- ACTIONS ---
  const handleSelectPlan = (plan) => {
    // Redirect to payment page with plan state
    navigate('/member/payment', { state: { plan } });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Renewal Options...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Renew Membership</h1>
          <p className="text-gray-500 mt-1">Extend your fitness journey without interruption.</p>
        </div>
      </div>

      {/* CURRENT PLAN STATUS */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[80px] opacity-20"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Plan</p>
               <h2 className="text-3xl font-black text-gray-900">{currentPlan?.name || "No Active Plan"}</h2>
               <p className="text-sm text-gray-500 mt-1">Expires on: <span className="font-bold text-gray-800">{currentPlan?.expiryDate}</span></p>
            </div>

            <div className="text-center md:text-right">
               <div className="inline-block bg-red-50 px-6 py-4 rounded-3xl border border-red-100">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Time Remaining</p>
                  <p className="text-4xl font-black text-red-500">{daysLeft} <span className="text-sm font-bold text-red-300">Days</span></p>
               </div>
            </div>
         </div>
      </div>

      {/* RENEWAL OPTIONS */}
      <h3 className="font-bold text-gray-900 text-lg ml-2">Recommended Plans</h3>
      
      {renewalOptions.length === 0 ? (
         <div className="text-center py-12 bg-gray-50 rounded-3xl">
            <p className="text-gray-500">No upgrade options available at this time.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renewalOptions.map((plan) => (
               <div 
                  key={plan._id} 
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#CDE7FE] transition-all duration-300 flex flex-col"
               >
                  <div className="mb-6">
                     <h4 className="font-bold text-xl text-gray-900">{plan.name}</h4>
                     <p className="text-xs text-gray-500 mt-1">{plan.durationLabel} Access</p>
                  </div>

                  <div className="mb-6">
                     <span className="text-3xl font-black text-gray-900">₹{plan.price.toLocaleString()}</span>
                     {plan.originalPrice > plan.price && (
                        <p className="text-xs text-gray-400 line-through">₹{plan.originalPrice.toLocaleString()}</p>
                     )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                     {plan.features.slice(0, 4).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                           <i className="fa-solid fa-circle-check mt-1 text-xs text-green-500"></i> {feat}
                        </li>
                     ))}
                  </ul>

                  <button 
                     onClick={() => handleSelectPlan(plan)}
                     className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all bg-[#D9F17F] text-green-900 hover:bg-green-300"
                  >
                     Select Plan
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