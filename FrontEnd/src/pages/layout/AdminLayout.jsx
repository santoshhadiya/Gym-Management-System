import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/owner" },
    { name: "Manage Members", path: "/owner/members" },
    { name: "Manage Trainers", path: "/owner/trainers" },
    { name: "Membership Plans", path: "/owner/membership-plans" },
    { name: "Payments", path: "/owner/payments" },
    { name: "Payment History", path: "/owner/payment-history" },
    { name: "Assign Trainers", path: "/owner/assign-trainers" },
    { name: "Performance Reports", path: "/owner/performance-reports" },
    { name: "Verify Accounts", path: "/owner/verify-accounts" },
    { name: "Staff Schedules", path: "/owner/staff-schedules" },
    { name: "Manage Bookings", path: "/owner/bookings" },
    { name: "Announcements", path: "/owner/announcements" },
    { name: "Financial Reports", path: "/owner/financial-reports" },
    { name: "Media Gallery", path: "/owner/media-gallery" },
    { name: "Manage Offers", path: "/owner/offers" },
    { name: "Equipment Tracking", path: "/owner/equipment-tracking" },
    { name: "Monitor Progress", path: "/owner/monitor-progress" },
    { name: "Chat with Members", path: "/owner/chat-members" },
    { name: "Chat with Trainers", path: "/owner/chat-trainers" },
    { name: "View Feedback", path: "/owner/feedbacks" },
    { name: "Update Sessions", path: "/owner/update-session" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 p-4 space-y-3">
        <h2 className="text-2xl font-bold text-red-500 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`block px-4 py-2 rounded hover:bg-red-600 transition ${
                pathname === item.path ? "bg-red-500" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
