import React, { useEffect } from 'react'

const Nav_Admin = () => {
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

  return (
    <section className="w-full bg-white rounded-2xl  py-4">
      <div className="flex items-center justify-between">

        {/* Left: Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            Hello, Admin! 
          </h1>
          <p className="text-sm text-gray-500">
            Welcome and Let’s do some workout today!
          </p>
        </div>

        {/* Right: Search & Notification */}
        <div className="flex items-center gap-4 bg-gray-100 p-2 px-3 rounded-full">

          {/* Search Box */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search anything"
              className="pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime-300 text-gray-600 placeholder-gray-400 transition-all shadow-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {/* Un-filled / Light Gray Icon */}
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          {/* Notification */}
          <div className="w-10 h-10 rounded-full bg-[#D9F17F]   flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all relative">
             {/* Optional Badge for unread notifications */}
             <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
            
            {/* Un-filled (Regular) & Light Gray Icon */}
            <i className="fa-regular fa-bell text-black text-lg"></i>
          </div>

        </div>

      </div>
    </section>
  )
}

export default Nav_Admin