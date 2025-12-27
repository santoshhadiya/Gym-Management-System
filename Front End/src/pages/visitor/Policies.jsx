import React from 'react';

const Policies = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 px-6 py-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Gym Policies</h1>
        <p className="text-lg text-gray-600">
          Please read our rules and guidelines to ensure a safe and respectful environment for all members.
        </p>
      </div>

      {/* Policy Sections */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* General Conduct */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">🏋️ General Conduct</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
            <li>Respect all members, staff, and trainers at all times.</li>
            <li>Use equipment properly and return it to its place after use.</li>
            <li>Refrain from using offensive language or disruptive behavior.</li>
            <li>Wear appropriate workout attire and footwear.</li>
          </ul>
        </div>

        {/* Attendance & Access */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">📅 Attendance & Access</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
            <li>Membership ID or QR code must be scanned at entry.</li>
            <li>Missed personal training sessions must be rescheduled 24 hours in advance.</li>
            <li>Unauthorized access or sharing of member credentials is prohibited.</li>
          </ul>
        </div>

        {/* Health & Safety */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">❤️ Health & Safety</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
            <li>Do not use the gym if you are feeling unwell or injured.</li>
            <li>Sanitize equipment after each use.</li>
            <li>Report broken equipment or injuries to staff immediately.</li>
          </ul>
        </div>

        {/* Payment & Refunds */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">💳 Payment & Refund Policy</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
            <li>All payments are non-refundable once the membership has started.</li>
            <li>In case of medical emergencies, memberships may be paused with proper documentation.</li>
            <li>All prices are subject to change with prior notice.</li>
          </ul>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">🔒 Privacy Policy</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
            <li>Member data is stored securely and never shared with third parties.</li>
            <li>Photos/videos may be taken for promotional use with your permission.</li>
            <li>You can request access or removal of your personal data at any time.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Policies;
