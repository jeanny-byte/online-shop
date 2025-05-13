
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  
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
          
          {/* Shopping Bag & Profile Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-foreground hover:text-primary-foreground transition-colors">
              <ShoppingBag size={20} />
            </Link>
            
            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-foreground hover:bg-gray-200 transition-colors">
                  <User size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer w-full">
                        Account
                      </Link>
                    </DropdownMenuItem>
                    {user && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer w-full">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer w-full">
                        Log in
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="cursor-pointer w-full">
                        Sign up
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
              
              {/* Mobile Auth Links */}
              <div className="pt-2 border-t border-gray-100">
                {user ? (
                  <>
                    <Link to="/account" className="text-lg font-medium block py-2" onClick={() => setIsOpen(false)}>
                      Account
                    </Link>
                    {user && (
                      <Link to="/admin" className="text-lg font-medium block py-2" onClick={() => setIsOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="text-lg font-medium w-full text-left py-2 text-red-500"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-medium block py-2" onClick={() => setIsOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/signup" className="text-lg font-medium block py-2" onClick={() => setIsOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
