import React, { useState } from "react";

const ManageBooking = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      member: "Riya Patel",
      date: "2025-08-02",
      service: "Zumba Class",
      status: "Pending",
    },
    {
      id: 2,
      member: "Amit Sharma",
      date: "2025-08-03",
      service: "Personal Training",
      status: "Pending",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status: newStatus } : b
    );
    setBookings(updated);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Manage Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings available.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gray-50 p-4 rounded shadow-sm border flex flex-col md:flex-row justify-between items-center"
            >
              <div className="mb-2 md:mb-0">
                <div className="font-semibold text-lg">{booking.member}</div>
                <div className="text-sm text-gray-600">{booking.service}</div>
                <div className="text-sm text-gray-500">
                  Date: {booking.date}
                </div>
                <div className="text-sm">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      booking.status === "Approved"
                        ? "text-green-600"
                        : booking.status === "Cancelled"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {booking.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(booking.id, "Approved")}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(booking.id, "Cancelled")}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBooking;
