import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useGlobalContext } from '../../context/GlobalContext';

const BottomSectionDashbord_Admin = () => {
  const { api } = useGlobalContext();
  const [newMembers, setNewMembers] = useState([]);
  const [reviews, setReviews] = useState([]); // State for reviews

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Members and Feedback in parallel
        const [membersRes, feedbackRes] = await Promise.all([
          api.get("/members"),
          api.get("/feedback") // Fetches from getAllFeedback controller
        ]);

        // Process Members (Sort by joinDate desc, take top 5)
        const sortedMembers = membersRes.data
          .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
          .slice(0, 5);
        setNewMembers(sortedMembers);

        // Process Reviews (Controller already returns formatted data, just take top 3)
        // Assuming backend returns newest first. If not, sort by date here.
        const recentReviews = feedbackRes.data.slice(0, 3);
        setReviews(recentReviews);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [api]);

  return (
    <div className="mt-8 flex flex-col gap-8">

      {/* Reviews Section */}
      <div className="w-full">
        <div className="flex justify-between items-end mb-6 pl-2 pr-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#FEEF75]">
              <i className="fa-solid fa-star text-sm"></i>
            </div>
            <h2 className="text-md font-semibold text-gray-800">Recent Reviews</h2>
          </div>
          
          {/* Navigation Link */}
          <Link to="/admin/feedbacks" className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 cursor-pointer">
            View All <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={review._id || index} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={review.avatar || `https://ui-avatars.com/api/?name=${review.member}&background=random`} 
                    alt={review.member} 
                    className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" 
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.member}</p>
                    <p className="text-xs text-yellow-500 flex items-center gap-1 font-bold">
                      <i className="fa-solid fa-star"></i> {review.rating}/5
                    </p>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed italic line-clamp-3 mb-3">"{review.message}"</p>
                
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-50">
                   <span className="text-[10px] text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                   <span className={`text-[10px] px-2 py-1 rounded ${review.type === 'Trainer' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                      {review.type}
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-400 text-sm">No reviews submitted yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Members Section */}
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
            <p className="text-gray-400 text-sm col-span-5 text-center">No new members found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BottomSectionDashbord_Admin;