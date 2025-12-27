import React from 'react';

const Services = () => {
  const services = [
    {
      title: 'Personal Training',
      description: 'One-on-one sessions with certified trainers tailored to your fitness goals.',
      icon: '💪',
    },
    {
      title: 'Group Classes',
      description: 'Zumba, Yoga, CrossFit and more group sessions to keep you motivated.',
      icon: '🤸‍♂️',
    },
    {
      title: 'Nutrition Plans',
      description: 'Custom diet plans curated by expert nutritionists.',
      icon: '🥗',
    },
    {
      title: 'Membership Plans',
      description: 'Flexible monthly, quarterly, and yearly membership options.',
      icon: '📆',
    },
  ];

  const facilities = [
    'Air-conditioned Workout Area',
    'Modern Cardio Equipment',
    'Free Weights & Machines',
    'Locker Rooms & Showers',
    'Music & LED TV Setup',
    'Filtered Water Station',
    'Steam & Sauna (Coming Soon)',
    'CCTV Security & Clean Environment',
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-red-600 mb-2">Our Services</h1>
        <p className="text-lg text-gray-600">Explore what Songar's Gym has to offer</p>
      </div>

      {/* Services */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">{service.icon}</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{service.title}</h2>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </section>

      {/* Facilities */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Our Facilities</h2>
        <ul className="list-disc list-inside space-y-3 text-lg bg-white p-6 rounded-xl shadow-md">
          {facilities.map((item, idx) => (
            <li key={idx} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Services;
