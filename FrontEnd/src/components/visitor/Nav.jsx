import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png"
const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Scroll listener for navbar styling
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.head.removeChild(link);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/visitor" },
    { name: "About", path: "/visitor/about" },
    { name: "Services", path: "/visitor/services" },
    { name: "Trainers", path: "/visitor/trainers" },
    { name: "Plans", path: "/visitor/plans" },
    { name: "Gallery", path: "/visitor/gallery" },
    { name: "Contact", path: "/visitor/contact" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300  ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-white py-3"
      }`}
    >
      <div className="container mx-auto px-4  flex justify-between items-center">
        
        {/* LOGO */}
       <div className="bg-gray-100 px-4 py-1 rounded-4xl ">
         <Link to="/visitor" className="flex items-center gap-2 group">
          <div className="w-10 h-10  rounded-full  flex items-center justify-center text-green-900 font-black text-xl group-hover:rotate-12 transition-transform">
           <img src={logo}/>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors">
            Songar's <span className="text-red-600">GYM</span>
          </span>
        </Link>
       </div>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex space-x-6 text-sm font-semibold text-gray-600">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`hover:text-green-600 transition-colors relative py-1 ${
                    location.pathname === link.path ? "text-green-600" : ""
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D9F17F] rounded-full"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <Link to="/visitor/offers" className="text-sm font-bold text-gray-900 hover:text-green-600 transition-colors">
              <i className="fa-solid fa-tag text-[#FEEF75] mr-1"></i> Offers
            </Link>
            <Link to="/visitor/plans">
              <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-[#D9F17F] hover:text-green-900 transition-all shadow-lg shadow-gray-900/20">
                Join Now
              </button>
            </Link>
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-gray-800 text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`block text-lg font-medium ${
                  location.pathname === link.path ? "text-green-600" : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link to="/visitor/offers" className="block text-lg font-medium text-gray-600">
               Offers
            </Link>
            <Link to="/visitor/plans">
              <button className="w-full py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold hover:bg-green-400 transition-colors">
                Join Now
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;