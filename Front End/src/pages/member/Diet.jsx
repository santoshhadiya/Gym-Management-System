import React from 'react';

const dietPlan = {
  Monday: {
    Breakfast: 'Oats with banana & honey + green tea',
    Lunch: 'Grilled chicken breast, brown rice, salad',
    Dinner: 'Vegetable soup, 1 roti, paneer curry',
    Snack: 'Protein shake + almonds',
  },
  Tuesday: {
    Breakfast: 'Boiled eggs + whole grain toast',
    Lunch: 'Fish curry + quinoa + boiled veggies',
    Dinner: 'Khichdi + curd + cucumber salad',
    Snack: 'Fruit salad or 1 apple',
  },
  Wednesday: {
    Breakfast: 'Upma with veggies + buttermilk',
    Lunch: 'Tofu stir-fry + brown rice',
    Dinner: 'Mixed lentil soup + 1 multigrain roti',
    Snack: 'Peanut butter toast',
  },
  Thursday: {
    Breakfast: 'Smoothie (banana, oats, milk)',
    Lunch: 'Paneer tikka + mixed grain roti',
    Dinner: 'Grilled vegetables + soup',
    Snack: 'Handful of roasted chickpeas',
  },
  Friday: {
    Breakfast: 'Poha + black coffee',
    Lunch: 'Rajma + brown rice + salad',
    Dinner: 'Boiled egg curry + roti',
    Snack: 'Low-fat yogurt + flax seeds',
  },
  Saturday: {
    Breakfast: 'Scrambled eggs + fruit juice',
    Lunch: 'Chole + jeera rice + salad',
    Dinner: 'Sautéed vegetables + oats roti',
    Snack: 'Banana or protein bar',
  },
  Sunday: {
    Breakfast: 'Muesli with milk + dry fruits',
    Lunch: 'Grilled sandwich + soup',
    Dinner: 'Vegetable pulao + raita',
    Snack: 'Coconut water + peanuts',
  },
};

const Diet = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Your Weekly Diet Plan</h1>

      <div className="space-y-6">
        {Object.entries(dietPlan).map(([day, meals]) => (
          <div key={day} className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-red-500 mb-2">{day}</h2>
            <ul className="text-gray-700 space-y-1">
              <li><strong>🍽️ Breakfast:</strong> {meals.Breakfast}</li>
              <li><strong>🥗 Lunch:</strong> {meals.Lunch}</li>
              <li><strong>🍛 Dinner:</strong> {meals.Dinner}</li>
              <li><strong>🥤 Snack:</strong> {meals.Snack}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diet;
