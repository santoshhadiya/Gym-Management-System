import React from 'react';

const PrivacyPolicy = () => {
  const lastUpdated = "October 24, 2023";

  const sections = [
    { id: "collection", title: "1. Information We Collect" },
    { id: "usage", title: "2. How We Use Information" },
    { id: "sharing", title: "3. Sharing of Information" },
    { id: "security", title: "4. Data Security" },
    { id: "rights", title: "5. Your Privacy Rights" },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-16 text-center md:text-left">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9F17F] text-green-900 text-xs font-bold uppercase tracking-widest mb-4">
            Legal Transparency
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-900">Policy</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Last updated: {lastUpdated}. Your privacy is important to us. This policy explains how we handle your personal data at Songar's Gym.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Navigation (Sticky) */}
          <aside className="hidden lg:block col-span-1 sticky top-32 h-fit">
            <nav className="space-y-4">
              {sections.map((section) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors py-2 border-l-2 border-transparent hover:border-[#D9F17F] pl-4"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Policy Content */}
          <div className="col-span-1 lg:col-span-3 bg-gray-50/50 rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
            
            <section id="collection" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CDE7FE] flex items-center justify-center text-blue-600 text-sm">1</div>
                Information We Collect
              </h2>
              <div className="text-gray-600 space-y-4 leading-relaxed">
                <p>We collect information that you provide directly to us when you register for a membership, sign up for a class, or contact us for support.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Identifiers:</strong> Name, email address, phone number, and physical address.</li>
                  <li><strong>Health Information:</strong> Par-Q forms or fitness assessments you provide to our trainers.</li>
                  <li><strong>Payment Data:</strong> Credit card or billing information (processed via secure third-party providers).</li>
                </ul>
              </div>
            </section>

            <section id="usage" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEEF75] flex items-center justify-center text-yellow-700 text-sm">2</div>
                How We Use Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The information we collect is used to provide, maintain, and improve our services, including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-500">
                  Processing your gym membership and managing access to our facilities.
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-500">
                  Sending transactional emails and class schedule updates.
                </div>
              </div>
            </section>

            <section id="security" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D9F17F] flex items-center justify-center text-green-800 text-sm">3</div>
                Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information. Our 24/7 facility monitoring and digital access systems are encrypted, and all payment transactions are processed through a gateway provider and are not stored or processed on our servers.
              </p>
            </section>

            <section id="rights" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-sm">4</div>
                Your Privacy Rights
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, please contact our privacy officer at <span className="text-blue-600 font-bold">privacy@songarsgym.com</span>.
              </p>
            </section>

            {/* Final Note */}
            <div className="mt-12 p-6 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <p className="text-gray-400 text-sm italic">
                By using our services, you consent to our Privacy Policy. We reserve the right to modify this policy at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;