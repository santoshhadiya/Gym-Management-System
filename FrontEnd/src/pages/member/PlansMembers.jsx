import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PlansMembers = () => {
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

  const [billingCycle, setBillingCycle] = useState("Monthly");

  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: 1500,
      duration: '1 Month',
      color: "bg-white",
      borderColor: "border-gray-100",
      icon: "fa-dumbbell",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      features: [
        'Gym Access (6AM – 10PM)',
        'Standard Equipment Use',
        'Locker Access',
        'General Trainer Support'
      ],
      recommended: false
    },
    {
      id: 2,
      name: 'Pro Quarterly',
      price: 4000,
      duration: '3 Months',
      color: "bg-[#fffcf0]",
      borderColor: "border-[#FEEF75]",
      icon: "fa-fire",
      iconColor: "text-yellow-700",
      iconBg: "bg-[#FEEF75]",
      features: [
        'All Basic Features',
        '1 Free Diet Consultation',
        'Access to Group Classes',
        'Steam Bath (1/Week)',
        'Free WiFi'
      ],
      recommended: true,
      tag: "MOST POPULAR"
    },
    {
      id: 3,
      name: 'Elite Yearly',
      price: 12000,
      duration: '12 Months',
      color: "bg-[#f4fbf6]",
      borderColor: "border-[#D9F17F]",
      icon: "fa-crown",
      iconColor: "text-green-800",
      iconBg: "bg-[#D9F17F]",
      features: [
        'All Pro Features',
        'Unlimited Steam & Sauna',
        'Personal Training (2 Sessions)',
        'Monthly Body Composition Analysis',
        'Merchandise Kit'
      ],
      recommended: false,
      tag: "BEST VALUE"
    },
  ];

  return (
    <div className="font-sans text-gray-800 bg-white pt-5">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden rounded-4xl">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative p-8 rounded-[2.5rem] border-2 ${plan.borderColor} ${plan.color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col`}
              >
                {/* Tag */}
                {plan.tag && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${plan.recommended ? 'bg-[#FEEF75] text-yellow-900' : 'bg-[#D9F17F] text-green-900'}`}>
                      {plan.tag}
                    </span>
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${plan.iconBg} ${plan.iconColor}`}>
                  <i className={`fa-solid ${plan.icon}`}></i>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 font-medium">/ {plan.duration}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <i className="fa-solid fa-check text-green-500 mt-0.5"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/visitor/contact" className="block">
                  <button className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${plan.recommended ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    Choose {plan.name}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMPARISON TABLE */}
      <section className="py-20 bg-[#f8fbff]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Detailed Comparison</h2>
            <p className="text-gray-500">Find the perfect fit for your needs.</p>
          </div>

          <div className="overflow-x-auto bg-white rounded-[2rem] shadow-sm border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider w-1/3">Features</th>
                  <th className="p-6 text-center font-bold text-gray-900">Basic</th>
                  <th className="p-6 text-center font-bold text-blue-600">Pro</th>
                  <th className="p-6 text-center font-bold text-green-600">Elite</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {[
                  { feature: "Gym Access", basic: true, pro: true, elite: true },
                  { feature: "Locker Access", basic: true, pro: true, elite: true },
                  { feature: "Group Classes", basic: false, pro: true, elite: true },
                  { feature: "Steam & Sauna", basic: false, pro: "1/Week", elite: "Unlimited" },
                  { feature: "Personal Training", basic: false, pro: false, elite: "2 Sessions/Mo" },
                  { feature: "Diet Consultation", basic: false, pro: "Quarterly", elite: "Monthly" },
                  { feature: "Guest Passes", basic: false, pro: "2", elite: "5" },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-6 font-medium text-gray-800">{row.feature}</td>
                    <td className="p-6 text-center">
                      {row.basic === true ? <i className="fa-solid fa-check text-green-500"></i> : row.basic === false ? <i className="fa-solid fa-minus text-gray-300"></i> : row.basic}
                    </td>
                    <td className="p-6 text-center bg-blue-50/30">
                      {row.pro === true ? <i className="fa-solid fa-check text-green-500"></i> : row.pro === false ? <i className="fa-solid fa-minus text-gray-300"></i> : row.pro}
                    </td>
                    <td className="p-6 text-center bg-green-50/30 font-bold text-gray-800">
                      {row.elite === true ? <i className="fa-solid fa-check text-green-500"></i> : row.elite === false ? <i className="fa-solid fa-minus text-gray-300"></i> : row.elite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Are there any joining fees?", a: "No, we have a transparent pricing policy. The price you see is the price you pay. No hidden registration fees." },
              { q: "Can I freeze my membership?", a: "Yes, Yearly members can freeze their membership for up to 30 days for medical or travel reasons." },
              { q: "Do you offer student discounts?", a: "Absolutely! Students with a valid ID get special rates on Quarterly and Yearly plans. Check our Offers page." },
              { q: "Is personal training included?", a: "The Elite plan includes 2 complimentary PT sessions per month. Dedicated PT packages can be purchased separately." },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                  <i className="fa-solid fa-circle-question text-[#CDE7FE] mt-1"></i> {faq.q}
                </h4>
                <p className="text-sm text-gray-600 pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Still Deciding?</h2>
              <p className="text-gray-300 text-lg mb-8">
                Come in for a free trial workout. Experience the vibe, meet the trainers, and see if we're the right fit for you.
              </p>
              <Link to="/visitor/contact">
                <button className="px-10 py-4 bg-[#FEEF75] text-yellow-900 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg transform hover:scale-105">
                  Book Free Trial
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PlansMembers;