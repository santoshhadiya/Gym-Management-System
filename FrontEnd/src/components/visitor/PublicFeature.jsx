import React from 'react'

const PublicFeature = () => {
  // 1. Define the features in a data object/array
  const features = [
    {
      id: 1,
      title: "Premium Equipment",
      description: "Train with the latest Technogym and Hammer Strength machines designed for peak performance.",
      icon: "fa-dumbbell",
      bgColor: "bg-[#CDE7FE]",
      textColor: "text-blue-600",
      borderColor: "hover:border-[#CDE7FE]"
    },
    {
      id: 2,
      title: "Expert Coaching",
      description: "Our certified personal trainers create custom plans to help you smash your fitness goals faster.",
      icon: "fa-user-clock",
      bgColor: "bg-[#FEEF75]",
      textColor: "text-yellow-700",
      borderColor: "hover:border-[#FEEF75]"
    },
    {
      id: 3,
      title: "24/7 Access",
      description: "Fitness on your schedule. Enjoy full access to our facilities any time of the day or night.",
      icon: "fa-key",
      bgColor: "bg-[#D9F17F]",
      textColor: "text-green-700",
      borderColor: "hover:border-[#D9F17F]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Choose Us?</h2>
          <p className="text-gray-500">We don't just provide equipment; we provide an environment for growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`group p-8 rounded-[2.5rem] bg-[#f8fbff] border border-transparent ${feature.borderColor} transition-all hover:shadow-xl cursor-pointer hover:-translate-y-2`}
            >
              <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center ${feature.textColor} text-2xl mb-6 shadow-sm`}>
                <i className={`fa-solid ${feature.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PublicFeature