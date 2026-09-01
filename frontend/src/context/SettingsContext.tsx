import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  whatsapp_number: string;
  store_address: string;
  logo_url: string;
  newsletter_enabled: boolean;
  newsletter_title: string;
  newsletter_description: string;
  currency: string;
  shipping_fee: number;
}

interface SettingsContextType {
  settings: StoreSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:image') || url.startsWith('blob:')) return url;
  
  // If the stored URL contains localhost/127.0.0.1, adapt it to the current API_URL in production
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const storageIdx = url.indexOf('/storage/');
    if (storageIdx !== -1) {
      const relative = url.substring(storageIdx);
      return `${API_URL || ''}${relative}`;
    }
  }

  // If the URL is relative like "/storage/settings/..."
  if (url.startsWith('/storage/')) {
    return `${API_URL || ''}${url}`;
  }

  return url;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        // Sanitize null values to empty strings and normalize image URL
        const sanitizedData = {
          ...data,
          logo_url: normalizeImageUrl(data.logo_url),
          store_email: data.store_email || '',
          store_phone: data.store_phone || '',
          whatsapp_number: data.whatsapp_number || '',
          store_address: data.store_address || '',
          newsletter_title: data.newsletter_title || '',
          newsletter_description: data.newsletter_description || '',
        };
        setSettings(sanitizedData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.store_name) {
      document.title = `${settings.store_name} - All Beauty Products`;

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${settings.store_name} - All Beauty Products`);
      }

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${settings.store_name} - All Beauty Products`);
      }

      const authorMeta = document.querySelector('meta[name="author"]');
      if (authorMeta) {
        authorMeta.setAttribute('content', settings.store_name);
      }
    }

    if (settings?.logo_url) {
      const iconSelectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
      iconSelectors.forEach(selector => {
        let link: HTMLLinkElement | null = document.querySelector(selector);
        if (link) {
          link.href = settings.logo_url;
        }
      });

      let mainIcon: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!mainIcon) {
        mainIcon = document.createElement('link');
        mainIcon.rel = 'shortcut icon';
        document.head.appendChild(mainIcon);
      }
      mainIcon.href = settings.logo_url;

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', settings.logo_url);
      }

      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', settings.logo_url);
      }
    }
  }, [settings?.store_name, settings?.logo_url]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
