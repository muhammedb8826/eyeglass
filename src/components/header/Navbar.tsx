import { useEffect, useState } from 'react';
import { CgClose, CgMenuRight } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import Logo from '../../assets/images/logo/Logo.png';

const Navbar = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle scroll position and update navbar styles
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle navbar toggle button click
  const handleNavbarToggle = () => {
    setNavbarOpen(!navbarOpen);
  };


  return (
    <nav
      id="header"
      className={`fixed w-full top-0 z-99 text-white ${scrollPosition > 10 ? 'bg-white shadow' : 'bg-white shadow'
        }`}
    >
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
        <div className="pl-4 flex items-center">
          <NavLink
            to="/"
            className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
          >
            <img src={Logo} alt="Logo" className="h-10 w-auto" />
            {/* <span className="self-center font-semibold whitespace-nowrap dark:text-white">
              IAN PRINT
            </span> */}
          </NavLink>
        </div>

        <div className="block lg:hidden pr-4">
          <button
            onClick={handleNavbarToggle}
            title="menu-toggle"
            type="button"
            id="nav-toggle"
            className="flex items-center p-1 text-pink-800 hover:text-graydark/90 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          >
            {navbarOpen ? (
              <CgClose className="text-3xl" />
            ) : (
              <CgMenuRight className="text-3xl" />
            )}
          </button>
        </div>

        <div
          className={`w-full flex-grow lg:flex lg:items-center lg:w-auto mt-2 lg:mt-0 bg-white lg:bg-transparent text-black p-4 lg:p-0 z-20 ${navbarOpen ? '' : 'hidden'
            }`}
          id="nav-content"
        >
          <ul className="list-reset lg:flex justify-end flex-1 items-center">
            <li className="mr-3 max-sm:mb-4">
              <NavLink
                onClick={() => setNavbarOpen(false)}
                to="/"
                className={({ isActive }) =>
                  `block text-graydark/90 rounded hover:bg-graydark/10 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white ${isActive ? 'font-bold text-boxdark-2' : ''
                  }`}
              >
                Home
              </NavLink>
            </li>
            <li className="mr-3 max-sm:mb-4">
              <NavLink
                onClick={() => setNavbarOpen(false)}
                to="/about"
                className={({ isActive }) =>
                  `block text-graydark/90 rounded hover:bg-graydark/10 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white ${isActive ? 'font-bold text-boxdark-2' : ''
                  }`
                }
              >
                About
              </NavLink>
            </li>
            <li className="mr-3 max-sm:mb-4">
              <NavLink
                onClick={() => setNavbarOpen(false)}
                to="/services"
                className={({ isActive }) =>
                  `block text-graydark/90 rounded hover:bg-graydark/10 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white ${isActive ? 'font-bold text-boxdark-2' : ''
                  }`
                }
              >
                Services
              </NavLink>
            </li>
            <li className="mr-3 max-sm:mb-4">
              <NavLink
                onClick={() => setNavbarOpen(false)}
                to="/contact"
                className={({ isActive }) =>
                  `block text-graydark/90 rounded hover:bg-graydark/10 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white ${isActive ? 'font-bold text-boxdark-2' : ''
                  }`
                }
              >
                Contact
              </NavLink>
            </li>
            <li className="mr-3 max-sm:mb-4">
              <NavLink
                onClick={() => setNavbarOpen(false)}
                to="/latest-work"
                className={({ isActive }) =>
                  `block text-graydark/90 rounded hover:bg-graydark/10 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white ${isActive ? 'font-bold text-boxdark-2' : ''
                  }`
                }
              >
                Latest Work
              </NavLink>
            </li>
          </ul>
          <NavLink
            onClick={() => setNavbarOpen(false)}
            to="/signin"
            id="navAction"
            className={`mx-auto lg:mx-8 hover:underline font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out ${scrollPosition > 10 ? 'gradient text-white' : 'bg-white text-graydark/80'
              }`}
          >
            Sign In
          </NavLink>
        </div>
      </div>
      <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
  );
};

export default Navbar;