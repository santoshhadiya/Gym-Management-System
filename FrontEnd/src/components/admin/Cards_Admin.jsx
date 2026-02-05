import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

const Cards_Admin = () => {
  const { api } = useGlobalContext();
  const { colors } = useTheme(); // Access custom colors

  const [stats, setStats] = useState({
    trainers: 0,
    upcomingSessions: 0,
    members: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [trainersRes, sessionsRes, membersRes] = await Promise.all([
          api.get("/trainers"),
          api.get("/sessions"),
          api.get("/members")
        ]);

        const upcomingCount = sessionsRes.data.filter(s => s.status === 'Upcoming').length;

        setStats({
          trainers: trainersRes.data.length,
          upcomingSessions: upcomingCount,
          members: membersRes.data.length
        });

      } catch (error) {
        console.error("Dashboard Stats Error:", error);
      }
    };

    fetchStats();
  }, [api]);

  const statsData = [
    {
      title: "Total Trainers",
      value: stats.trainers,
      suffix: "Trainers",
      subtitle: "Active trainers",
      icon: "fa-solid fa-user-tie",
    },
    {
      title: "Total Members",
      value: stats.members,
      suffix: "Members",
      subtitle: "Registered users",
      icon: "fa-solid fa-users",
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      suffix: "Sessions",
      subtitle: "Scheduled classes",
      icon: "fa-solid fa-stopwatch",
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
    <div className="w-full"

    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((item, index) => (
          <div
            key={index}
            className="border rounded-3xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden lg:w-[100%]"
            style={{
              backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
              borderColor: getTransparentColor(colors.border, 0.2),
              backdropFilter: 'blur(16px)', // Blur effect
              WebkitBackdropFilter: 'blur(16px)'
            }}
            // Dynamic styling
          >
            <div className="flex items-center gap-2 mb-4" style={{ color: colors.textMuted }}>
              <div className="h-8 rounded-full flex items-center justify-center">
                <i className={`${item.icon} text-sm`}></i>
              </div>
              <p className="text-sm font-medium">
                {item.title}
              </p>
            </div>

            <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
              {item.value}{" "}
              <span className="text-lg font-medium" style={{ color: colors.textMuted }}>
                {item.suffix}
              </span>
            </h2>

            <p className="text-sm mt-4" style={{ color: colors.textMuted }}>
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards_Admin;