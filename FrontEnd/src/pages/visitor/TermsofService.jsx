import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const lastUpdated = "February 02, 2026";

  const sections = [
    { id: "membership", title: "1. Membership & Access" },
    { id: "conduct", title: "2. Code of Conduct" },
    { id: "fees", title: "3. Fees & Payments" },
    { id: "liability", title: "4. Liability Waiver" },
    { id: "termination", title: "5. Cancellation Policy" },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-16 text-center md:text-left">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FEEF75] text-yellow-900 text-xs font-bold uppercase tracking-widest mb-4">
            User Agreement
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">Service</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Last updated: {lastUpdated}. Please read these terms carefully before using Songar's Gym facilities or digital services.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block col-span-1 sticky top-32 h-fit">
            <nav className="space-y-4">
              {sections.map((section) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors py-2 border-l-2 border-transparent hover:border-[#FEEF75] pl-4"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Terms Content */}
          <div className="col-span-1 lg:col-span-3 bg-gray-50/50 rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
            
            <section id="membership" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-sm">1</div>
                Membership & Access
              </h2>
              <div className="text-gray-600 space-y-4 leading-relaxed">
                <p>Membership is personal and non-transferable. Access to the gym is granted via the mobile app or key fob. Sharing access credentials with non-members will result in immediate termination of membership without refund.</p>
                <div className="p-4 bg-[#D9F17F]/10 border border-[#D9F17F]/30 rounded-2xl text-sm text-green-900">
                  <strong>Note:</strong> Members must be at least 18 years of age, or 16 with written parental consent.
                </div>
              </div>
            </section>

            <section id="conduct" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CDE7FE] flex items-center justify-center text-blue-600 text-sm">2</div>
                Code of Conduct
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To maintain a world-class environment, all members agree to:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-500">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Re-rack weights after use.</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Wipe down equipment.</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Wear appropriate gym attire.</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Respect other members' space.</li>
              </ul>
            </section>

            <section id="fees" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEEF75] flex items-center justify-center text-yellow-700 text-sm">3</div>
                Fees & Payments
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Membership fees are billed on the 1st of every month. Failed payments will incur a late fee of $15. We reserve the right to adjust membership pricing with a 30-day notice provided via email.
              </p>
            </section>

            <section id="liability" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-sm">4</div>
                Liability Waiver
              </h2>
              <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 italic">
                "Physical exercise involves inherent risks. By using our facilities, you voluntarily assume all risks of injury or damage. Songar's Gym is not liable for any personal injury, loss, or theft of property within the premises."
              </p>
            </section>

            <section id="termination" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-sm">5</div>
                Cancellation Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Cancellation requests must be submitted at least 14 days prior to your next billing cycle. No refunds are provided for partial months or unused memberships.
              </p>
            </section>

            {/* Support Link */}
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-sm">
                Questions about our terms? <Link to="/contact" className="text-gray-900 font-bold underline decoration-[#D9F17F] underline-offset-4">Contact our legal team</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;