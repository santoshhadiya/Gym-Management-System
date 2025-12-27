import React from 'react';

const Trainers = () => {
  const trainerList = [
    {
      name: 'Amit Patel',
      specialization: 'Strength & Conditioning',
      experience: '5+ years',
      image: 'https://images.unsplash.com/photo-1600180758890-6e4c20e04c35',
    },
    {
      name: 'Riya Sharma',
      specialization: 'Yoga & Flexibility',
      experience: '4+ years',
      image: 'https://images.unsplash.com/photo-1606335543042-578244e89425',
    },
    {
      name: 'Rohan Mehta',
      specialization: 'Weight Loss & HIIT',
      experience: '6+ years',
      image: 'https://images.unsplash.com/photo-1588776814546-ec7ee622daa3',
    },
    {
      name: 'Sneha Desai',
      specialization: 'Nutrition & Wellness',
      experience: '3+ years',
      image: 'https://images.unsplash.com/photo-1611703373356-5e50f9df63f3',
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-16 text-gray-800">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Meet Our Trainers</h1>
        <p className="text-lg text-gray-600">
          Passionate. Certified. Dedicated to your transformation.
        </p>
      </div>

      {/* Trainer Cards */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {trainerList.map((trainer, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
          >
            <img
              src={`${trainer.image}?auto=format&fit=crop&w=600&q=80`}
              alt={trainer.name}
              className="h-64 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-800">{trainer.name}</h2>
              <p className="text-sm text-red-600 font-medium mb-1">{trainer.specialization}</p>
              <p className="text-gray-600 text-sm">Experience: {trainer.experience}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trainers;
