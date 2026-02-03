import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What are the gym opening hours?",
      answer: "We are a 24/7 facility! Members can access the gym at any time, day or night, using their digital key fob or mobile app access."
    },
    {
      question: "Do you offer personal training?",
      answer: "Yes! We have a team of certified expert trainers specializing in weight loss, muscle gain, and athletic performance. You can book a free consultation via the 'Contact' page."
    },
    {
      question: "Can I bring a friend for a trial?",
      answer: "Absolutely. We offer a 1-day free pass for first-time visitors. They just need to sign up through our 'Book a Free Trial' link on the home page."
    },
    {
      question: "Is there a contract for memberships?",
      answer: "We offer both flexible monthly 'No-Contract' plans and discounted annual memberships. You can choose the one that best fits your lifestyle."
    },
    {
      question: "What equipment do you have?",
      answer: "Our facility is equipped with premium Technogym and Hammer Strength machines, a dedicated Olympic lifting platform, and a comprehensive functional training zone."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FEEF75] text-yellow-900 text-xs font-bold uppercase tracking-widest mb-4">
            Help Center
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Got <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">Questions?</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Everything you need to know about Songar's Gym, memberships, and our world-class facilities.
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-[2rem] transition-all duration-300 overflow-hidden ${
                activeIndex === index 
                ? 'border-[#D9F17F] bg-gray-50/50 shadow-lg' 
                : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between px-8 py-6 text-left"
              >
                <span className={`text-lg font-bold transition-colors ${
                  activeIndex === index ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  activeIndex === index ? 'bg-[#D9F17F] rotate-180' : 'bg-gray-100'
                }`}>
                  <i className={`fa-solid fa-chevron-down text-xs ${
                    activeIndex === index ? 'text-green-900' : 'text-gray-400'
                  }`}></i>
                </div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-gray-500 leading-relaxed">
                      <div className="pt-2 border-t border-gray-100 mt-2">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

       

      </div>
    </div>
  );
};

export default FAQs;