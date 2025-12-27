import React from 'react';

const About = () => {
  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen px-6 py-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">About Songar's Gym</h1>
        <p className="text-lg text-gray-700">
          Empowering lives through fitness, discipline, and transformation.
        </p>
      </div>

      {/* Gym Story Section */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 mb-16 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Journey</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Founded by fitness expert <strong>Manthan Prajapati</strong>, Songar's Gym started with a vision to create
            a community-driven space where individuals can pursue their fitness goals with purpose and support. Over the
            years, we’ve helped hundreds of members achieve life-changing results through expert guidance and modern facilities.
          </p>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1"
            alt="Gym interior"
            className="rounded-xl shadow-md w-full object-cover"
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 text-teal-600">🎯 Our Mission</h3>
          <p className="text-gray-700 text-lg">
            To provide an inclusive, motivational, and effective fitness experience that empowers people to become their
            strongest selves—physically and mentally.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 text-teal-600">👁️ Our Vision</h3>
          <p className="text-gray-700 text-lg">
            To be the leading community fitness center in Ahmedabad, known for innovation, results, and unmatched support.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-4 text-red-600 text-center">Our Core Values</h2>
        <ul className="grid md:grid-cols-3 gap-6 text-gray-700 text-lg list-disc list-inside bg-white rounded-xl p-6 shadow-md">
          <li>Integrity & Respect</li>
          <li>Commitment to Excellence</li>
          <li>Community & Support</li>
          <li>Innovation in Fitness</li>
          <li>Consistency & Discipline</li>
          <li>Member-Centered Approach</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
