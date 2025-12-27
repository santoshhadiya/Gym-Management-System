import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MemberLayout = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/member' },
    { name: 'Profile', path: '/member/profile' },
    { name: 'Membership', path: '/member/membership' },
    { name: 'Plans', path: '/member/plans' },
    { name: 'Progress', path: '/member/progress' },
    { name: 'Booking', path: '/member/booking' },
    { name: 'Chat', path: '/member/chat' },
    { name: 'Feedback', path: '/member/feedback' },
    { name: 'Payment', path: '/member/payment' },
    { name: 'Invoices', path: '/member/invoices' },
    { name: 'Renew', path: '/member/renew' },
    {name:'Workout', path:'/member/workout'},
    {name:'DietPlans', path:'/member/dietPlans'}
  ];

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-red-700 text-white hidden md:flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-8 border-b border-red-400 pb-2">Member Panel</h2>
        <nav className="flex flex-col gap-4">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? 'bg-white text-red-700 font-semibold' : 'hover:bg-red-600'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-700">Songar's Gym – Member Portal</h1>
          <div className="text-sm text-gray-600">Welcome, Member 👋</div>
        </header>

        {/* Page Content */}
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
