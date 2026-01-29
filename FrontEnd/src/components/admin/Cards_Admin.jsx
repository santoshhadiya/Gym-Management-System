import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const Cards_Admin = () => {
  const { api } = useGlobalContext();
  
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
          api.get("/sessions"), // Fetches all sessions
          api.get("/members")
        ]);

        // Filter for Upcoming sessions only
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
      title: "Upcoming Sessions", // Updated Label
      value: stats.upcomingSessions, // Updated Value
      suffix: "Sessions",
      subtitle: "Scheduled classes",
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
              <div className="h-8 rounded-full flex items-center justify-center text-gray-400">
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
  );
};

export default Cards_Admin;