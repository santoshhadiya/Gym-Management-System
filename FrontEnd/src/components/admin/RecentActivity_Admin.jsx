import React from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

const RecentActivity_Admin = () => {
  const { colors, theme } = useTheme(); // Access custom colors and theme

  const recentActivities = [
    {
      time: "6:30 AM",
      title: "Completed Morning Cardio Session",
      // Dynamic icon coloring based on theme palette
      iconBg: colors.secondary, 
      iconColor: theme === 'dark' ? '#fff' : '#1e3a8a',
      icon: "fa-solid fa-heart-pulse",
    },
    {
      time: "12:00 PM",
      title: "Completed Strength Training Circuit",
      iconBg: colors.accent,
      iconColor: theme === 'dark' ? '#fff' : '#854d0e',
      icon: "fa-solid fa-dumbbell",
    },
    {
      time: "2:00 PM",
      title: "Finished Yoga Flow Class",
      iconBg: colors.primary,
      iconColor: '#111827',
      icon: "fa-solid fa-spa",
      duration: "20-minute",
      calories: "150 Cal",
      description: "Flexibility and mobility session focused on deep stretches",
    },
    {
      time: "7:30 PM",
      title: "Completed Core Strength Workout",
      iconBg: colors.secondary,
      iconColor: theme === 'dark' ? '#fff' : '#1e3a8a',
      icon: "fa-solid fa-person-running",
    },
  ];
 const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div 
      className="w-full border rounded-3xl p-6 shadow-sm transition-colors duration-300"
      style={{
              backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
              borderColor: getTransparentColor(colors.border, 0.2),
              backdropFilter: 'blur(16px)', // Blur effect
              WebkitBackdropFilter: 'blur(16px)'
            }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.textMuted }}>
            <i className="fa-solid fa-clock-rotate-left text-sm"></i>
          </div>
          <h2 className="text-md font-semibold" style={{ color: colors.text }}>
            Recent Activity
          </h2>
        </div>
        <button className="hover:opacity-70 transition-colors text-xl leading-none pb-2" style={{ color: colors.textMuted }}>
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      </div>

      <div className="space-y-0">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex gap-4 group">
            {/* Icon Column */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-md z-10 transition-colors"
                style={{ backgroundColor: activity.iconBg, color: activity.iconColor }}
              >
                <i className={activity.icon}></i>
              </div>
              {/* Vertical Line */}
              {index !== recentActivities.length - 1 && (
                <div className="w-px h-full my-1" style={{ backgroundColor: colors.border }}></div>
              )}
            </div>

            {/* Content Column */}
            <div className={`flex-1 pb-8 ${index === recentActivities.length - 1 ? 'pb-0' : ''}`}>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>
                {activity.time}
              </p>
              <p className="font-medium text-sm" style={{ color: colors.text }}>
                {activity.title}
              </p>

              {/* Extra details (Yoga only) */}
              {activity.duration && (
                <div 
                  className="mt-3 rounded-xl p-3 text-xs space-y-2 border transition-colors"
                  style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.textMuted }}
                >
                  <div className="flex gap-4 font-medium" style={{ color: colors.text }}>
                    <span><i className="fa-regular fa-clock mr-1" style={{ color: colors.secondary }}></i> {activity.duration}</span>
                    <span><i className="fa-solid fa-fire mr-1" style={{ color: colors.accent }}></i> {activity.calories}</span>
                  </div>
                  <p className="leading-relaxed" style={{ color: colors.textMuted }}>{activity.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity_Admin;