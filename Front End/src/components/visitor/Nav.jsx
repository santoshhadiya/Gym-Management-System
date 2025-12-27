import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 flex items-center justify-between shadow-md">
      {/* Logo and Gym Name */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          S
        </div>
        <span className="text-xl font-semibold">Songar's GYM</span>
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-6 text-lg font-medium">
        <li>
          <Link to="/visitor" className="hover:text-red-500 transition">Home</Link>
        </li>
        <li>
          <Link to="/visitor/about" className="hover:text-red-500 transition">About</Link>
        </li>
        <li>
          <Link to="/visitor/gallery" className="hover:text-red-500 transition">Gallery</Link>
        </li>
        <li>
          <Link to="/visitor/offers" className="hover:text-red-500 transition">Offers</Link>
        </li>
        <li>
          <Link to="/visitor/services" className="hover:text-red-500 transition">Services</Link>
        </li>
        <li>
          <Link to="/visitor/trainers" className="hover:text-red-500 transition">Trainers</Link>
        </li>
        <li>
          <Link to="/visitor/plans" className="hover:text-red-500 transition">Plans</Link>
        </li>
        
        <li>
          <Link to="/visitor/inquiry" className="hover:text-red-500 transition">Inquiry</Link>
        </li>
        <li>
          <Link to="/visitor/contact" className="hover:text-red-500 transition">Contact</Link>
        </li>
        <li>
          <Link to="/visitor/policies" className="hover:text-red-500 transition">Policies</Link>
        </li>
        <li>
          <Link to="/visitor/reviews" className="hover:text-red-500 transition">Reviews</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
