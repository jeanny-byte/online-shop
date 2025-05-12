
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we would submit the form data to a server
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Reset submission state after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-serif font-medium mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're here to help with any questions or concerns you may have about our products or services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-serif mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-lskin-pink flex items-center justify-center mr-4 flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Our Location</h3>
                  <p className="text-muted-foreground">
                    123 Beauty Boulevard<br />
                    Skincare City, SC 12345
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-lskin-pink flex items-center justify-center mr-4 flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email Us</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:hello@lskin.com" className="hover:underline">hello@lskin.com</a><br />
                    <a href="mailto:support@lskin.com" className="hover:underline">support@lskin.com</a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-lskin-pink flex items-center justify-center mr-4 flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Call Us</h3>
                  <p className="text-muted-foreground">
                    <a href="tel:+1234567890" className="hover:underline">(123) 456-7890</a><br />
                    Monday - Friday, 9am - 5pm EST
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <h3 className="text-xl font-serif mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {['Instagram', 'Facebook', 'Twitter', 'Pinterest'].map((social, index) => (
                  <a 
                    key={index}
                    href="#"
                    className="h-10 w-10 rounded-full bg-lskin-lightGray flex items-center justify-center hover:bg-lskin-pink transition-colors"
                  >
                    {social.charAt(0)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-serif mb-6">Send Us a Message</h2>
            
            {formSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={20} className="text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-600">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Wholesale Inquiry">Wholesale Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="btn btn-primary w-full py-3"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Map */}
        <div className="mt-16">
          <div className="rounded-lg overflow-hidden h-80 bg-lskin-lightGray">
            {/* In a real implementation, we would embed a Google Map here */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="mx-auto mb-2" />
                <p className="font-medium">Map would be displayed here</p>
                <p className="text-muted-foreground">123 Beauty Boulevard, Skincare City, SC 12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
