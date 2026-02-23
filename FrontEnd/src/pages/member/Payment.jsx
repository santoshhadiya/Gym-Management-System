import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from "../../context/ThemeContext";
import UpgradeBreakdown from '../../components/UpgradeBreakdown';

const Payment = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { api, user } = useGlobalContext();
   const { colors, theme } = useTheme();

   const planData = location.state?.plan;
   const [plan, setPlan] = useState(planData)

   // --- STATE ---
   const [isProcessing, setIsProcessing] = useState(false);
   const [paymentHistory, setPaymentHistory] = useState([]);
   const [remainingDays, setRemainingDays] = useState(0);
   const [currentPlan, setCurrentPlan] = useState(null);
   const [memberData, setMemberData] = useState(null);
   
   // NEW: Selected purchase type - user choice
   const [selectedOption, setSelectedOption] = useState(null); // 'direct', 'upgrade', or 'queue'
   
   // Options available for this member
   const [canUpgrade, setCanUpgrade] = useState(false);
   const [canQueue, setCanQueue] = useState(false);
   const [canDirectPurchase, setCanDirectPurchase] = useState(false);
   
   const [upgradeData, setUpgradeData] = useState(null);
   const [amountToCharge, setAmountToCharge] = useState(plan?.price || 0);

   // --- INITIALIZATION ---
   useEffect(() => {
      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
         document.head.removeChild(linkFA);
         document.body.removeChild(script);
      };
   }, []);

   // --- DATA FETCHING ---
   useEffect(() => {
      const fetchData = async () => {
         if (!plan) {
            toast.error("No plan selected");
            navigate("/member/plans");
            return;
         }

         try {
            // Fetch member profile
            const profileRes = await api.get("/members/profile");
            setMemberData(profileRes.data);
            setCurrentPlan(profileRes.data.plan);
            
            if (profileRes.data.expiryDate) {
               const expiry = new Date(profileRes.data.expiryDate);
               const today = new Date();
               const diffTime = expiry - today;
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               if (diffDays > 0) setRemainingDays(diffDays);
            }

            // Determine available options for this member
            determineOptions(profileRes.data, plan);

            const historyRes = await api.get("/payments/my");
            setPaymentHistory(historyRes.data);
         } catch (error) {
            console.error("Fetch error:", error);
         }
      };
      fetchData();
   }, [api, plan, navigate]);

   // --- DETERMINE AVAILABLE OPTIONS ---
   const determineOptions = async (member, selectedPlan) => {
      const today = new Date();
      const hasActivePlan = member.expiryDate && new Date(member.expiryDate) > today;

      if (!hasActivePlan) {
         // Case A: No active plan
         setCanDirectPurchase(true);
         setCanUpgrade(false);
         setCanQueue(false);
         setAmountToCharge(selectedPlan.price);
         return;
      }

      // Case B: Has active plan - check upgrade and queue options
      try {
         const calcRes = await api.post("/upgrades/calculate", {
            newPlanId: selectedPlan._id
         });

         const eligibility = calcRes.data;
         
         // Set availability flags
         setCanDirectPurchase(false);
         setCanUpgrade(eligibility.canUpgrade || false);
         setCanQueue(eligibility.canQueue || false);

         // Pre-calculate upgrade data if eligible
         if (eligibility.canUpgrade && eligibility.calculation) {
            // Backend already returns proper structure from calculateUpgradeCost
            const transformedData = {
               currentPlan: eligibility.currentPlan || {},
               upgrade: eligibility.upgrade || {
                  name: eligibility.newPlan?.name || selectedPlan.name,
                  duration: eligibility.newPlan?.duration || selectedPlan.duration,
                  additionalDaysGained: (eligibility.newPlan?.duration || selectedPlan.duration) - (eligibility.currentPlan?.duration || 0)
               },
               calculation: eligibility.calculation || {},
               newExpiryDate: eligibility.newExpiryDate
            };
            setUpgradeData(transformedData);
            setAmountToCharge(eligibility.calculation?.amountToCharge || selectedPlan.price);
         } else {
            setAmountToCharge(selectedPlan.price);
         }
      } catch (error) {
         console.error("Error determining options:", error);
         setCanQueue(true); // Default to queue if error
         setAmountToCharge(selectedPlan.price);
      }
   };

   // --- RAZORPAY LOGIC ---
   const initiateRazorpay = async (finalPlan, purchaseType, amount) => {
      try {
         setIsProcessing(true);
         const orderRes = await api.post("/payments/razorpay-order", {
            planId: finalPlan._id,
            purchaseType,
            amountToCharge: amount
         });
         const order = orderRes.data;

         const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SC45T3ibqRcWn4",
            amount: order.amount,
            currency: order.currency,
            name: "Songar's GYM",
            description: `Membership: ${finalPlan.name}`,
            order_id: order.id,
            handler: async function (response) {
               try {
                  await api.post("/payments/verify", {
                     razorpay_order_id: response.razorpay_order_id,
                     razorpay_payment_id: response.razorpay_payment_id,
                     razorpay_signature: response.razorpay_signature,
                     planId: finalPlan._id,
                     purchaseType,
                     amountToCharge: amount
                  });

                  if (purchaseType === 'upgrade') {
                     toast.success("Plan upgraded successfully!");
                  } else if (purchaseType === 'queue') {
                     toast.success("Plan queued for purchase!");
                  } else {
                     toast.success("Membership Activated!");
                  }
                  
                  navigate("/member/profile");
               } catch (err) {
                  toast.error(err.response?.data?.message || "Verification failed.");
                  setIsProcessing(false);
               }
            },
            prefill: { name: user?.name || "", email: user?.email || "" },
            theme: { color: "#FEEF75" },
            modal: { ondismiss: () => setIsProcessing(false) }
         };

         const rzp = new window.Razorpay(options);
         rzp.open();
      } catch (error) {
         toast.error("Failed to initiate payment.");
         setIsProcessing(false);
      }
   };

   // --- HANDLE OPTION SELECTION AND PAYMENT ---
   const handleProceedToPayment = async (e) => {
      e.preventDefault();

      if (!selectedOption) {
         toast.error("Please select an option");
         return;
      }

      try {
         setIsProcessing(true);

         // Fetch latest plan data
         const res = await api.get("/plans");
         const latestPlan = res.data.find(p => p._id === plan._id);

         if (!latestPlan) {
            toast.error("This plan is no longer available.");
            setIsProcessing(false);
            return;
         }

         // Validate plan status
         if (latestPlan.status === "Inactive") {
            toast.error("This plan is currently inactive. Please choose another plan.", {
               icon: '🚫'
            });
            setIsProcessing(false);
            return;
         }

         // Validate price changes
         if (Number(latestPlan.price) !== Number(plan.price)) {
            const direction = Number(latestPlan.price) > Number(plan.price) ? "increased" : "decreased";
            const confirmNewPrice = window.confirm(
               `The price of this plan has ${direction} from ₹${plan.price} to ₹${latestPlan.price}. Do you want to continue?`
            );

            if (!confirmNewPrice) {
               setIsProcessing(false);
               return;
            }
            setPlan(prev => ({ ...prev, price: latestPlan.price }));
         }

         // Proceed with selected option
         if (selectedOption === 'direct' || selectedOption === 'upgrade' || selectedOption === 'queue') {
            await initiateRazorpay(latestPlan, selectedOption === 'direct' ? 'new' : selectedOption, amountToCharge);
         }

      } catch (error) {
         console.error("Payment error:", error);
         toast.error("Failed to proceed. Please try again.");
         setIsProcessing(false);
      }
   };

   const getStatusColor = (status) => status === "Success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";

   if (!plan) return null;

   return (
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans px-4 animate-fadeIn">
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black" style={{ color: colors.text }}>Checkout</h1>
               <p className="text-sm" style={{ color: colors.textMuted }}>
                  {!remainingDays 
                     ? "Secure one-time payment for your fitness journey."
                     : "Choose how you'd like to purchase this plan."}
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

               {/* PLAN DETAILS */}
               <div className="rounded-[2.5rem] p-8 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Selected Plan</p>
                        <h2 className="text-3xl font-black" style={{ color: colors.text }}>{plan.name}</h2>
                        <p className="text-sm mt-2 font-bold text-gray-400">Validity: {plan.duration} Days</p>
                     </div>
                     <div className="text-right">
                        <span className="text-3xl font-black" style={{ color: colors.text }}>₹{plan.price}</span>
                     </div>
                  </div>
               </div>

               {/* CASE A: NO ACTIVE PLAN - Direct Purchase Only */}
               {canDirectPurchase && !remainingDays && (
                  <div className="rounded-[2.5rem] p-8 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                     <h3 className="font-black text-lg mb-4 flex items-center gap-3" style={{ color: colors.text }}>
                        <i className="fa-solid fa-rocket text-green-500"></i> Start Your Fitness Journey
                     </h3>
                     <p className="text-sm" style={{ color: colors.textMuted }}>You don't have an active plan. Start with this {plan.duration}-day membership now.</p>
                     <button
                        onClick={() => setSelectedOption('direct')}
                        className={`w-full py-4 rounded-[1.5rem] font-black text-lg mt-6 transition-all ${
                           selectedOption === 'direct'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                     >
                        <i className="fa-solid fa-check mr-2"></i> Start Now - ₹{plan.price}
                     </button>
                  </div>
               )}

               {/* CASE B: HAS ACTIVE PLAN - Upgrade or Queue Options */}
               {remainingDays > 0 && (
                  <>
                     <div className="rounded-lg p-4 border-2" style={{ backgroundColor: colors.border, borderColor: colors.textMuted }}>
                        <p className="text-sm font-bold" style={{ color: colors.text }}>
                           <i className="fa-solid fa-info-circle mr-2 text-blue-500"></i>
                           Your current {currentPlan?.duration}-day plan ends in {remainingDays} days
                        </p>
                     </div>

                     {/* UPGRADE OPTION */}
                     {canUpgrade && (
                        <div className="rounded-[2.5rem] p-8 border-2 shadow-sm transition-all" style={{
                           backgroundColor: selectedOption === 'upgrade' ? colors.secondary : colors.card,
                           borderColor: selectedOption === 'upgrade' ? '#fbbf24' : colors.border
                        }}>
                           <h3 className="font-black text-lg mb-4 flex items-center gap-3" style={{ color: colors.text }}>
                              <i className="fa-solid fa-arrow-up-right text-yellow-500"></i> Upgrade Your Plan
                           </h3>
                           <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                              Upgrade to a longer plan and extend your membership benefits. Your current plan value will be credited.
                           </p>
                           
                           {upgradeData && upgradeData.calculation && (
                              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: colors.border }}>
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold" style={{ color: colors.textMuted }}>You Pay:</span>
                                    <span className="text-2xl font-black text-green-500">₹{upgradeData.calculation.amountToCharge}</span>
                                 </div>
                                 <p className="text-xs font-bold text-green-600">
                                    💰 Save ₹{upgradeData.calculation.discountApplied} ({upgradeData.calculation.percentageSaved}% off)
                                 </p>
                              </div>
                           )}

                           <button
                              onClick={() => setSelectedOption('upgrade')}
                              className={`w-full py-4 rounded-[1.5rem] font-black text-lg transition-all ${
                                 selectedOption === 'upgrade'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                           >
                              <i className="fa-solid fa-check mr-2"></i> Upgrade Now
                           </button>
                        </div>
                     )}

                     {/* QUEUE OPTION */}
                     {canQueue && (
                        <div className="rounded-[2.5rem] p-8 border-2 shadow-sm transition-all" style={{
                           backgroundColor: selectedOption === 'queue' ? colors.secondary : colors.card,
                           borderColor: selectedOption === 'queue' ? '#60a5fa' : colors.border
                        }}>
                           <h3 className="font-black text-lg mb-4 flex items-center gap-3" style={{ color: colors.text }}>
                              <i className="fa-solid fa-calendar-check text-blue-500"></i> Queue This Plan
                           </h3>
                           <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                              Queue this plan for later. It will automatically activate when your current plan expires. You can queue multiple plans.
                           </p>
                           <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: colors.border }}>
                              <p className="text-xs font-bold text-blue-600 mb-2">
                                 <i className="fa-solid fa-calendar-plus mr-2"></i>Scheduled to start in {remainingDays} days
                              </p>
                              <p className="text-sm font-bold" style={{ color: colors.text }}>Full Price: ₹{plan.price}</p>
                           </div>
                           <button
                              onClick={() => setSelectedOption('queue')}
                              className={`w-full py-4 rounded-[1.5rem] font-black text-lg transition-all ${
                                 selectedOption === 'queue'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                           >
                              <i className="fa-solid fa-check mr-2"></i> Queue Plan - ₹{plan.price}
                           </button>
                        </div>
                     )}

                     {!canUpgrade && !canQueue && (
                        <div className="rounded-lg p-6 border-2 border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700">
                           <p className="font-bold text-red-700 dark:text-red-200">
                              <i className="fa-solid fa-circle-exclamation mr-2"></i>
                              This plan cannot be purchased as an upgrade (downgrade not allowed). You can queue it to purchase after your current plan expires.
                           </p>
                        </div>
                     )}
                  </>
               )}

               {/* SHOW UPGRADE BREAKDOWN IF SELECTED */}
               {selectedOption === 'upgrade' && upgradeData && (
                  <UpgradeBreakdown upgradeData={upgradeData} colors={colors} />
               )}

               {/* PAYMENT BUTTON */}
               {selectedOption && (
                  <div className="rounded-[2.5rem] p-8 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                     <h3 className="font-black text-lg mb-6 flex items-center gap-3" style={{ color: colors.text }}>
                        <i className="fa-solid fa-shield-check text-green-500"></i> Razorpay Secure
                     </h3>

                     <button
                        onClick={handleProceedToPayment}
                        disabled={isProcessing}
                        className={`w-full py-5 rounded-[1.5rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 ${
                           isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FEEF75] text-black hover:bg-[#ffca2b]'
                        }`}
                     >
                        {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 
                           <><i className="fa-solid fa-lock text-sm"></i>
                           {selectedOption === 'upgrade' ? `Proceed with Upgrade - ₹${amountToCharge}` :
                            selectedOption === 'queue' ? `Queue Plan - ₹${amountToCharge}` :
                            `Pay with Razorpay - ₹${amountToCharge}`}</>}
                     </button>
                     {!selectedOption && (
                        <p className="text-center text-xs font-bold text-red-500 mt-3">Select an option above to proceed</p>
                     )}
                  </div>
               )}
            </div>

            {/* RECENT BILLING */}
            <div className="rounded-3xl p-6 border shadow-sm h-fit" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
               <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: colors.text }}>Recent Billing</h3>
               <div className="space-y-4">
                  {paymentHistory.slice(0, 5).map((txn) => (
                     <div key={txn._id} className="p-4 rounded-2xl border" style={{ borderColor: colors.border }}>
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-sm font-black" style={{ color: colors.text }}>₹{txn.amount}</p>
                           <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${getStatusColor(txn.status)}`}>{txn.status}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">{new Date(txn.paidAt).toLocaleDateString()}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
         <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }`}</style>
      </div>
   );
};

export default Payment;