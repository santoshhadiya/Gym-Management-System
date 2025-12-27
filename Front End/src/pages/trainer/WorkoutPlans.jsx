import React, { useState } from 'react';

const WorkoutPlan = () => {
  const [member, setMember] = useState('');
  const [workout, setWorkout] = useState('');
  const [plans, setPlans] = useState([]);

  const dummyMembers = ['Ravi Patel', 'Priya Shah', 'Amit Joshi'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!member || !workout) {
      alert('Please fill in all fields');
      return;
    }

    const newPlan = {
      id: plans.length + 1,
      member,
      workout,
      date: new Date().toLocaleDateString(),
    };

    setPlans([newPlan, ...plans]);
    setMember('');
    setWorkout('');
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Workout Plan Assignment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Member</label>
          <select
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            value={member}
            onChange={(e) => setMember(e.target.value)}
            required
          >
            <option value="">-- Choose Member --</option>
            {dummyMembers.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Workout Plan</label>
          <textarea
            className="w-full border border-gray-300 px-3 py-2 rounded-md h-28"
            placeholder="e.g., Chest Day - 3 sets bench press, 3 sets incline fly, 3 sets pushups"
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Assign Workout
        </button>
      </form>

      {plans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Assigned Workout History</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Member</th>
                <th className="text-left px-3 py-2">Workout</th>
                <th className="text-left px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p, i) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">{p.member}</td>
                  <td className="px-3 py-2">{p.workout}</td>
                  <td className="px-3 py-2">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlan;
