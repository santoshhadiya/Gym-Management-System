import React, { useState } from 'react';

const Availability = () => {
  const [availability, setAvailability] = useState([
    { day: 'Monday', available: false, from: '', to: '' },
    { day: 'Tuesday', available: false, from: '', to: '' },
    { day: 'Wednesday', available: false, from: '', to: '' },
    { day: 'Thursday', available: false, from: '', to: '' },
    { day: 'Friday', available: false, from: '', to: '' },
    { day: 'Saturday', available: false, from: '', to: '' },
    { day: 'Sunday', available: false, from: '', to: '' },
  ]);

  const handleToggle = (index) => {
    const newAvailability = [...availability];
    newAvailability[index].available = !newAvailability[index].available;
    setAvailability(newAvailability);
  };

  const handleTimeChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleSave = () => {
    console.log('Saved availability:', availability);
    alert('Availability saved (mock only)');
    // TODO: Send to backend
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Manage Availability</h1>

      <div className="space-y-5">
        {availability.map((day, index) => (
          <div key={day.day} className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-32 font-medium">{day.day}</div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={day.available}
                onChange={() => handleToggle(index)}
              />
              <span className="text-sm text-gray-700">Available</span>
            </label>

            {day.available && (
              <div className="flex gap-3">
                <input
                  type="time"
                  value={day.from}
                  onChange={(e) => handleTimeChange(index, 'from', e.target.value)}
                  className="border px-3 py-1 rounded-md"
                  required
                />
                <span className="text-sm text-gray-600">to</span>
                <input
                  type="time"
                  value={day.to}
                  onChange={(e) => handleTimeChange(index, 'to', e.target.value)}
                  className="border px-3 py-1 rounded-md"
                  required
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Save Availability
      </button>
    </div>
  );
};

export default Availability;
