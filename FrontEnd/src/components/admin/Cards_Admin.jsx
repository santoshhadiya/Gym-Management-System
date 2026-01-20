import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const Cards_Admin = () => {
  const [trainerCount, setTrainerCount] = useState(); 
  const {BACKEND_URL}=useGlobalContext()
  useEffect(() => {
    const fetchTrainerCount = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        if (!token) return; 

        const res = await fetch(
          `${BACKEND_URL}/api/admin/users?role=trainer` ,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Unauthorized or Failed to fetch");
        }

        const data = await res.json();
        
        if (Array.isArray(data)) {
            setTrainerCount(data.length);
        }

      } catch (error) {
        console.error("Trainer fetch error:", error);
      }
    };

    fetchTrainerCount();
  }, []);

  const statsData = [
    {
      title: "Total Trainers",
      value: trainerCount, // 3. Use the state variable here
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