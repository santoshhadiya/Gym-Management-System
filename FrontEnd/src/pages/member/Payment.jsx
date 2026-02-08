import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from "../../context/ThemeContext";

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
            // Check for existing active plan
            const profileRes = await api.get("/members/profile");
            if (profileRes.data.expiryDate) {
               const expiry = new Date(profileRes.data.expiryDate);
               const today = new Date();
               const diffTime = expiry - today;
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               if (diffDays > 0) setRemainingDays(diffDays);
            }

            const historyRes = await api.get("/payments/my");
            setPaymentHistory(historyRes.data);
         } catch (error) {
            console.error("Fetch error:", error);
         }
      };
      fetchData();
   }, [api, plan, navigate]);

   // --- RAZORPAY LOGIC ---
   // Updated to accept the latest plan data from the validation step
   const initiateRazorpay = async (finalPlan) => {
      try {
         setIsProcessing(true);
         const orderRes = await api.post("/payments/razorpay-order", { planId: finalPlan._id });
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
                     planId: finalPlan._id
                  });
                  toast.success("Membership Activated!");
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

   // --- UPDATED HANDLE PAYMENT CLICK WITH VALIDATION ---
   const handlePaymentClick = async (e) => {
      e.preventDefault();

      // 1. BLOCKING RESTRICTION: No purchase allowed if plan is active
      if (remainingDays > 0) {
         toast.error(`You have an active plan (${remainingDays} days left). Purchase is restricted until expiry.`, {
            duration: 6000,
            icon: '⚠️'
         });
         return;
      }

      try {
         setIsProcessing(true);

         // 2. FETCH LATEST PLAN DATA FROM DATABASE
         // Fetching all active plans to find the current selection's latest state
         const res = await api.get("/plans");
         const latestPlan = res.data.find(p => p._id === plan._id);

         if (!latestPlan) {
            toast.error("This plan is no longer available.");
            setIsProcessing(false);
            return;
         }

         // 3. VALIDATE PLAN STATUS
         // If the plan is marked 'Inactive' in the database, block the purchase
         if (latestPlan.status === "Inactive") {
            toast.error("This plan is currently inactive. Please choose another plan.", {
               icon: '🚫'
            });
            setIsProcessing(false);
            return;
         }

         // 4. VALIDATE PRICE CHANGES
         // If the price has changed since the user selected the plan, ask for confirmation
         if (Number(latestPlan.price) !== Number(plan.price)) {
            const direction =
               Number(latestPlan.price) > Number(plan.price)
                  ? "increased"
                  : "decreased";

            const confirmNewPrice = window.confirm(
               `The price of this plan has ${direction} from ₹${plan.price} to ₹${latestPlan.price}. Do you want to continue with the new price?`
            );

            if (!confirmNewPrice) {
               setIsProcessing(false);
               setPlan((prev) => ({
                  ...prev,
                  price: latestPlan.price,
               }));
               return;
            } else {
               setPlan((prev) => ({
                  ...prev,
                  price: latestPlan.price,
               }));
            }
         }


         // 5. PROCEED TO PAYMENT WITH LATEST DATA
         await initiateRazorpay(latestPlan);

      } catch (error) {
         console.error("Validation error:", error);
         toast.error("Failed to verify plan details. Please try again.");
         setIsProcessing(false);
      }
   };

   const getStatusColor = (status) => status === "Success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";

   if (!plan) return null;

   return (
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 font-sans px-4 animate-fadeIn">
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black" style={{ color: colors.text }}>Checkout</h1>
               <p className="text-sm" style={{ color: colors.textMuted }}>Secure one-time payment for your fitness journey.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
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

               <div className="rounded-[2.5rem] p-8 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <h3 className="font-black text-lg mb-6 flex items-center gap-3" style={{ color: colors.text }}>
                     <i className="fa-solid fa-shield-check text-green-500"></i> Razorpay Secure
                  </h3>

                  <button
                     onClick={handlePaymentClick}
                     disabled={isProcessing}
                     className={`w-full py-5 rounded-[1.5rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 ${remainingDays > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FEEF75] text-black hover:bg-[#ffca2b]'}`}
                  >
                     {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-lock text-sm"></i> Pay with Razorpay</>}
                  </button>
                  {remainingDays > 0 && (
                     <p className="text-center text-[11px] font-bold text-red-500 mt-4 uppercase">New plans can only be purchased after your current plan expires.</p>
                  )}
               </div>
            </div>

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