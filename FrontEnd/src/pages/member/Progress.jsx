import React from 'react';

const Progress = () => {
  const progressData = {
    startingWeight: 65,
    currentWeight: 61,
    muscleGain: '2.5 kg',
    bodyFatReduction: '3%',
    months: 2,
    comments: 'Great job staying consistent! Keep pushing your limits.',
  };

  const weightDiff = progressData.startingWeight - progressData.currentWeight;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Your Progress Report</h1>
      <p className="text-gray-600 mb-6">This is your fitness journey so far.</p>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Weight Change</h2>
          <p className="text-2xl font-bold text-green-900">
            {progressData.startingWeight} kg → {progressData.currentWeight} kg
          </p>
          <p className="text-sm text-green-600">Lost {weightDiff} kg in {progressData.months} months</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Muscle Gain</h2>
          <p className="text-2xl font-bold text-blue-900">{progressData.muscleGain}</p>
          <p className="text-sm text-blue-600">Targeted training is working well!</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">Body Fat Reduction</h2>
          <p className="text-2xl font-bold text-yellow-900">{progressData.bodyFatReduction}</p>
          <p className="text-sm text-yellow-600">Fat levels are improving 💪</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Trainer's Note</h2>
          <p className="text-sm text-gray-600">{progressData.comments}</p>
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-red-50 p-6 rounded-xl border text-center">
        <h3 className="text-xl font-bold text-red-600 mb-2">Keep Going!</h3>
        <p className="text-gray-700">Progress is not about perfection — it's about consistency. You're doing amazing! 🎯</p>
      </div>
    </div>
  );
};

export default Progress;
