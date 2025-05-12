
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-semibold">
            LSkin
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary-foreground transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-foreground hover:text-primary-foreground transition-colors">
              Shop
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary-foreground transition-colors">
              Contact
            </Link>
          </div>
          
          {/* Shopping Bag & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-foreground hover:text-primary-foreground transition-colors">
              <ShoppingBag size={20} />
            </Link>
            <button onClick={() => setIsOpen(true)} className="md:hidden text-foreground">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="container-custom py-5">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-serif font-semibold" onClick={() => setIsOpen(false)}>
                LSkin
              </Link>
              <button onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col space-y-6 mt-10">
              <Link to="/" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/shop" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                Shop
              </Link>
              <Link to="/about" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
              <Link to="/cart" className="text-lg font-medium flex items-center" onClick={() => setIsOpen(false)}>
                <ShoppingBag size={20} className="mr-2" /> Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
