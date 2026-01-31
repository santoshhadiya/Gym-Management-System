import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Updated Toast
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from "../../context/ThemeContext"; // Import Context

const Renew = () => {
   const { BACKEND_URL } = useGlobalContext();
   const { colors, theme } = useTheme(); // Consume Theme
   const navigate = useNavigate();
  
  // --- STATE ---
  const [currentPlan, setCurrentPlan] = useState(null);
  const [renewalOptions, setRenewalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

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
           headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (!plansRes.ok) throw new Error("Failed to load plans");
        const allPlans = await plansRes.json();

        // Filter: Show only plans with price >= current plan price (Upgrade/Renew logic)
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
    navigate('/member/payment', { state: { plan } });
  };

  if (loading) return <div className="p-10 text-center" style={{ color: colors.textMuted }}>Loading Renewal Options...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: colors.text }}>Renew Membership</h1>
          <p className="mt-1" style={{ color: colors.textMuted }}>Extend your fitness journey without interruption.</p>
        </div>
      </div>

      {/* CURRENT PLAN STATUS */}
      <div className="rounded-[2.5rem] p-8 border shadow-sm relative overflow-hidden"
           style={{ backgroundColor: colors.card, borderColor: colors.border }}>
         
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[80px] opacity-20"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Current Plan</p>
               <h2 className="text-3xl font-black" style={{ color: colors.text }}>{currentPlan?.name || "No Active Plan"}</h2>
               <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Expires on: <span className="font-bold" style={{ color: colors.text }}>{currentPlan?.expiryDate}</span></p>
            </div>

            <div className="text-center md:text-right">
               <div className="inline-block px-6 py-4 rounded-3xl border"
                    style={{ 
                       backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', // red-50
                       borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'
                    }}>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Time Remaining</p>
                  <p className="text-4xl font-black text-red-500">{daysLeft} <span className="text-sm font-bold text-red-300">Days</span></p>
               </div>
            </div>
         </div>
      </div>

      {/* RENEWAL OPTIONS */}
      <h3 className="font-bold text-lg ml-2" style={{ color: colors.text }}>Recommended Plans</h3>
      
      {renewalOptions.length === 0 ? (
         <div className="text-center py-12 rounded-3xl"
              style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
            <p style={{ color: colors.textMuted }}>No upgrade options available at this time.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renewalOptions.map((plan) => (
               <div 
                  key={plan._id} 
                  className="p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
               >
                  <div className="mb-6">
                     <h4 className="font-bold text-xl" style={{ color: colors.text }}>{plan.name}</h4>
                     <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{plan.durationLabel} Access</p>
                  </div>

                  <div className="mb-6">
                     <span className="text-3xl font-black" style={{ color: colors.text }}>₹{plan.price.toLocaleString()}</span>
                     {plan.originalPrice > plan.price && (
                        <p className="text-xs line-through" style={{ color: colors.textMuted }}>₹{plan.originalPrice.toLocaleString()}</p>
                     )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                     {plan.features.slice(0, 4).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: colors.textMuted }}>
                           <i className="fa-solid fa-circle-check mt-1 text-xs text-green-500"></i> {feat}
                        </li>
                     ))}
                  </ul>

                  <button 
                     onClick={() => handleSelectPlan(plan)}
                     className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all hover:bg-green-300"
                     style={{ backgroundColor: colors.primary, color: '#14532d' }} // Lime bg, Dark green text
                  >
                     Select Plan
                  </button>
               </div>
            ))}
         </div>
      )}

      {/* --- INFO SECTION --- */}
      <div className="rounded-[2rem] p-6 text-center"
           style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
         <h3 className="text-sm font-bold mb-2" style={{ color: colors.text }}>Why Renew Early?</h3>
         <p className="text-xs max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
            Renewing before your plan expires ensures you keep your locker slot, loyalty points, and avoid any re-joining administration fees.
         </p>
      </div>

    </div>
  );
};

export default Renew;