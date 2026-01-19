import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Plans = () => {
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

  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' or 'yearly'

  const plans = [
    {
      id: 1,
      name: "Monthly Basic",
      price: billingCycle === "monthly" ? "₹1,500" : "₹15,000",
      period: billingCycle === "monthly" ? "/mo" : "/yr",
      desc: "Perfect for beginners starting their fitness journey.",
      features: [
        "Gym Floor Access",
        "Locker & Shower",
        "General Trainer Support",
        "Free WiFi"
      ],
      color: "bg-white",
      border: "border-gray-100",
      buttonColor: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      recommended: false
    },
    {
      id: 2,
      name: "Quarterly Pro",
      price: billingCycle === "monthly" ? "₹4,000" : "₹40,000", // Logic implies 3 months vs 3 years scaling, simplified for UI demo
      period: "/3mo", // Fixed period for this specific plan type usually
      // Overriding the toggle logic slightly for specific plan types if needed, 
      // but let's stick to the visual toggle affecting the 'view' mostly.
      // Let's make the data static for simplicity based on previous context:
      staticPrice: "₹4,000",
      staticPeriod: "/3mo",
      desc: "Commit to a season of change with extra perks.",
      features: [
        "All Basic Features",
        "Group Classes (Yoga/Zumba)",
        "Diet Consultation",
        "Body Composition Analysis"
      ],
      color: "bg-[#fcfdfd]",
      border: "border-[#FEEF75] border-2",
      buttonColor: "bg-[#FEEF75] text-yellow-900 hover:bg-yellow-400",
      recommended: true
    },
    {
      id: 3,
      name: "Yearly Elite",
      price: "₹12,000",
      period: "/yr",
      desc: "The ultimate package for serious fitness enthusiasts.",
      features: [
        "All Pro Features",
        "Personal Training (2 Sessions)",
        "Steam & Sauna Access",
        "Merchandise Pack",
        "Priority Support"
      ],
      color: "bg-white",
      border: "border-gray-100",
      buttonColor: "bg-gray-900 text-white hover:bg-gray-800",
      recommended: false
    }
  ];

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FEEF75] text-yellow-900 text-xs font-bold uppercase tracking-wider mb-4">
            Membership Options
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Invest In Your <span className="text-[#D9F17F]">Health</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Transparent pricing. No hidden fees. Just results. Choose the plan that fits your lifestyle.
          </p>
        </div>
      </section>

      {/* 2. PLANS GRID */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          
          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative p-8 rounded-[2.5rem] shadow-lg transition-all duration-300 hover:-translate-y-2 ${plan.color} ${plan.border} ${plan.recommended ? 'shadow-xl scale-105 z-10' : 'shadow-md'}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FEEF75] text-yellow-900 px-6 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm h-10">{plan.desc}</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-4xl font-black text-gray-900">{plan.staticPrice || plan.price}</span>
                  <span className="text-gray-400 font-medium">{plan.staticPeriod || plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                        <i className="fa-solid fa-check text-xs"></i>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/contact" className="block">
                  <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md ${plan.buttonColor}`}>
                    Choose Plan
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="py-20 bg-[#f8fbff]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about joining Songar's Gym.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is there a joining fee?", a: "No, we currently have a zero joining fee policy for all yearly memberships." },
              { q: "Can I freeze my membership?", a: "Yes, yearly members can freeze their membership for up to 30 days for medical or travel reasons." },
              { q: "Do you offer trial sessions?", a: "Absolutely! We offer a 1-day free trial so you can experience our facilities before committing." },
              { q: "Are personal trainers included?", a: "General floor trainers are always available to help. Dedicated Personal Training (PT) packages are sold separately or included in the Yearly Elite plan." },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-3">
                  <span className="text-[#CDE7FE] text-xl">?</span> {faq.q}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-gray-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
             {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#D9F17F] rounded-full filter blur-[100px] opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Still Have Questions?</h2>
              <p className="text-gray-400 mb-8">
                Our team is happy to help you find the perfect plan for your goals.
              </p>
              <Link to="/contact">
                <button className="px-10 py-4 bg-[#D9F17F] text-green-900 rounded-full font-bold text-sm hover:bg-green-400 transition-all shadow-lg transform hover:scale-105">
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Plans;