import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const TrainerLayout = () => {
  const navItems = [
    { path: '', label: 'Dashboard' },
    { path: 'profile', label: 'Profile' },
    { path: 'members', label: 'Assigned Members' },
    { path: 'workout-diet', label: 'Workout & Diet Plans' },
    { path: 'monitor-progress', label: 'Member Progress' },
    { path: 'feedbacks', label: 'Feedbacks' },
    { path: 'session-reports', label: 'Session Reports' },
    { path: 'performance-reports', label: 'Performance Reports' },
    { path: 'availability', label: 'Availability' },
    { path: 'payments', label: 'Payment Status' },
    { path: 'chat/member', label: 'Chat with Member' },
    { path: 'chat/owner', label: 'Chat with Owner' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-5">
        <h2 className="text-2xl font-bold text-red-600 mb-6">Trainer Panel</h2>
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === ''}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium text-sm ${
                  isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default TrainerLayout;
