import React from 'react';

const DietPlans = () => {
  const diet = {
    day: 'Monday',
    goal: 'Weight Loss',
    meals: [
      {
        name: 'Breakfast',
        items: ['Oats with skim milk', '1 boiled egg', 'Green tea'],
      },
      {
        name: 'Mid-Morning Snack',
        items: ['1 apple', 'Handful of almonds'],
      },
      {
        name: 'Lunch',
        items: ['Grilled chicken (150g)', 'Brown rice (1 cup)', 'Salad'],
      },
      {
        name: 'Evening Snack',
        items: ['Protein shake', '1 banana'],
      },
      {
        name: 'Dinner',
        items: ['Paneer (100g)', 'Steamed vegetables', 'Whole wheat roti (1)'],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Your Diet Plan</h1>
      <p className="text-gray-600 mb-2">
        <strong>Day:</strong> {diet.day} | <strong>Goal:</strong> {diet.goal}
      </p>

      <div className="space-y-6 mt-6">
        {diet.meals.map((meal, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{meal.name}</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {meal.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietPlans;
