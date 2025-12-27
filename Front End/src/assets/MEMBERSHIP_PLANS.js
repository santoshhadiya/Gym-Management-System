const MEMBERSHIP_PLANS = [
  {
    id: 1,
    planName: "Silver Fitness",
    type: "Monthly",
    price: 1500, 
    durationInDays: 30,
    description: "Perfect for beginners who want to try out the gym without a long-term commitment.",
    features: [
      "Access to Gym Floor (6 AM - 10 PM)",
      "General Cardio Section",
      "Locker Room Access",
      "Free WiFi"
    ]
  },
  {
    id: 2,
    planName: "Gold Transformation",
    type: "Quarterly",
    price: 4000, 
    durationInDays: 90,
    description: "Our most popular plan for those committed to a 3-month body transformation.",
    features: [
      "24/7 Access to Gym Floor",
      "All Cardio & Strength Equipment",
      "2 Personal Training Sessions",
      "Steam Bath & Sauna Access",
      "Diet Consultation (Once a month)"
    ]
  },
  {
    id: 3,
    planName: "Platinum Elite",
    type: "Annual",
    price: 12000, 
    durationInDays: 365,
    description: "The ultimate package for serious fitness enthusiasts with VIP perks.",
    features: [
      "24/7 Unlimited Access",
      "Priority Access to Equipment",
      "Weekly Personal Training Session",
      "Unlimited Steam & Sauna",
      "Free Gym Merchandise (T-shirt & Shaker)",
      "Nutritionist On-Call Support",
      "Guest Pass (2 per month)"
    ]
  }
];

export default MEMBERSHIP_PLANS;