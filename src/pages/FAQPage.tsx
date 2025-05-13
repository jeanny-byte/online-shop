
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'Order History' section. Alternatively, you can use the tracking number provided in your shipping confirmation email through our order tracking page."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All transactions are securely processed."
    },
    {
      question: "How long will it take to receive my order?",
      answer: "Domestic orders typically arrive within 3-5 business days. International orders may take 7-14 business days depending on your location and customs processing times."
    },
    {
      question: "Are your products cruelty-free?",
      answer: "Yes, all of our products are 100% cruelty-free and we never test on animals. We are committed to ethical and sustainable beauty practices."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order within 1 hour of placing it. Please contact our customer service team immediately if you need to make changes."
    },
    {
      question: "Do you offer samples with orders?",
      answer: "Yes, we include complimentary samples with every order. The samples may vary based on current promotions and availability."
    },
    {
      question: "What ingredients do you avoid in your formulations?",
      answer: "Our products are free from parabens, sulfates, phthalates, synthetic fragrances, and artificial colors. We prioritize natural and organic ingredients wherever possible."
    },
    {
      question: "How should I store my skincare products?",
      answer: "For optimal product efficacy, store your skincare products in a cool, dry place away from direct sunlight. Some products may require refrigeration after opening, which will be noted on the packaging."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-3xl font-serif font-medium mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-4">Still have questions?</h2>
            <p className="mb-4">Our customer support team is available to help you with any questions or concerns.</p>
            <Button asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
