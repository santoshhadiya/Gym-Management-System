import React from 'react';

const Workout = () => {
  const workoutPlan = [
    {
      day: 'Monday',
      focus: 'Chest + Triceps',
      exercises: [
        'Bench Press – 4 sets x 10 reps',
        'Incline Dumbbell Press – 3 sets x 12 reps',
        'Tricep Dips – 3 sets x 15 reps',
        'Cable Flys – 3 sets x 15 reps',
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Back + Biceps',
      exercises: [
        'Lat Pulldown – 4 sets x 12 reps',
        'Barbell Row – 3 sets x 10 reps',
        'Dumbbell Curl – 3 sets x 12 reps',
        'Hammer Curl – 3 sets x 10 reps',
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Legs',
      exercises: [
        'Squats – 4 sets x 10 reps',
        'Leg Press – 3 sets x 12 reps',
        'Lunges – 3 sets x 15 reps',
        'Calf Raises – 3 sets x 20 reps',
      ],
    },
    {
      day: 'Thursday',
      focus: 'Shoulders',
      exercises: [
        'Overhead Press – 3 sets x 10 reps',
        'Lateral Raises – 3 sets x 15 reps',
        'Front Raises – 3 sets x 12 reps',
        'Shrugs – 4 sets x 20 reps',
      ],
    },
    {
      day: 'Friday',
      focus: 'Full Body + Core',
      exercises: [
        'Deadlifts – 4 sets x 8 reps',
        'Plank – 3 sets x 60 sec',
        'Russian Twists – 3 sets x 20 reps',
        'Mountain Climbers – 3 sets x 30 sec',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Your Weekly Workout Plan</h1>
      <p className="text-gray-600 mb-6">Follow this personalized workout routine assigned by your trainer.</p>

      <div className="space-y-6">
        {workoutPlan.map((dayPlan, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{dayPlan.day}</h2>
            <p className="text-sm text-gray-500 mb-3">Focus: {dayPlan.focus}</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {dayPlan.exercises.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workout;
