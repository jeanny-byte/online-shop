
import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-3xl font-serif font-medium mb-8 text-center">Terms of Service</h1>
        
        <div className="max-w-3xl mx-auto prose">
          <section className="mb-8">
            <p className="italic">Last updated: May 13, 2025</p>
            
            <p className="mt-4">
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using 
              the Nelysah website (the "Service") operated by Nelysah ("us", "we", or "our").
            </p>
            
            <p className="mt-2">
              Your access to and use of the Service is conditioned on your acceptance of and compliance 
              with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
            
            <p className="mt-2">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree 
              with any part of the terms, then you may not access the Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Purchases</h2>
            <p>
              If you wish to purchase any product or service made available through the Service ("Purchase"), 
              you may be asked to supply certain information relevant to your Purchase including, without 
              limitation, your name, shipping address, email address, phone number, and payment information.
            </p>
            <p className="mt-2">
              We reserve the right to refuse or cancel your order at any time for certain reasons including 
              but not limited to: product or service availability, errors in the description or price of the 
              product or service, error in your order, or other reasons.
            </p>
            <p className="mt-2">
              We reserve the right to refuse or cancel your order if fraud or an unauthorized or illegal 
              transaction is suspected.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Product Information</h2>
            <p>
              We strive to provide accurate product information and descriptions, but we do not warrant 
              that product descriptions or other content of this site is accurate, complete, reliable, 
              current, or error-free.
            </p>
            <p className="mt-2">
              The images of the products on our website are for illustrative purposes only. Due to factors 
              such as your monitor's display settings or lighting conditions, the actual product may vary 
              slightly from the image on the website.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, 
              and current at all times. Failure to do so constitutes a breach of the Terms, which may result 
              in immediate termination of your account on our Service.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding the password that you use to access the Service and for 
              any activities or actions under your password, whether your password is with our Service or a third-party service.
            </p>
            <p className="mt-2">
              You agree not to disclose your password to any third party. You must notify us immediately 
              upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the 
              exclusive property of Nelysah and its licensors. The Service is protected by copyright, 
              trademark, and other laws of both the United States and foreign countries. Our trademarks 
              and trade dress may not be used in connection with any product or service without the prior 
              written consent of Nelysah.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Links To Other Websites</h2>
            <p>
              Our Service may contain links to third-party websites or services that are not owned or 
              controlled by Nelysah.
            </p>
            <p className="mt-2">
              Nelysah has no control over, and assumes no responsibility for, the content, privacy policies, 
              or practices of any third-party websites or services. You further acknowledge and agree that 
              Nelysah shall not be responsible or liable, directly or indirectly, for any damage or loss caused 
              or alleged to be caused by or in connection with the use of or reliance on any such content, 
              goods, or services available on or through any such websites or services.
            </p>
            <p className="mt-2">
              We strongly advise you to read the terms and conditions and privacy policies of any 
              third-party websites or services that you visit.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mt-2">
              Upon termination, your right to use the Service will immediately cease. If you wish to 
              terminate your account, you may simply discontinue using the Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Limitation Of Liability</h2>
            <p>
              In no event shall Nelysah, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from your access to or use of or inability to access or use 
              the Service or any content thereon.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, 
              without regard to its conflict of law provisions.
            </p>
            <p className="mt-2">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver 
              of those rights. If any provision of these Terms is held to be invalid or unenforceable by a 
              court, the remaining provisions of these Terms will remain in effect.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will try to provide at least 30 days' notice prior to any new 
              terms taking effect.
            </p>
            <p className="mt-2">
              By continuing to access or use our Service after those revisions become effective, you agree 
              to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-medium mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please 
              <Link to="/contact" className="text-primary hover:underline"> contact us</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
