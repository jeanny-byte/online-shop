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

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        // Sanitize null values to empty strings
        const sanitizedData = {
          ...data,
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
