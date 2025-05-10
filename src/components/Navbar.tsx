
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' }, // Add this line
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <Link to="/" className="text-jewelry-dark font-semibold text-xl md:text-2xl">
          Elegance Artistry
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm tracking-wide transition-colors hover:text-jewelry-accent ${
                location.pathname === link.path ? 'text-jewelry-accent font-medium' : 'text-jewelry-dark'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Navigation Button */}
        <button 
          className="md:hidden text-jewelry-dark"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="container mx-auto py-4 flex flex-col space-y-4 px-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base py-2 ${
                  location.pathname === link.path ? 'text-jewelry-accent font-medium' : 'text-jewelry-dark'
                }`}
                onClick={() => setMobileNavOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
