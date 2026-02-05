import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../context/GlobalContext';
import Nav_Member from '../../components/member/Nav_Member';
import { useTheme } from '../../context/ThemeContext';
import Sidebar_Member from '../../components/member/Sidebar_Member';

const MemberLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [memberStatus, setMemberStatus] = useState({ loading: true, hasPlan: false });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { api, setUser } = useGlobalContext();
  const { colors } = useTheme();

  // 1. CENTRAL MEMBERSHIP VALIDATION
  useEffect(() => {
    const validateAccess = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo?.token) return;

        // Fetch profile to check plan status
        const res = await api.get("/members/profile");
        const expiryDate = res.data.expiryDate ? new Date(res.data.expiryDate) : null;
        const today = new Date();

        const isActive = res.data.plan && (!expiryDate || expiryDate > today);
        setMemberStatus({ loading: false, hasPlan: isActive });

      } catch (err) {
        if (err.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
        setMemberStatus({ loading: false, hasPlan: false });
      }
    };

    validateAccess();
  }, [location.pathname, api, navigate, setUser]);

  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [location]);

  // 2. REDIRECTION LOGIC
  // Define routes that require an active plan
  const restrictedRoutes = ['/member', '/member/announcements', '/member/workout', '/member/progress', '/member/chat', '/member/feedback'];
  
  // If loading is done and user is on a restricted route without a plan, redirect to plans
  if (!memberStatus.loading && !memberStatus.hasPlan) {
    if (restrictedRoutes.includes(location.pathname) || location.pathname === '/member') {
      return <Navigate to="/member/plans" replace />;
    }
  }

  return (
    <div className="flex min-h-screen font-sans overflow-x-hidden transition-colors duration-300" style={{ backgroundColor: colors.background, color: colors.text }}>
      <Sidebar_Member isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 relative min-w-0 transition-colors duration-300" style={{ backgroundColor: colors.background }}>
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
          <Nav_Member onMenuClick={() => setIsMobileMenuOpen(true)} />
          <div className="mt-6 animate-fade-in">
             {/* If loading membership data, show a brief loader to prevent UI flash */}
            {memberStatus.loading ? (
              <div className="flex items-center justify-center h-64">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-blue-500"></i>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </main>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MemberLayout;