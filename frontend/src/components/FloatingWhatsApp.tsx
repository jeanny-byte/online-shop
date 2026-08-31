import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { MessageCircle, X } from 'lucide-react';

const FloatingWhatsApp: React.FC = () => {
  const { settings } = useSettings();
  const [isHovered, setIsHovered] = useState(false);

  const rawNumber = settings?.whatsapp_number || '233557246424';
  const cleanNumber = rawNumber.replace(/[^\d]/g, '');
  const storeName = settings?.store_name || 'Nelysah';

  const message = encodeURIComponent(`Hello ${storeName}, I would like to inquire about your products.`);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip / Popup message */}
      <div 
        className={`hidden sm:flex items-center bg-white text-gray-800 text-xs font-medium py-2 px-3.5 rounded-full shadow-lg border border-border transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        <span>Chat with us on WhatsApp</span>
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Chat with ${storeName} on WhatsApp`}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-none" />
        
        {/* Pulsing ring indicator */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25D366] border-2 border-white"></span>
        </span>
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
