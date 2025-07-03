
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-3xl font-serif font-medium mb-8 text-center">Shipping Policy</h1>
        
        <div className="max-w-3xl mx-auto prose">
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Shipping Information</h2>
            <p>
              At Nelyluxe, we strive to deliver your products as quickly and efficiently as possible. 
              Please review our shipping information below.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Processing Time</h3>
            <p>
              All orders are processed within 1-2 business days (excluding weekends and holidays) 
              after receiving your order confirmation email. If there is a delay with your order, 
              we will notify you via email.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Shipping Methods & Timeframes</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Standard Shipping:</strong> 3-5 business days ($5.99 or free for orders over $50)
              </li>
              <li>
                <strong>Express Shipping:</strong> 1-2 business days ($12.99)
              </li>
              <li>
                <strong>International Shipping:</strong> 7-14 business days (rates vary by location)
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Tracking Information</h3>
            <p>
              Once your order has been shipped, you will receive a shipping confirmation email with 
              your tracking number. You can track your package at any time by visiting our 
              <Link to="/track-order" className="text-primary hover:underline"> Order Tracking </Link> 
              page or clicking the tracking link in your shipping confirmation email.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">International Shipping</h3>
            <p>
              We ship to most countries worldwide. Please note that international orders may be subject 
              to import duties and taxes, which are the responsibility of the recipient. Nelyluxe is not 
              responsible for delays due to customs processing.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Shipping Restrictions</h3>
            <p>
              Some products may have shipping restrictions to certain countries due to local regulations. 
              If we are unable to ship your order to your location, we will notify you promptly and 
              provide a full refund.
            </p>
          </section>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-4">Questions about shipping?</h2>
            <p className="mb-4">Contact our customer service team for assistance with shipping inquiries.</p>
            <Button asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
