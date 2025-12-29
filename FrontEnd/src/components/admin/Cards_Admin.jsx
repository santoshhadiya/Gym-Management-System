import React from 'react'

const Cards_Admin = () => {
  
  const statsData = [
    {
      title: "Total Trainers",
      value: 520,
      suffix: "Trainers",
      subtitle: "Active trainers",
      icon: "fa-solid fa-user-tie",
    },
    {
      title: "Pending verifications",
      value: 5,
      suffix: "Requests",
      subtitle: "Waiting for review",
      icon: "fa-solid fa-file-contract",
    },
    {
      title: "Total Sessions",
      value: 20,
      suffix: "Sessions",
      subtitle: "This month activity",
      icon: "fa-solid fa-stopwatch",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden lg:w-[200px]"
          >
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <div className="h-8 rounded-full  flex items-center justify-center text-gray-400">
                <i className={`${item.icon} text-sm`}></i>
              </div>
              <p className="text-sm font-medium">
                {item.title}
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-700">
              {item.value}{" "}
              <span className="text-lg font-medium text-gray-600">
                {item.suffix}
              </span>
            </h2>

            <p className="text-sm text-gray-400 mt-4">
              {item.subtitle}
            </p>


          </div>
        ))}
      </div>
    </div>
  )
}

export default Cards_Admin