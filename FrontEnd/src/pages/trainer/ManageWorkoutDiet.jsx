import React, { useState } from 'react';

const ManageWorkoutDiet = () => {
  const [selectedMember, setSelectedMember] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [dietPlan, setDietPlan] = useState('');

  const members = ['Ravi Patel', 'Priya Shah', 'Amit Joshi']; // Dummy names

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember || !workoutPlan || !dietPlan) {
      alert('Please fill in all fields.');
      return;
    }

    const plan = {
      member: selectedMember,
      workout: workoutPlan,
      diet: dietPlan,
    };

    console.log('Assigned Plan:', plan);
    alert('Workout and Diet Plan Assigned (demo)');
    
    // Reset
    setSelectedMember('');
    setWorkoutPlan('');
    setDietPlan('');
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Assign Workout & Diet Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Select Member */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">-- Choose Member --</option>
            {members.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Workout Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Workout Plan</label>
          <textarea
            value={workoutPlan}
            onChange={(e) => setWorkoutPlan(e.target.value)}
            placeholder="Enter workout routine..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-28"
            required
          />
        </div>

        {/* Diet Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diet Plan</label>
          <textarea
            value={dietPlan}
            onChange={(e) => setDietPlan(e.target.value)}
            placeholder="Enter diet instructions..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-28"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Assign Plan
        </button>
      </form>
    </div>
  );
};

export default ManageWorkoutDiet;
