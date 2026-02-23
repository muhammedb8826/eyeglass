import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import "./Footer.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="footer-component bg-gray-900 text-white border-pink-500" 
      style={{ color: 'white' }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link
              to={"/"}
              className="inline-block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300 transition-all duration-300"
            >
              IAN PRINT PLC
            </Link>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'white' }}>
              Making You Visible. A modern and innovative printing company in Ethiopia, dedicated to delivering high-quality printing solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://t.me/ianprintplc" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-300" style={{ color: 'white' }} title="Telegram">
                <FaPaperPlane className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-300" style={{ color: 'white' }} title="Facebook">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-300" style={{ color: 'white' }} title="Instagram">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b-2 border-pink-500 pb-2" style={{ color: 'white' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/latest-work" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Latest Work
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b-2 border-pink-500 pb-2" style={{ color: 'white' }}>
              Our Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Banner Printing
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  DTF Printing
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Car Branding
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  Signage
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>
                  View All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b-2 border-pink-500 pb-2" style={{ color: 'white' }}>
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-pink-400 w-4 h-4 flex-shrink-0 mt-1" />
                <span className="text-sm font-semibold" style={{ color: 'white' }}>Meskel flower back side tolip Olympia hotel, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-pink-400 w-4 h-4 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+251911143752" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>+251 911-14-37-52</a>
                  <a href="tel:+251903428183" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>+251 903-42-81-83</a>
                  <a href="tel:+251922873641" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>+251 922-87-36-41</a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-pink-400 w-4 h-4 flex-shrink-0" />
                <a href="mailto:ianprint2014@gmail.com" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>ianprint2014@gmail.com</a>
              </div>
              <div className="flex items-center space-x-3">
                <FaPaperPlane className="text-pink-400 w-4 h-4 flex-shrink-0" />
                <a href="https://t.me/ianprintplc" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold transition-colors duration-300 hover:text-pink-400" style={{ color: 'white' }}>@ianprintplc</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-950">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm font-semibold" style={{ color: 'white' }}>
              © {currentYear} IAN PRINT PLC. All rights reserved.
            </div>
            <div className="text-sm flex items-center font-semibold" style={{ color: 'white' }}>
              Making You Visible
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
