import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

const BottomSectionDashbord_Admin = () => {
  const { api } = useGlobalContext();
  const [newMembers, setNewMembers] = useState([]);

  useEffect(() => {
    const fetchNewMembers = async () => {
      try {
        const res = await api.get("/members");
        // Sort by joinDate desc and take top 5
        const sorted = res.data
          .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
          .slice(0, 5);
        
        setNewMembers(sorted);
      } catch (error) {
        console.error("Failed to fetch new members", error);
      }
    };
    fetchNewMembers();
  }, [api]);

  // Keep reviews static as there is no backend for them yet
  const reviewsData = [
    {
      name: "Sarah Johnson",
      rating: "5/5",
      image: "https://i.pravatar.cc/100?img=1",
      review: "Great progress in strength and fitness!",
    },
    {
      name: "Michael Brown",
      rating: "4.7/5",
      image: "https://i.pravatar.cc/100?img=2",
      review: "Fantastic trainers and productive sessions.",
    },
    {
      name: "Lisa Parker",
      rating: "4.9/5",
      image: "https://i.pravatar.cc/100?img=3",
      review: "Transformed my fitness journey completely.",
    },
  ];

  return (
    <div className="mt-8 flex flex-col gap-8">

      {/* Reviews */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6 pl-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#FEEF75]">
            <i className="fa-solid fa-star text-sm"></i>
          </div>
          <h2 className="text-md font-semibold text-gray-800">Reviews</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsData.map((review, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <div>
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  <p className="text-sm text-yellow-500 flex items-center gap-1">
                    <i className="fa-solid fa-star"></i> {review.rating}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed italic">"{review.review}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Members */}
      <div className="w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#CDE7FE]">
              <i className="fa-solid fa-user-plus text-sm"></i>
            </div>
            <h2 className="text-md font-semibold text-gray-800">New Members</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {newMembers.length > 0 ? newMembers.map((member, index) => (
            <div key={index} className="group border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all rounded-2xl p-4 text-center cursor-pointer bg-white">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-blue-50 mb-3 group-hover:scale-110 transition-transform`}>
                <img src={member.image || `https://ui-avatars.com/api/?name=${member.name}`} alt={member.name} className="w-14 h-14 rounded-xl object-cover" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{member.name}</h3>
              <p className="text-xs text-gray-400 mb-3 truncate">{member.email}</p>
              <div className="inline-block text-[10px] font-medium px-2 py-1 rounded-md bg-gray-50 text-gray-500 border border-gray-200">
                {member.plan?.name || "No Plan"}
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-sm col-span-5 text-center">No members found.</p>
          )}
        </div>
      </div>

    </div>
  )
}

export default BottomSectionDashbord_Admin;