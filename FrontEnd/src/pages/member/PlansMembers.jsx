import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Context

const PlansMembers = () => {
  const { api } = useGlobalContext();
  const { colors, theme } = useTheme(); // Consume Theme
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await api.get("/plans");
        setPlans(res.data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [api]);

  const handleSubscribe = (plan) => {
    navigate('/member/payment', { state: { plan } });
  };

  const toggleFeatures = (id) => {
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  // Helper to get visual styles
  const getPlanStyle = (index) => {
    const styles = [
      { 
         borderColor: theme === 'dark' ? '#374151' : '#f3f4f6', // gray-100
         bgLight: 'bg-white', 
         icon: "fa-dumbbell", 
         iconColor: "text-blue-500", 
         iconBg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50' 
      },
      { 
         borderColor: '#FEEF75', 
         bgLight: 'bg-[#fffcf0]', 
         icon: "fa-fire", 
         iconColor: "text-yellow-700", 
         iconBg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-[#FEEF75]', 
         tag: "POPULAR" 
      },
      { 
         borderColor: '#D9F17F', 
         bgLight: 'bg-[#f4fbf6]', 
         icon: "fa-crown", 
         iconColor: "text-green-800", 
         iconBg: theme === 'dark' ? 'bg-green-900/30' : 'bg-[#D9F17F]', 
         tag: "BEST VALUE" 
      },
    ];
    return styles[index % styles.length];
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center" style={{ color: colors.textMuted }}>
        <i className="fa-solid fa-circle-notch fa-spin text-4xl" style={{ color: colors.secondary }}></i>
      </div>
    );
  }

  return (
    <div className="font-sans pb-20 transition-colors duration-300" style={{ color: colors.text }}>

      {/* 1. HEADER SECTION - Always Dark for impact */}
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
        <div 
           className="text-center py-20 rounded-[3rem] border border-dashed"
           style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <i className="fa-solid fa-box-open text-4xl mb-3 block" style={{ color: colors.textMuted }}></i>
          <p style={{ color: colors.textMuted }}>No plans available at the moment.</p>
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
                className={`relative p-8 rounded-[2.5rem] border-2 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col ${theme === 'light' ? style.bgLight : ''}`}
                style={{ 
                   backgroundColor: theme === 'dark' ? colors.card : undefined,
                   borderColor: style.borderColor
                }}
              >
                {/* Tag */}
                {style.tag && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${style.tag === 'POPULAR' ? 'bg-[#FEEF75] text-yellow-900' : 'bg-[#D9F17F] text-green-900'}`}>
                      {style.tag}
                    </span>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner ${style.iconColor} ${style.iconBg}`}>
                  <i className={`fa-solid ${style.icon}`}></i>
                </div>

                <h3 className="text-2xl font-black mb-2" style={{ color: colors.text }}>{plan.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black" style={{ color: colors.text }}>₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm font-medium" style={{ color: colors.textMuted }}>/ {plan.durationLabel}</span>
                  {plan.originalPrice > plan.price && (
                    <span className="text-xs text-red-400 line-through font-bold">₹{plan.originalPrice}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {featuresToShow.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium" style={{ color: theme === 'dark' ? colors.textMuted : '#374151' }}>
                      <div className="mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs"
                           style={{ backgroundColor: colors.background, borderColor: colors.primary, color: 'green' }}>
                        <i className="fa-solid fa-check"></i>
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}

                  {plan.features.length > 4 && (
                    <button
                      onClick={() => toggleFeatures(plan._id)}
                      className="text-xs font-bold hover:underline mt-2 flex items-center gap-1"
                      style={{ color: colors.secondary }}
                    >
                      {isFeaturesExpanded ? "Show Less" : `+ ${plan.features.length - 4} More Features`}
                    </button>
                  )}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${style.tag ? 'bg-gray-900 text-white hover:bg-gray-800' : 'border-2'}`}
                  style={!style.tag ? { 
                      backgroundColor: colors.background, 
                      borderColor: colors.border, 
                      color: colors.text 
                  } : {}}
                >
                  Choose Plan <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FAQ SECTION */}
      <section className="mt-24 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-black text-center mb-8" style={{ color: colors.text }}>Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: "Can I upgrade later?", a: "Yes, you can upgrade your plan at any time. The remaining value will be adjusted." },
            { q: "Is personal training included?", a: "Some plans include limited PT sessions. Dedicated PT packages are separate." },
            { q: "Can I freeze my membership?", a: "Yearly memberships allow freezing for up to 30 days for medical reasons." },
            { q: "Are there joining fees?", a: "No, the price you see is the price you pay. No hidden charges." },
          ].map((faq, idx) => (
            <div 
               key={idx} 
               className="p-6 rounded-2xl border hover:shadow-sm transition-all"
               style={{ 
                  backgroundColor: colors.card, 
                  borderColor: colors.border 
               }}
            >
              <h4 className="font-bold mb-2 flex items-start gap-3" style={{ color: colors.text }}>
                <i className="fa-solid fa-circle-question mt-1" style={{ color: colors.secondary }}></i> {faq.q}
              </h4>
              <p className="text-sm pl-7 leading-relaxed" style={{ color: colors.textMuted }}>{faq.a}</p>
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