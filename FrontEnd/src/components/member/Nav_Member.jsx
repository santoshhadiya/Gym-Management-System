import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext"; // Import Context
import { useGlobalContext } from "../../context/GlobalContext";

const Nav_Member = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { colors, theme } = useTheme(); // Consume Theme

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const notificationRef = useRef(null);

  // Use backend URL from env or default
  const { BACKEND_URL } = useGlobalContext()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        if (!token) {
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Profile
        const profileRes = await fetch(`${BACKEND_URL}/api/members/profile`, { headers });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setMember(data);
        }

        // 2. Fetch Announcements Feed
        const feedRes = await fetch(`${BACKEND_URL}/api/announcements/feed`, { headers });
        if (feedRes.ok) {
          const data = await feedRes.json();
          setAnnouncements(data.slice(0, 5)); // Take top 5 for dropdown
        }

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = member?.name || member?.user?.name || "Member";
  const planName = member?.plan?.name || "Member";

  // Helper for Image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/${path}`;
  };

  const profileImage = getImageUrl(member?.user?.profileImage);

  // Fallback Initials
  const initials = displayName
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleNotificationClick = () => {
    navigate('/member/announcements');
    setShowNotifications(false);
  };

  const navigateProfile = () => {
    navigate('/member/profile');
  }

  const navigateMembership=()=>{
    navigate('/member/membership');
  }
  return (
    <nav
      className="flex justify-between items-center px-6 py-4 mb-6 relative z-20  border-b-1 border-gray-300 transition-colors"
      style={{ backgroundColor: colors.card, color: colors.text }}
    >

      {/* Left: Mobile Menu & Welcome Text */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors hover:opacity-80"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
            color: colors.textMuted
          }}
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        <div >
          <h2 className="text-xl font-black hidden sm:block" style={{ color: colors.text }}>
            Welcome back, {displayName.split(' ')[0]}! 👋
          </h2>
          <p className="text-xs font-medium hidden sm:block" style={{ color: colors.textMuted }}>
            Let's crush your goals today.
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-5 ">

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-all relative cursor-pointer group shadow-sm shrink-0"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.textMuted
            }}
          >
            <i className="fa-regular fa-bell group-hover:animate-swing"></i>
            {announcements.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="p-4 border-b flex justify-between items-center"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                  borderColor: colors.border
                }}>
                <h3 className="font-bold text-sm" style={{ color: colors.text }}>Announcements</h3>
                <button onClick={handleNotificationClick} className="text-[10px] font-bold text-blue-500 hover:underline">View All</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {announcements.length > 0 ? (
                  announcements.map((item) => (
                    <div
                      key={item.id || item._id}
                      onClick={handleNotificationClick}
                      className="p-4 border-b transition-colors cursor-pointer group hover:opacity-90"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff'
                      }}
                    >
                      <p className="text-sm font-bold group-hover:text-blue-600 transition-colors line-clamp-1" style={{ color: colors.text }}>{item.title}</p>
                      <p className="text-[10px] mt-1 flex justify-between" style={{ color: colors.textMuted }}>
                        <span>{new Date(item.publishDate || item.date).toLocaleDateString()}</span>
                        {item.priority === 'Critical' && <span className="text-red-500 font-bold">Important</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs" style={{ color: colors.textMuted }}>No new announcements.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3 cursor-pointer group pl-2"
        >
          {/* Avatar / Image */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shadow-sm group-hover:scale-105 transition-transform shrink-0 overflow-hidden"
            onClick={navigateProfile}
            style={{
              backgroundColor: colors.primary,
              color: '#14532d', // Keep text dark on lime bg
              borderColor: colors.card
            }}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{loading ? "..." : initials}</span>
            )}
          </div>

          <div className="hidden xl:block text-right"
           onClick={navigateMembership}>
            <p className="text-sm font-bold group-hover:text-blue-600 transition-colors" style={{ color: colors.text }}>
              {loading ? "Loading..." : displayName}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              {loading ? "..." : planName}
            </p>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Nav_Member;