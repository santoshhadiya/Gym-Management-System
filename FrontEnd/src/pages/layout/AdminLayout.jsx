import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Nav_Admin from "../../components/admin/Nav_Admin";
import Sidebar_Admin from "../../components/admin/Sidebar_Admin";
// Fixed import path to include extension and ensure resolution

const AdminLayout = () => {
  const { pathname } = useLocation();

  // Load Font Awesome dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Defined icons for each navigation item
  // using fa-regular (un-filled) where possible
  

  return (
    <div className="flex min-h-screen bg-white font-sans">

      {/* Sidebar */}
      <Sidebar_Admin/>

      {/* Main Content */}
      <main className="flex-1  overflow-y-auto bg-white">
        <div className="p-6">
            <Nav_Admin />
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;