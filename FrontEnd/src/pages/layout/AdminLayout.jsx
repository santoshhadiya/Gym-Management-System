import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Manage Members", path: "/admin/members" },
    { name: "Manage Trainers", path: "/admin/trainers" },
    { name: "Membership Plans", path: "/admin/membership-plans" },
    { name: "Payments", path: "/admin/payments" },
    { name: "Payment History", path: "/admin/payment-history" },
    { name: "Assign Trainers", path: "/admin/assign-trainers" },
    { name: "Performance Reports", path: "/admin/performance-reports" },
    { name: "Verify Accounts", path: "/admin/verify-accounts" },
    { name: "Staff Schedules", path: "/admin/staff-schedules" },
    { name: "Manage Bookings", path: "/admin/bookings" },
    { name: "Announcements", path: "/admin/announcements" },
    { name: "Financial Reports", path: "/admin/financial-reports" },
    { name: "Media Gallery", path: "/admin/media-gallery" },
    { name: "Manage Offers", path: "/admin/offers" },
    { name: "Equipment Tracking", path: "/admin/equipment-tracking" },
    { name: "Monitor Progress", path: "/admin/monitor-progress" },
    { name: "Chat with Members", path: "/admin/chat-members" },
    { name: "Chat with Trainers", path: "/admin/chat-trainers" },
    { name: "View Feedback", path: "/admin/feedbacks" },
    { name: "Update Sessions", path: "/admin/update-session" },
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
