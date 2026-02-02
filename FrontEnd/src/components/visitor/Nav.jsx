import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png"; // Ensure this path is correct

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

    // Scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Trainers", path: "/trainers" },
    { name: "Plans", path: "/plans" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-md py-3"
            : "bg-white py-5 border-b border-gray-100"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <Link to="" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
               <div className="absolute inset-0 bg-[#D9F17F] rounded-xl rotate-6 group-hover:rotate-12 transition-transform"></div>
               <img src={logo} alt="Logo" className="relative w-8 h-8 object-contain z-10" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Songar's <span className="text-red-600">GYM</span>
            </span>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden xl:flex items-center gap-2">
            <ul className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 block ${
                      location.pathname === link.path
                        ? "bg-white text-gray-900 shadow-sm text-red-600"
                        : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- DESKTOP ACTIONS --- */}
          <div className="hidden xl:flex items-center gap-4">
            <Link 
              to="/offers" 
              className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-900">
                <i className="fa-solid fa-gift"></i>
              </div>
              <span>Offers</span>
            </Link>

            <div className="h-8 w-px bg-gray-200"></div>

            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900">
              Log In
            </Link>

            <Link to="/plans">
              <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-red-600/30 transform hover:-translate-y-0.5">
                Join Now
              </button>
            </Link>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button
            className="xl:hidden text-gray-800 text-2xl focus:outline-none z-50 relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars-staggered"}`}></i>
          </button>
        </div>
      </nav>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 xl:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* --- MOBILE SIDEBAR --- */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out xl:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-2 mb-8">
             <div className="w-8 h-8 rounded-lg bg-[#D9F17F] flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
             </div>
             <span className="text-lg font-black text-gray-900">Songar's GYM</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                      location.pathname === link.path
                        ? "bg-red-50 text-red-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
               <Link to="/offers" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FEEF75]/20 text-yellow-900 font-bold hover:bg-[#FEEF75]/40 transition-colors">
                  <i className="fa-solid fa-gift text-yellow-600"></i> View Offers
               </Link>
               
               <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold transition-colors">
                  <i className="fa-solid fa-right-to-bracket"></i>Login
               </Link>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Link to="/plans">
              <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg">
                Become a Member
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;