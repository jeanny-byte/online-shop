
import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';

const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();
  const storeName = settings?.store_name || 'Nelysah';
  const storeEmail = settings?.store_email || 'privacy@nelysah.com';
  const storeAddress = settings?.store_address || 'Tema Community 25, Accra-Ghana';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-3xl font-serif font-medium mb-8 text-center">Privacy Policy</h1>
        
        <div className="max-w-3xl mx-auto prose">
          <section className="mb-8">
            <p className="italic">Last updated: May 13, 2025</p>
            
            <p className="mt-4">
              This Privacy Policy describes how {storeName} ("we," "us," or "our") collects, uses, and shares 
              your personal information when you visit our website, make a purchase, or interact with us.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Information We Collect</h2>
            <p>When you visit our site, we collect certain information about your device, your interaction 
              with the site, and information necessary to process your purchases. We may also collect 
              additional information if you contact us for customer support.</p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Payment information (we do not store full credit card numbers)</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Automatically Collected Information</h3>
            <p>We automatically collect certain information when you visit our website:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Time zone</li>
              <li>Operating system</li>
              <li>Page views and browsing patterns</li>
              <li>Referring website address</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders, products, and services</li>
              <li>Provide customer support</li>
              <li>Improve our website and customer experience</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with our legal obligations</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Sharing Your Information</h2>
            <p>We share your information with service providers to help us provide our services and fulfill our obligations to you. We may share information with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Payment processors</li>
              <li>Shipping and fulfillment partners</li>
              <li>Marketing and analytics services</li>
              <li>Customer service providers</li>
            </ul>
            <p className="mt-2">We may also share information in the following situations:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>To comply with applicable laws and regulations</li>
              <li>To respond to a subpoena, search warrant, or other lawful requests for information</li>
              <li>To protect our rights, property, or safety, or the rights, property, or safety of others</li>
              <li>In connection with a business transaction such as a merger, sale of assets, or acquisition</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>The right to access the personal information we hold about you</li>
              <li>The right to request correction of your personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to restrict processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal information</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us at <a href={`mailto:${storeEmail}`} className="text-primary hover:underline">{storeEmail}</a>.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Cookies Policy</h2>
            <p>We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Changes to This Privacy Policy</h2>
            <p>We may update this privacy policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new policy on this page.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Contact Us</h2>
            <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e‑mail at <a href={`mailto:${storeEmail}`} className="text-primary hover:underline">{storeEmail}</a> or by mail using the details provided below:</p>
            <p className="mt-2 whitespace-pre-line">{storeName}<br />{storeAddress}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
