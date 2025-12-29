import React from 'react'


const RecentActivity_Admin = () => {
  const recentActivities = [
    {
      time: "6:30 AM",
      title: "Completed Morning Cardio Session",
      iconBg: "bg-[#CDE7FE] text-white",
      icon: "fa-solid fa-heart-pulse", // Font Awesome class
    },
    {
      time: "12:00 PM",
      title: "Completed Strength Training Circuit",
      iconBg: "bg-[#FEEF75] text-white",
      icon: "fa-solid fa-dumbbell", // Font Awesome class
    },
    {
      time: "2:00 PM",
      title: "Finished Yoga Flow Class",
      iconBg: "bg-[#D9F17F] text-white",
      icon: "fa-solid fa-spa", // Font Awesome class
      duration: "20-minute",
      calories: "150 Cal",
      description:
        "Flexibility and mobility session focused on deep stretches",
    },
    {
      time: "7:30 PM",
      title: "Completed Core Strength Workout",
      iconBg: "bg-[#CDE7FE] text-white",
      icon: "fa-solid fa-person-running", // Font Awesome class
    },
  ];
  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full  flex items-center justify-center text-gray-400">
                      <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                  </div>
                  <h2 className="text-md font-semibold text-gray-800">
                    Recent Activity
                  </h2>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none pb-2">
                <i className="fa-solid fa-ellipsis"></i>
              </button>
            </div>

            <div className="space-y-0">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-4 group">
                  {/* Icon Column */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-md ${activity.iconBg} z-10`}
                    >
                      {/* Using Font Awesome Icon Here */}
                      <i className={activity.icon}></i>
                    </div>
                    {/* Vertical Line */}
                    {index !== recentActivities.length - 1 && (
                       <div className="w-px h-full bg-gray-200 my-1"></div>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className={`flex-1 pb-8 ${index === recentActivities.length - 1 ? 'pb-0' : ''}`}>
                    <p className="text-xs text-gray-400 mb-1">
                      {activity.time}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {activity.title}
                    </p>

                    {/* Extra details (Yoga only) */}
                    {activity.duration && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-2">
                        <div className="flex gap-4 font-medium text-gray-700">
                          <span><i className="fa-regular fa-clock mr-1"></i> {activity.duration}</span>
                          <span><i className="fa-solid fa-fire mr-1 text-orange-500"></i> {activity.calories}</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">{activity.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
  )
}

export default RecentActivity_Admin