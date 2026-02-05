import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

const BottomSectionDashbord_Admin = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const { colors, theme } = useTheme(); // Access custom colors and current theme
  const [newMembers, setNewMembers] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, feedbackRes] = await Promise.all([
          api.get("/members"),
          api.get("/feedback")
        ]);

        const sortedMembers = membersRes.data
          .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
          .slice(0, 5);
        setNewMembers(sortedMembers);

        const recentReviews = feedbackRes.data.slice(0, 3);
        setReviews(recentReviews);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [api]);

  // Helper to resolve image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/${path}`;
  };
 const getTransparentColor = (hex, opacity) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="mt-8 flex flex-col gap-8 transition-colors duration-300">

      {/* Reviews Section */}
      <div className="w-full">
        <div className="flex justify-between items-end mb-6 pl-2 pr-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.accent }}>
              <i className="fa-solid fa-star text-sm"></i>
            </div>
            <h2 className="text-md font-semibold" style={{ color: colors.text }}>Recent Reviews</h2>
          </div>

          <Link to="/admin/feedbacks" className="text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer" style={{ color: colors.textMuted }}>
            View All <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => {
              const avatarUrl = getImageUrl(review.avatar);

              return (
                <div
                  key={review._id || index}
                  className="rounded-3xl p-6 shadow-sm border transition-all flex flex-col h-full hover:shadow-md"
                  style={{
                    backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
                    borderColor: getTransparentColor(colors.border, 0.2),
                    backdropFilter: 'blur(16px)', // Blur effect
                    WebkitBackdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={avatarUrl || `https://ui-avatars.com/api/?name=${review.member}&background=random`}
                      alt={review.member}
                      className="w-12 h-12 rounded-full object-cover shadow-sm border"
                      style={{ borderColor: colors.border }}
                    />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: colors.text }}>{review.member}</p>
                      <p className="text-xs flex items-center gap-1 font-bold" style={{ color: colors.accent }}>
                        <i className="fa-solid fa-star"></i> {review.rating}/5
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed italic line-clamp-3 mb-3" style={{ color: colors.textMuted }}>"{review.message}"</p>

                  <div className="mt-auto flex justify-between items-center pt-3 border-t" style={{ borderColor: colors.border }}>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{new Date(review.date).toLocaleDateString()}</span>
                    <span
                      className="text-[10px] px-2 py-1 rounded"
                      style={{
                        backgroundColor: review.type === 'Trainer' ? colors.secondary : colors.background,
                        color: review.type === 'Trainer' ? (theme === 'dark' ? '#fff' : '#1e3a8a') : colors.textMuted
                      }}
                    >
                      {review.type}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className="col-span-3 text-center py-12 rounded-3xl border border-dashed"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <p className="text-sm" style={{ color: colors.textMuted }}>No reviews submitted yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Members Section */}
      <div
        className="w-full rounded-3xl border p-8 shadow-sm transition-colors duration-300"
        style={{
              backgroundColor: getTransparentColor(colors.sidebar, 0.4), // 40% opacity
              borderColor: getTransparentColor(colors.border, 0.2),
              backdropFilter: 'blur(16px)', // Blur effect
              WebkitBackdropFilter: 'blur(16px)'
            }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: colors.secondary }}>
              <i className="fa-solid fa-user-plus text-sm"></i>
            </div>
            <h2 className="text-md font-semibold" style={{ color: colors.text }}>New Members</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {newMembers.length > 0 ? newMembers.map((member, index) => {
            const imageUrl = getImageUrl(member.image);

            return (
              <div
                key={index}
                className="group border transition-all rounded-2xl p-4 text-center cursor-pointer"
                style={{  borderColor: colors.border }}
              >
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform overflow-hidden"
                  style={{ backgroundColor: colors.secondary }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold uppercase" style={{ color: theme === 'dark' ? '#fff' : '#1e3a8a' }}>
                      {member.name ? member.name.charAt(0) : "?"}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: colors.text }}>{member.name}</h3>
                <p className="text-xs mb-3 truncate" style={{ color: colors.textMuted }}>{member.email}</p>
                <div
                  className="inline-block text-[10px] font-medium px-2 py-1 rounded-md border"
                  style={{ backgroundColor: colors.card, color: colors.textMuted, borderColor: colors.border }}
                >
                  {member.plan?.name || "No Plan"}
                </div>
              </div>
            );
          }) : (
            <p className="text-sm col-span-5 text-center" style={{ color: colors.textMuted }}>No new members found.</p>
          )}
        </div>
      </div>

    </div>
  )
}

export default BottomSectionDashbord_Admin;