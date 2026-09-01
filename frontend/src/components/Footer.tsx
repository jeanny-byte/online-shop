import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { settings } = useSettings();
  const storeName = settings?.store_name || 'Nelysah Cosmetics';
  const cleanWhatsapp = settings?.whatsapp_number?.replace(/[^\d]/g, '') || '233557246424';

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info & Logo */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={storeName} 
                  className="h-10 w-auto object-contain mb-2"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallbackUrl = `${import.meta.env.VITE_API_URL || ''}/api/settings/logo`;
                    if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
                      target.dataset.triedFallback = 'true';
                      target.src = fallbackUrl;
                    } else {
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'block';
                      }
                    }
                  }}
                />
              ) : null}
              <h3 
                className="text-2xl font-serif font-semibold text-foreground mb-2"
                style={{ display: settings?.logo_url ? 'none' : 'block' }}
              >
                {storeName}
              </h3>
            </Link>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Luxurious beauty, cosmetics, and skincare curated by {storeName} for your daily royal self-care ritual.
            </p>

            {/* Quick WhatsApp Contact Pill */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=Hello%20${encodeURIComponent(storeName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-semibold rounded-full transition-colors border border-[#25D366]/30"
              >
                <MessageCircle size={15} className="fill-[#25D366] stroke-none" />
                <span>WhatsApp: +{cleanWhatsapp}</span>
              </a>
            </div>
          </div>
          
          {/* Shop Categories */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=Cleansers" className="text-muted-foreground hover:text-primary transition-colors">Cleansers</Link>
              </li>
              <li>
                <Link to="/shop?category=Serums" className="text-muted-foreground hover:text-primary transition-colors">Serums</Link>
              </li>
              <li>
                <Link to="/shop?category=Moisturizers" className="text-muted-foreground hover:text-primary transition-colors">Moisturizers</Link>
              </li>
              <li>
                <Link to="/shop?category=Sunscreen" className="text-muted-foreground hover:text-primary transition-colors">Sunscreen</Link>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-foreground">Customer Care</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/track-order" className="text-muted-foreground hover:text-primary transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Beauty Blog</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Details */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-foreground">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {settings?.store_address && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{settings.store_address}</span>
                </li>
              )}
              {settings?.store_email && (
                <li className="flex items-center gap-2.5">
                  <Mail size={16} className="text-primary flex-shrink-0" />
                  <a href={`mailto:${settings.store_email}`} className="hover:text-primary transition-colors">
                    {settings.store_email}
                  </a>
                </li>
              )}
              {settings?.store_phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={16} className="text-primary flex-shrink-0" />
                  <a href={`tel:${settings.store_phone}`} className="hover:text-primary transition-colors">
                    {settings.store_phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/shipping-policy" className="hover:text-foreground transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
