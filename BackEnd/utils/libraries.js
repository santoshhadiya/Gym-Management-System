// Predefined Exercise Library with Images
const isHosted=false
const BACKEND_URL=isHosted?"https://gym-management-system-backend-vive.onrender.com":"http://localhost:5000"

const EXERCISE_LIBRARY = [
  {
    id: 'ex_001',
    name: 'Push-ups',
    category: 'Chest',
    imageUrl: `${BACKEND_URL}/images/Pushups.png`,
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'ex_002',
    name: 'Pull-ups',
    category: 'Back',
    imageUrl: `${BACKEND_URL}/images/Pull-ups.png`,
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    id: 'ex_003',
    name: 'Squats',
    category: 'Legs',
    imageUrl: `${BACKEND_URL}/images/Squats.png`,
    defaultSets: 4,
    defaultReps: '12-15'
  },
  {
    id: 'ex_004',
    name: 'Deadlifts',
    category: 'Full Body',
    imageUrl: `${BACKEND_URL}/images/Deadlifts.png`,
    defaultSets: 4,
    defaultReps: '6-8'
  },
  {
    id: 'ex_005',
    name: 'Bench Press',
    category: 'Chest',
    imageUrl: `${BACKEND_URL}/images/Bench-Press.png`,
    defaultSets: 4,
    defaultReps: '8-10'
  },
  {
    id: 'ex_006',
    name: 'Shoulder Press',
    category: 'Shoulders',
    imageUrl: `${BACKEND_URL}/images/Shoulder-Press.png`,
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'ex_007',
    name: 'Bicep Curls',
    category: 'Arms',
    imageUrl: `${BACKEND_URL}/images/Bicep-Curls.png`,
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'ex_008',
    name: 'Tricep Dips',
    category: 'Arms',
    imageUrl: `${BACKEND_URL}/images/Tricep-Dips.png`,
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'ex_009',
    name: 'Lunges',
    category: 'Legs',
    imageUrl: `${BACKEND_URL}/images/Lunges.png`,
    defaultSets: 3,
    defaultReps: '12 each leg'
  },
  {
    id: 'ex_010',
    name: 'Plank',
    category: 'Core',
    imageUrl: `${BACKEND_URL}/images/Plank.png`,
    defaultSets: 3,
    defaultReps: '30-60 sec'
  },
  {
    id: 'ex_011',
    name: 'Running',
    category: 'Cardio',
    imageUrl: `${BACKEND_URL}/images/Running.png`,
    defaultSets: 1,
    defaultReps: '20-30 min'
  },
  {
    id: 'ex_012',
    name: 'Cycling',
    category: 'Cardio',
    imageUrl: `${BACKEND_URL}/images/Cycling.png`,
    defaultSets: 1,
    defaultReps: '30-45 min'
  },
  {
    id: 'ex_013',
    name: 'Jump Rope',
    category: 'Cardio',
    imageUrl: `${BACKEND_URL}/images/Jump-Rope.png`,
    defaultSets: 3,
    defaultReps: '2 min'
  },
  {
    id: 'ex_014',
    name: 'Burpees',
    category: 'Full Body',
    imageUrl: `${BACKEND_URL}/images/Burpees.png`,
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'ex_015',
    name: 'Mountain Climbers',
    category: 'Core',
    imageUrl: `${BACKEND_URL}/images/Mountain-Climbers.png`,
    defaultSets: 3,
    defaultReps: '30 sec'
  }
];


const FOOD_LIBRARY = [
  { id: 'food_001', name: 'Oatmeal', category: 'Breakfast', type: 'Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5yIDwWuPHACiJzyoTZG9Fdcw4Xo5XrOnxZQ&s', defaultQuantity: '1 cup' },
  { id: 'food_002', name: 'Eggs', category: 'Breakfast', type: 'Non-Veg', imageUrl: 'https://media.istockphoto.com/id/520889612/photo/boiled-eggs-in-bowl.jpg?s=612x612&w=0&k=20&c=wwes11nnPnZu7IFz6SSSjhsfoBK-ZcTFsqH9Em72ClA=', defaultQuantity: '2 eggs' },
  { id: 'food_003', name: 'Banana', category: 'Snacks', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop', defaultQuantity: '1 medium' },
  { id: 'food_004', name: 'Chicken Breast', category: 'Lunch', type: 'Non-Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWGVYaGA_psg7DLH9KeTS3mQIA_SRAKJpyvw&s', defaultQuantity: '150g' },
  { id: 'food_005', name: 'Brown Rice', category: 'Lunch', type: 'Veg', imageUrl: 'https://www.simplyrecipes.com/thmb/wQtSB9KMalQuG9VcB5Xk4qAlsTM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__simply_recipes__uploads__2019__08__HT-Stovetop-Brown-Rice-LEAD-2-805ee4ce64084a4c8414ce740569eeb5.jpg', defaultQuantity: '1 cup cooked' },
  { id: 'food_006', name: 'Broccoli', category: 'Lunch', type: 'Veg', imageUrl: 'https://distrapi.blob.core.windows.net/strapi-uploads/assets/Broccoli_advantages_and_Side_effects_fd3a3e00e8.jpg', defaultQuantity: '1 cup' },
  { id: 'food_007', name: 'Sweet Potato', category: 'Dinner', type: 'Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ3PLAu-Y_lx5QD6Imu5c7g7S7VCO2C2OsZA&s', defaultQuantity: '1 medium' },
  { id: 'food_008', name: 'Salmon', category: 'Dinner', type: 'Non-Veg', imageUrl: 'https://assets.epicurious.com/photos/62d6c5146b6e74298a39d06a/4:3/w_4031,h_3023,c_limit/BakedSalmon_RECIPE_04142022_9780_final.jpg', defaultQuantity: '150g' },
  { id: 'food_009', name: 'Greek Yogurt', category: 'Snacks', type: 'Veg', imageUrl: 'https://www.yummytummyaarthi.com/wp-content/uploads/2023/01/greek-yogurt-1.jpg', defaultQuantity: '1 cup' },
  { id: 'food_010', name: 'Almonds', category: 'Snacks', type: 'Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuPiWZ2nrKcsdGp7LHY2rOUuzzAXiVswMyOA&s', defaultQuantity: '30g' },
  { id: 'food_011', name: 'Avocado', category: 'Breakfast', type: 'Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwaNXdVT-4kYnxgSUsWb-bLCLMHpu2yUUU_g&s', defaultQuantity: '1/2 avocado' },
  { id: 'food_012', name: 'Quinoa', category: 'Lunch', type: 'Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD5SiZioduG-kL0AWx6F02tyJU9pvxj5Lofg&s', defaultQuantity: '1 cup cooked' },
  { id: 'food_013', name: 'Spinach', category: 'Lunch', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop', defaultQuantity: '2 cups' },
  { id: 'food_014', name: 'Protein Shake', category: 'Snacks', type: 'Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbu_a-VsWOI1eW0HufgnectuuhKJDrDz4bnQ&s', defaultQuantity: '1 scoop' },
  { id: 'food_015', name: 'Apple', category: 'Snacks', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop', defaultQuantity: '1 medium' },
  { id: 'food_016', name: 'Turkey Breast', category: 'Dinner', type: 'Non-Veg', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', defaultQuantity: '150g' },
  { id: 'food_017', name: 'Green Beans', category: 'Dinner', type: 'Veg', imageUrl: 'https://assets.clevelandclinic.org/transform/LargeFeatureImage/3671a1e9-a096-4e5f-9996-c200c7b986f0/green-Beans-Bowl-143219170-770x533-1_jpg', defaultQuantity: '1 cup' },
  { id: 'food_018', name: 'Cottage Cheese', category: 'Snacks', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop', defaultQuantity: '1 cup' },
  { id: 'food_019', name: 'Blueberries', category: 'Snacks', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop', defaultQuantity: '1/2 cup' },
  { id: 'food_020', name: 'Tofu', category: 'Lunch', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', defaultQuantity: '200g' },
  { id: 'food_021', name: 'Peanut Butter', category: 'Snacks', type: 'Veg', imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', defaultQuantity: '2 tbsp' },
  { id: 'food_022', name: 'Steak', category: 'Dinner', type: 'Non-Veg', imageUrl: 'https://media.istockphoto.com/id/587207508/photo/sliced-grilled-steak-ribeye-with-herb-butter.jpg?s=612x612&w=0&k=20&c=gm6Kg6rHYH0xWTF5oszm6NZ-hp9aPRbk9V1kvCr8MQI=', defaultQuantity: '200g' },
  { id: 'food_023', name: 'Whole Grain Bread', category: 'Breakfast', type: 'Veg', imageUrl: 'https://www.allrecipes.com/thmb/_piMRxT9zYHP39Lnz6-lObHzEWw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-6773-simple-whole-wheat-bread-DDMFS-4x3-B-969e7bce922948959cb9e85aa4b2ff0d.jpg', defaultQuantity: '2 slices' },
  { id: 'food_024', name: 'Hummus', category: 'Snacks', type: 'Veg', imageUrl: 'https://www.inspiredtaste.net/wp-content/uploads/2019/07/The-Best-Homemade-Hummus-Recipe-1200.jpg', defaultQuantity: '1/4 cup' },
  { id: 'food_025', name: 'Grilled Shrimp', category: 'Dinner', type: 'Non-Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR6zB0iYxjXklaiYQjrsaexJDiDMrT5rpvbg&s', defaultQuantity: '12 large' },
  { id: 'food_026', name: 'Pancakes', category: 'Breakfast', type: 'Veg', imageUrl: 'https://www.inspiredtaste.net/wp-content/uploads/2025/07/Pancake-Recipe-1.jpg', defaultQuantity: '3 medium' },
  { id: 'food_027', name: 'Tuna Salad', category: 'Lunch', type: 'Non-Veg', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzzKm1A4V-u9vSR2EZ4L9tXoGbUZ6HUijZdQ&s', defaultQuantity: '1 cup' },
   
];

module.exports = {
  EXERCISE_LIBRARY,
  FOOD_LIBRARY
};