import React, { useState } from "react";

const ManageOffers = () => {
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "New Year Offer",
      description: "Get 20% off on yearly membership!",
      validTill: "2025-12-31",
    },
    {
      id: 2,
      title: "Student Special",
      description: "Flat ₹500 off on monthly plans for students.",
      validTill: "2025-10-01",
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validTill, setValidTill] = useState("");

  const handleAdd = () => {
    if (!title || !description || !validTill) {
      alert("All fields are required");
      return;
    }

    const newOffer = {
      id: Date.now(),
      title,
      description,
      validTill,
    };

    setOffers([newOffer, ...offers]);
    setTitle("");
    setDescription("");
    setValidTill("");
  };

  const handleDelete = (id) => {
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Manage Offers</h1>

      {/* Add New Offer */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded mt-1"
            placeholder="Offer Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded mt-1"
            placeholder="Offer Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label className="block font-medium">Valid Till</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded mt-1"
            value={validTill}
            onChange={(e) => setValidTill(e.target.value)}
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add Offer
        </button>
      </div>

      {/* Offer List */}
      {offers.length === 0 ? (
        <p className="text-gray-500">No offers available.</p>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border p-4 rounded-lg shadow-sm flex justify-between items-start bg-gray-50"
            >
              <div>
                <h2 className="text-lg font-semibold">{offer.title}</h2>
                <p className="text-gray-700 mb-1">{offer.description}</p>
                <p className="text-sm text-gray-500">
                  Valid Till: {offer.validTill}
                </p>
              </div>
              <button
                onClick={() => handleDelete(offer.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOffers;
