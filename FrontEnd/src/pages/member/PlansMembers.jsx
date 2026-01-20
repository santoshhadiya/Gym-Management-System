import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';

const PlansMembers = () => {
  const { api } = useGlobalContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Fetch active plans only (public endpoint usually filters by status=Active)
      const res = await api.get("/plans");
      setPlans(res.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    // Navigate to payment page with plan details
    navigate('/member/payment', { state: { plan } });
  };

  const toggleFeatures = (id) => {
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  // Helper to get card styles based on plan name/price (Mock logic for visual variety)
  const getPlanStyle = (index) => {
    const styles = [
      { border: "border-gray-100", bg: "bg-white", icon: "fa-dumbbell", iconColor: "text-blue-500", iconBg: "bg-blue-50" },
      { border: "border-[#FEEF75]", bg: "bg-[#fffcf0]", icon: "fa-fire", iconColor: "text-yellow-700", iconBg: "bg-[#FEEF75]", tag: "POPULAR" },
      { border: "border-[#D9F17F]", bg: "bg-[#f4fbf6]", icon: "fa-crown", iconColor: "text-green-800", iconBg: "bg-[#D9F17F]", tag: "BEST VALUE" },
    ];
    return styles[index % styles.length];
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#CDE7FE]"></i>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 pb-20">

      {/* 1. HEADER SECTION */}
       <section className="relative bg-gray-900 py-20 mb-10 overflow-hidden rounded-4xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FEEF75] text-yellow-900 text-xs font-bold uppercase tracking-wider mb-4">
            Invest In Yourself
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Choose Your <span className="text-[#D9F17F]">Strength</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Transparent pricing. No hidden fees. Just pure fitness tailored to your goals.
          </p>
        </div>
      </section>

      {/* 2. PLANS GRID */}
      {plans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3 block"></i>
          <p className="text-gray-400">No plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const style = getPlanStyle(idx);
            const isFeaturesExpanded = expandedPlan === plan._id;
            const featuresToShow = isFeaturesExpanded ? plan.features : plan.features.slice(0, 4);

            return (
              <div
                key={plan._id}
                className={`relative p-8 rounded-[2.5rem] border-2 ${style.border} ${style.bg} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col`}
              >
                {/* Tag */}
                {style.tag && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${style.tag === 'POPULAR' ? 'bg-[#FEEF75] text-yellow-900' : 'bg-[#D9F17F] text-green-900'}`}>
                      {style.tag}
                    </span>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${style.iconBg} ${style.iconColor} shadow-inner`}>
                  <i className={`fa-solid ${style.icon}`}></i>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black text-gray-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 font-medium">/ {plan.durationLabel}</span>
                  {plan.originalPrice > plan.price && (
                    <span className="text-xs text-red-400 line-through font-bold">₹{plan.originalPrice}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {featuresToShow.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-white border border-green-200 flex items-center justify-center shrink-0 text-green-500 text-xs">
                        <i className="fa-solid fa-check"></i>
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}

                  {plan.features.length > 4 && (
                    <button
                      onClick={() => toggleFeatures(plan._id)}
                      className="text-xs font-bold text-blue-600 hover:underline mt-2 flex items-center gap-1"
                    >
                      {isFeaturesExpanded ? "Show Less" : `+ ${plan.features.length - 4} More Features`}
                    </button>
                  )}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${style.tag ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900'}`}
                >
                  Choose Plan <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FAQ SECTION */}
      <section className="mt-24 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: "Can I upgrade later?", a: "Yes, you can upgrade your plan at any time. The remaining value will be adjusted." },
            { q: "Is personal training included?", a: "Some plans include limited PT sessions. Dedicated PT packages are separate." },
            { q: "Can I freeze my membership?", a: "Yearly memberships allow freezing for up to 30 days for medical reasons." },
            { q: "Are there joining fees?", a: "No, the price you see is the price you pay. No hidden charges." },
          ].map((faq, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
              <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                <i className="fa-solid fa-circle-question text-[#CDE7FE] mt-1"></i> {faq.q}
              </h4>
              <p className="text-sm text-gray-600 pl-7 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA FOOTER */}
      <section className="mt-20 bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden mx-4 md:mx-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Need Custom Training?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Book a free consultation with our head trainer to design a plan that fits your specific needs.
          </p>
          <Link to="/member/booking">
            <button className="px-10 py-4 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg transform hover:scale-105">
              Book Consultation
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PlansMembers;