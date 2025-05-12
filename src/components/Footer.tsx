
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-lskin-lightGray pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-serif font-semibold">
              LSkin
            </Link>
            <p className="text-muted-foreground">
              Premium skincare products formulated specifically for women's unique skin needs.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-foreground hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" className="text-foreground hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-foreground hover:text-primary-foreground transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Links Column */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Policy Column */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">123 Beauty Boulevard, Skincare City, SC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <a href="mailto:hello@lskin.com" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                  hello@lskin.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LSkin Beauty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
