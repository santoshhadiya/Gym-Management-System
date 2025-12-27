import React, { useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Santosh Hadiya',
    email: 'santosh@example.com',
    phone: '9876543210',
    age: 20,
    gender: 'Male',
  });

  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // You can send this to backend here
    console.log('Updated Profile:', profile);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-red-600">My Profile</h1>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Edit
          </button>
        ) : null}
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-4">
          ✅ Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block font-medium text-gray-700">Full Name</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          ) : (
            <p className="text-gray-800">{profile.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-gray-700">Email</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          ) : (
            <p className="text-gray-800">{profile.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium text-gray-700">Phone</label>
          {editMode ? (
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          ) : (
            <p className="text-gray-800">{profile.phone}</p>
          )}
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">Age</label>
            {editMode ? (
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
              />
            ) : (
              <p className="text-gray-800">{profile.age}</p>
            )}
          </div>
          <div>
            <label className="block font-medium text-gray-700">Gender</label>
            {editMode ? (
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-800">{profile.gender}</p>
            )}
          </div>
        </div>

        {/* Save / Cancel */}
        {editMode && (
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
