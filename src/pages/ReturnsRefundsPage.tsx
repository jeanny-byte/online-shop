
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ReturnsRefundsPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-3xl font-serif font-medium mb-8 text-center">Returns & Refunds</h1>
        
        <div className="max-w-3xl mx-auto prose">
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Our Return Policy</h2>
            <p>
              We want you to be completely satisfied with your purchase. If you're not entirely happy 
              with your order, we're here to help.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Return Eligibility</h3>
            <p>
              You may return most new, unopened items within 30 days of delivery for a full refund. 
              We also accept returns of used items within 14 days if the product does not meet your 
              expectations or causes any allergic reactions.
            </p>
            <p className="mt-2">
              To be eligible for a return, your item must be:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>In the same condition that you received it</li>
              <li>In the original packaging (when possible)</li>
              <li>Accompanied by the receipt or proof of purchase</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Non-Returnable Items</h3>
            <p>
              The following items cannot be returned:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Gift cards</li>
              <li>Sample products</li>
              <li>Personalized or custom-made items</li>
              <li>Items marked as final sale</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Refunds Process</h3>
            <p>
              Once we receive your return, we will inspect it and notify you of the status of your refund.
              If your return is approved, we will initiate a refund to your original method of payment.
            </p>
            <p className="mt-2">
              You will receive the credit within a certain amount of days, depending on your card issuer's policies.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">Return Shipping</h3>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. 
              Shipping costs are non-refundable. If you receive a refund, the cost of return shipping 
              will be deducted from your refund.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-xl font-medium mb-3">How to Initiate a Return</h3>
            <p>
              To start the return process, please email us at returns@Nelyluxe.com or contact us through 
              our contact form. Please include your order number and the reason for your return.
            </p>
          </section>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-4">Need help with a return?</h2>
            <p className="mb-4">Our customer service team is here to assist you with the return process.</p>
            <Button asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsRefundsPage;
