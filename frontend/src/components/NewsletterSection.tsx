import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();

  // If newsletter is disabled in admin store settings, do not render
  if (settings && settings.newsletter_enabled === false) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed. Please try again.');
      }

      toast({
        title: 'Subscribed Successfully!',
        description: data.message || 'Thank you for joining our community.',
      });
      setEmail('');
    } catch (error: any) {
      toast({
        title: 'Subscription Error',
        description: error.message || 'Could not subscribe at this time.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section bg-secondary/30 py-16">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-medium mb-4">
            {settings?.newsletter_title || 'Join Our Community'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {settings?.newsletter_description || 'Subscribe to our newsletter for exclusive offers, skincare tips, and early access to new product launches.'}
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary px-6 py-3"
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from {settings?.store_name || 'Nelysah'}.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
