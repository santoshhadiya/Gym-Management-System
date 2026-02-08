import React from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import Home from './pages/visitor/Home'
import About from './pages/visitor/About'
import Gallery from './pages/visitor/Gallery'
import Offers from './pages/visitor/Offers'
import Services from './pages/visitor/Services'
import Trainers from './pages/visitor/Trainers'
import VisitorLayout from './pages/layout/VisitorLayout'
import Plans from './pages/visitor/Plans'
import Inquiry from './pages/visitor/Inquiry'
import Policies from './pages/visitor/Policies'
import Reviews from './pages/visitor/Reviews'
import MemberLayout from './pages/layout/MemberLayout'
import Dashboard from './pages/member/Dashboard'
import Dashboard_Trainer from './pages/trainer/Dashboard'
import Dashboard_Admin from './pages/admin/Dashboard'
import Profile from './pages/member/Profile'
import Profile_Trainer from './pages/trainer/Profile'
import Membership from './pages/member/Membership'
import Booking from './pages/member/Booking'
import Chat from './pages/member/Chat'
import Feedback from './pages/member/Feedback'
import Payment from './pages/member/Payment'
import Invoices from './pages/member/Invoices'
import Renew from './pages/member/Renew'
import Progress from './pages/member/Progress'
import Workout from './pages/member/Workout'
import DietPlans from './pages/member/DietPlans'
import TrainerLayout from './pages/layout/TrainerLayout'
import Login from './pages/trainer/Login'
import Login_admin from './pages/admin/Login'
import Members from './pages/trainer/Members'
import ManageWorkoutDiet from './pages/trainer/ManageWorkoutDiet'
import MonitorProgress from './pages/trainer/MonitorProgress'
import MonitorProgress_admin from './pages/admin/MonitorProgress'
import Feedbacks from './pages/trainer/Feedbacks'
import Feedbacks_admin from './pages/admin/Feedbacks'
import Availability from './pages/trainer/Availability'
import ChatWithMember from './pages/trainer/ChatWithMember'
import ChatWithMember_admin from './pages/admin/ChatWithMember'
import ChatWithOwner from './pages/trainer/ChatWithOwner'
import SessionReports from './pages/trainer/SessionReports'
import PerformanceReport from './pages/trainer/PerformanceReports'
import PerformanceReport_admin from './pages/admin/PerformanceReports'
import ManageMember from './pages/admin/ManageMembers'
import ManageTrainer from './pages/admin/ManageTrainers'
import PaymentHistory from './pages/admin/PaymentHistory'
import MembershipPlan from './pages/admin/MembershipPlans'
import StaffSchedules from './pages/admin/StaffSchedules'
import VerifyAccounts from './pages/admin/VerifyAccounts'
import ManageBooking from './pages/admin/ManageBookings'
import Announcements from './pages/admin/Announcements'
import FinancialReports from './pages/admin/FinancialReports'
import MediaGallery from './pages/admin/MediaGallery'
import ManageOffers from './pages/admin/ManageOffers'
import EquipmentTracking from './pages/admin/EquipmentTracking'
import ChatWithTrainer from './pages/admin/ChatWithTrainers'
import UpdateSessions from './pages/admin/UpdateSessions'
import AdminLayout from './pages/layout/AdminLayout'
import AssignTrainers from './pages/admin/AssignTrainers'
import LoginPage from './components/all/LoginPage'
import Registration from './components/all/Registration'
import PlansAnalysis from './components/Analysis/PlansAnalysis'
import MemberPayments from './pages/admin/MemberPayments'
import PlansMembers from './pages/member/PlansMembers'
import AssignedMembers from './pages/trainer/AssignedMembers'
import { useGlobalContext } from './context/GlobalContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import ViewInquiry from './pages/admin/ViewInquiry'
import AnnouncementsTrainer from './pages/trainer/AnnouncementsTrainer'
import AnnouncementsMember from './pages/member/AnnouncementsMember'
import GalleryMember from './pages/member/GalleryMember'
import AttendanceQR from './pages/admin/AttendanceQR'
import ScanAttendance from './pages/member/ScanAttendance'
import AttendanceHistory from './pages/member/AttendanceHistory'
import Attendance from './pages/admin/Attendance'
import ForgotPassword from './components/all/ForgotPassword'
import ResetPassword from './components/all/ResetPassword'
import FAQs from './pages/visitor/FAQs'
import PrivacyPolicy from './pages/visitor/PrivacyPolicy'
import TermsOfService from './pages/visitor/TermsofService'
import GymSchedule from './pages/visitor/GymSchedule'
import AdminProfile from './pages/admin/AdminProfile'
import CreateAdmin from './pages/admin/CreateAdmin'
import GymChatbot from './pages/visitor/GymChatbot'
import BotVisitor from './pages/visitor/BotVisitor'
import ManageGymSchedule from './pages/admin/ManageGymSchedule'
import ScanSession from './pages/member/ScanSession'
import SessionQR from './pages/admin/Sessionqr'
import Contact from './pages/visitor/Contact'


const App = () => {
  const { user } = useGlobalContext()
  return (

    <BrowserRouter>
      {/* <div>hello</div> */}
      <ScrollToTop />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<Registration />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard_Admin />} />
            <Route path="members" element={<ManageMember />} />
            <Route path="trainers" element={<ManageTrainer />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="membership-plans" element={<MembershipPlan />} />
            <Route path="membership-plans-analysis" element={<PlansAnalysis />} />
            <Route path="assign-trainers" element={<AssignTrainers />} />
            <Route path="performance-reports" element={<PerformanceReport_admin />} />
            <Route path="staff-schedules" element={<StaffSchedules />} />
            <Route path="verify-accounts" element={<VerifyAccounts />} />
            <Route path="bookings" element={<ManageBooking />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="financial-reports" element={<FinancialReports />} />
            <Route path="media-gallery" element={<MediaGallery />} />
            <Route path="offers" element={<ManageOffers />} />
            <Route path="equipment-tracking" element={<EquipmentTracking />} />
            <Route path="monitor-progress" element={<MonitorProgress_admin />} />
            <Route path="chat-members" element={<ChatWithMember_admin />} />
            <Route path="chat-trainers" element={<ChatWithTrainer />} />
            <Route path="view-inquiry" element={<ViewInquiry />} />
            <Route path="feedbacks" element={<Feedbacks_admin />} />
            <Route path="update-session" element={<UpdateSessions />} />
            <Route path="attendance-qr" element={<AttendanceQR />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="create-admin" element={<CreateAdmin />} />
            <Route path="session-qr" element={<SessionQR/>} />
            <Route path="manage-gym-schedule" element={<ManageGymSchedule/>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
          <Route path="trainer" element={<TrainerLayout />}>
            <Route index element={<Dashboard_Trainer />} />
            <Route path="profile" element={<Profile_Trainer />} />
            <Route path="members" element={<AssignedMembers />} />
            <Route path="workout-diet" element={<ManageWorkoutDiet />} />
            <Route path="monitor-progress" element={<MonitorProgress />} />
            <Route path="feedbacks" element={<Feedbacks />} />
            <Route path="session-reports" element={<SessionReports />} />
            <Route path="performance-reports" element={<PerformanceReport />} />
            <Route path="availability" element={<Availability />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="chat/member" element={<ChatWithMember />} />
            <Route path="chat/owner" element={<ChatWithOwner />} />
            <Route path="announcements" element={<AnnouncementsTrainer />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
          <Route path="member" element={<MemberLayout />}>
            <Route index element={<Dashboard />} /> {/* /member */}
            <Route path="profile" element={<Profile />} />
            <Route path="membership" element={<Membership />} />
            <Route path="plans" element={<PlansMembers />} />
            <Route path="progress" element={<Progress />} />
            <Route path="booking" element={<Booking />} />
            <Route path="chat" element={<Chat />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="payment" element={<Payment />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="renew" element={<Renew />} />
            <Route path="workout" element={<Workout />} />
            <Route path="dietPlans" element={<DietPlans />} />
            <Route path="scan-session" element={<ScanSession/>} />
            <Route path="announcements" element={<AnnouncementsMember />} />
            <Route path="gallery" element={<GalleryMember />} />
            <Route path="scan-attendance" element={<ScanAttendance />} />
            <Route path="attendance-history" element={<AttendanceHistory />} />
          </Route>
        </Route>

        <Route path="/" element={<VisitorLayout />}>
          <Route index element={<Home />} /> {/* /visitor */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="offers" element={<Offers />} />
          <Route path="services" element={<Services />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="plans" element={<Plans />} />
          <Route path="chatbot" element={<GymChatbot />} />
          <Route path="inquiry" element={<Inquiry />} />
          <Route path="policies" element={<Policies />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="faq" element={<FAQs />} />
          <Route path="bot" element={<BotVisitor />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-service" element={<TermsOfService />} />
          <Route path="schedule" element={<GymSchedule />} />
        </Route>
      </Routes>

    </BrowserRouter>
  )
}

export default App