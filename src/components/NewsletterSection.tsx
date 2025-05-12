
import React, { useState } from 'react';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we'd handle the newsletter subscription
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  return (
    <section className="section bg-lskin-peach">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-medium mb-4">Join Our Community</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive offers, skincare tips, and early access to new product launches.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary px-6 py-3"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from LSkin.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
