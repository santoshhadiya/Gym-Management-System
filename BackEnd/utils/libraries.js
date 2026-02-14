// Predefined Exercise Library with Images
const EXERCISE_LIBRARY = [
  {
    id: 'ex_001',
    name: 'Push-ups',
    category: 'Chest',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'ex_002',
    name: 'Pull-ups',
    category: 'Back',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    id: 'ex_003',
    name: 'Squats',
    category: 'Legs',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
    defaultSets: 4,
    defaultReps: '12-15'
  },
  {
    id: 'ex_004',
    name: 'Deadlifts',
    category: 'Full Body',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    defaultSets: 4,
    defaultReps: '6-8'
  },
  {
    id: 'ex_005',
    name: 'Bench Press',
    category: 'Chest',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop',
    defaultSets: 4,
    defaultReps: '8-10'
  },
  {
    id: 'ex_006',
    name: 'Shoulder Press',
    category: 'Shoulders',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'ex_007',
    name: 'Bicep Curls',
    category: 'Arms',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'ex_008',
    name: 'Tricep Dips',
    category: 'Arms',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'ex_009',
    name: 'Lunges',
    category: 'Legs',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '12 each leg'
  },
  {
    id: 'ex_010',
    name: 'Plank',
    category: 'Core',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '30-60 sec'
  },
  {
    id: 'ex_011',
    name: 'Running',
    category: 'Cardio',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop',
    defaultSets: 1,
    defaultReps: '20-30 min'
  },
  {
    id: 'ex_012',
    name: 'Cycling',
    category: 'Cardio',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    defaultSets: 1,
    defaultReps: '30-45 min'
  },
  {
    id: 'ex_013',
    name: 'Jump Rope',
    category: 'Cardio',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '2 min'
  },
  {
    id: 'ex_014',
    name: 'Burpees',
    category: 'Full Body',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'ex_015',
    name: 'Mountain Climbers',
    category: 'Core',
    imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: '30 sec'
  }
];

// Predefined Food Library with Images
const FOOD_LIBRARY = [
  {
    id: 'food_001',
    name: 'Oatmeal',
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup'
  },
  {
    id: 'food_002',
    name: 'Eggs',
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
    defaultQuantity: '2 eggs'
  },
  {
    id: 'food_003',
    name: 'Banana',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    defaultQuantity: '1 medium'
  },
  {
    id: 'food_004',
    name: 'Chicken Breast',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    defaultQuantity: '150g'
  },
  {
    id: 'food_005',
    name: 'Brown Rice',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup cooked'
  },
  {
    id: 'food_006',
    name: 'Broccoli',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup'
  },
  {
    id: 'food_007',
    name: 'Sweet Potato',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&h=300&fit=crop',
    defaultQuantity: '1 medium'
  },
  {
    id: 'food_008',
    name: 'Salmon',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
    defaultQuantity: '150g'
  },
  {
    id: 'food_009',
    name: 'Greek Yogurt',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup'
  },
  {
    id: 'food_010',
    name: 'Almonds',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop',
    defaultQuantity: '30g'
  },
  {
    id: 'food_011',
    name: 'Avocado',
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
    defaultQuantity: '1/2 avocado'
  },
  {
    id: 'food_012',
    name: 'Quinoa',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup cooked'
  },
  {
    id: 'food_013',
    name: 'Spinach',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
    defaultQuantity: '2 cups'
  },
  {
    id: 'food_014',
    name: 'Protein Shake',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&h=300&fit=crop',
    defaultQuantity: '1 scoop'
  },
  {
    id: 'food_015',
    name: 'Apple',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
    defaultQuantity: '1 medium'
  },
  {
    id: 'food_016',
    name: 'Turkey Breast',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    defaultQuantity: '150g'
  },
  {
    id: 'food_017',
    name: 'Green Beans',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup'
  },
  {
    id: 'food_018',
    name: 'Cottage Cheese',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop',
    defaultQuantity: '1 cup'
  }
];

module.exports = {
  EXERCISE_LIBRARY,
  FOOD_LIBRARY
};