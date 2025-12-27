import React, { useState } from 'react';

const Booking = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      date: '2025-08-05',
      time: '6:00 AM',
      trainer: 'Amit Patel',
      status: 'Booked',
    },
    {
      id: 2,
      date: '2025-08-08',
      time: '7:30 PM',
      trainer: 'Riya Sharma',
      status: 'Booked',
    },
  ]);

  const [form, setForm] = useState({
    date: '',
    time: '',
    trainer: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.trainer) return;

    const newBooking = {
      id: Date.now(),
      ...form,
      status: 'Booked',
    };
    setBookings([newBooking, ...bookings]);
    setForm({ date: '', time: '', trainer: '' });
  };

  const cancelBooking = (id) => {
    setBookings(bookings.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Book a Session</h1>

      {/* Booking Form */}
      <form onSubmit={handleBooking} className="grid md:grid-cols-3 gap-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trainer</label>
          <select
            name="trainer"
            value={form.trainer}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            required
          >
            <option value="">Select Trainer</option>
            <option value="Amit Patel">Amit Patel</option>
            <option value="Riya Sharma">Riya Sharma</option>
            <option value="Rohan Mehta">Rohan Mehta</option>
          </select>
        </div>
        <div className="md:col-span-3 text-right">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Book Session
          </button>
        </div>
      </form>

      {/* Session List */}
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Upcoming Sessions</h2>
      <div className="overflow-x-auto">
        <table className="w-full border text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Time</th>
              <th className="py-2 px-4">Trainer</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="py-2 px-4">{b.date}</td>
                <td className="py-2 px-4">{b.time}</td>
                <td className="py-2 px-4">{b.trainer}</td>
                <td className="py-2 px-4">{b.status}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                  {/* Add reschedule logic if needed */}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td className="py-4 px-4 text-gray-500" colSpan="5">
                  No sessions booked yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Booking;
