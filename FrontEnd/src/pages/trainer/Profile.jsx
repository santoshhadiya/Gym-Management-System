import React, { useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.trainer@example.com',
    phone: '9876543210',
    specialization: 'Weight Training',
    bio: 'Passionate trainer with 5+ years of experience.',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // TODO: Connect to backend API to save updated profile
    console.log('Updated Profile:', profile);
    setIsEditing(false);
    alert('Profile updated successfully (demo)');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Trainer Profile</h1>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium text-sm text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-sm text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium text-sm text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="block font-medium text-sm text-gray-700">Specialization</label>
          <input
            type="text"
            name="specialization"
            value={profile.specialization}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block font-medium text-sm text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          {isEditing ? (
            <>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
