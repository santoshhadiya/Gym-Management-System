import React from 'react';

const Gallery = () => {
  const images = [
    "https://images.unsplash.com/photo-1554284126-aa88f22d8b74",
    "https://images.unsplash.com/photo-1571731956672-c201b8249a67",
    "https://images.unsplash.com/photo-1571019613914-85f342cdd3d4",
    "https://images.unsplash.com/photo-1583454110550-0ec6bf8a75f1",
    "https://images.unsplash.com/photo-1603094927901-bd4b81e7d056",
    "https://images.unsplash.com/photo-1608131623985-eae9c83b2097",
    "https://images.unsplash.com/photo-1612255770017-1d932a6ccdc4",
    "https://images.unsplash.com/photo-1594737625785-cd4475f8fc0e",
    "https://images.unsplash.com/photo-1616105514713-6a466e7087a6",
  ];

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-16 text-gray-800">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Gym Gallery</h1>
        <p className="text-lg text-gray-600">
          Explore moments from our facility, members in action, and achievements at Songar’s Gym.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl shadow-md transform hover:scale-105 transition duration-300"
          >
            <img
              src={`${url}?auto=format&fit=crop&w=800&q=80`}
              alt={`Gym Image ${idx + 1}`}
              className="w-full h-64 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
