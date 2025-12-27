import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-100 text-gray-800">
      {/* 🔥 Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 text-center text-white px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">Welcome to Songar's GYM</h1>
          <p className="text-xl md:text-2xl mb-8">Transform your body. Elevate your mindset. Redefine your life.</p>
          <div className="space-x-4">
            <Link to="/visitor/plans">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg transition">Join Now</button>
            </Link>
            <Link to="/visitor/services">
              <button className="bg-white text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-6 py-3 rounded-lg text-lg transition">Explore Services</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 💪 Gym Introduction */}
      <section className="py-20 px-4 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-600">Why Choose Songar's Gym?</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          At Songar's Gym, we believe fitness is a lifestyle. Whether you're a beginner or a seasoned athlete, our expert trainers,
          top-tier equipment, and community support will help you achieve your goals faster and better.
        </p>
      </section>

      {/* 🏆 Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-4">
          <div className="text-center">
            <div className="text-4xl mb-3">🧑‍🏫</div>
            <h3 className="text-xl font-semibold mb-2">Expert Trainers</h3>
            <p className="text-gray-600">Certified and passionate professionals guiding your journey.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🏋️‍♀️</div>
            <h3 className="text-xl font-semibold mb-2">Modern Equipment</h3>
            <p className="text-gray-600">State-of-the-art machines for strength, cardio, and conditioning.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Personalized dashboards to track diet, workouts, and milestones.</p>
          </div>
        </div>
      </section>

      {/* 📞 Call To Action */}
      <section className="py-16 bg-red-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your fitness journey?</h2>
        <p className="text-lg mb-6">Join now and start your transformation with Songar's Gym.</p>
        <Link to="/visitor/contact">
          <button className="bg-white text-red-600 px-6 py-3 text-lg font-medium rounded-lg hover:bg-gray-100 transition">
            Contact Us
          </button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
