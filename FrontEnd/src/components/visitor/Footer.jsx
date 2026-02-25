import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/logo.png"
import { useGlobalContext } from '../../context/GlobalContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { api } = useGlobalContext(); //
  const [companyData, setCompanyData] = useState(null);

  // Fetch dynamic gym info from backend
  useEffect(() => {
    const fetchGymInfo = async () => {
      try {
        const { data } = await api.get('/company'); //
        setCompanyData(data);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };
    fetchGymInfo();
  }, [api]);

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand Identity */}
          <div className="col-span-1 md:col-span-1">
            <div className='flex gap-2 items-center mb-6'>
              <div className='rounded-full h-12 w-12 p-1 bg-gray-200 flex justify-center items-center overflow-hidden'>
                <img src={logo} alt="Songar's Gym Logo" className="object-contain" />
              </div>
              <Link to="/" className="text-2xl font-black tracking-tighter uppercase">
                {companyData?.name || "SONGAR'S GYM"}
              </Link>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering athletes and fitness enthusiasts since 2010. Join the elite community and forge your best self.
            </p>
            <div className="flex gap-4">
              {/* Dynamic Instagram Link */}
              <a 
                href={companyData?.instagram || "https://www.instagram.com/the_songars_gym"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D9F17F] hover:text-black transition-all"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              {/* Dynamic Facebook Link */}
              <a 
                href={companyData?.facebook || "https://www.facebook.com/"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D9F17F] hover:text-black transition-all"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/plans" className="hover:text-[#FEEF75] transition-colors">Membership Plans</Link></li>
              <li><Link to="/services" className="hover:text-[#FEEF75] transition-colors">Services</Link></li>
              <li><Link to="/trainers" className="hover:text-[#FEEF75] transition-colors">Our Trainers</Link></li>
              <li><Link to="/schedule" className="hover:text-[#FEEF75] transition-colors">Gym Schedule</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/contact" className="hover:text-[#D9F17F] transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-[#D9F17F] transition-colors">FAQs</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#D9F17F] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-service" className="hover:text-[#D9F17F] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6">Visit Us</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex gap-3">
                <i className="fa-solid fa-location-dot text-[#D9F17F] mt-1"></i>
                {/* Dynamic Address */}
                <span className="whitespace-pre-line">
                  {companyData?.address || "B-409, 410 Shivalik Yash Complex, \n Shastrinagar Cross Road, \n 132 Feet Ring Rd."}
                </span>
              </li>
              <li className="flex gap-3">
                <i className="fa-solid fa-phone text-[#D9F17F]"></i>
                {/* Dynamic Mobile */}
                <a href={`tel:${companyData?.mobile}`} className="hover:text-white transition-colors">
                  {companyData?.mobile || "097243 70580"}
                </a>
              </li>
              <li className="flex gap-3">
                <i className="fa-solid fa-envelope text-[#D9F17F]"></i>
                {/* Dynamic Email */}
                <a href={`mailto:${companyData?.email}`} className="hover:text-white transition-colors">
                  {companyData?.email || "hello@songarsgym.com"}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {currentYear} {companyData?.name || "Songar's Gym"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;