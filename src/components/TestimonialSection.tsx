
import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  location: string;
  quote: string;
  rating: number;
  image?: string;
}

const testimonials: TestimonialProps[] = [
  {
    name: 'Sophia Williams',
    location: 'New York, NY',
    quote: 'I\'ve tried countless skincare products, but LSkin\'s Vitamin C serum has transformed my skin. My hyperpigmentation has faded, and my skin looks more radiant than ever!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Emma Johnson',
    location: 'Los Angeles, CA',
    quote: 'The Overnight Renewal Mask is a game-changer! I wake up with plump, hydrated skin every time I use it. Totally worth every penny.',
    rating: 5
  },
  {
    name: 'Olivia Davis',
    location: 'Chicago, IL',
    quote: 'After struggling with sensitive skin for years, I finally found LSkin\'s Gentle Enzyme Cleanser. It removes all my makeup without irritation. I\'m a customer for life!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1499887142886-791eca5918cd?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary-foreground">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium mt-1">What Our Customers Say</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-lskin-lightGray p-6 rounded-lg">
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-foreground mb-4">"{testimonial.quote}"</blockquote>
              
              {/* Customer */}
              <div className="flex items-center">
                {testimonial.image ? (
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-lskin-pink flex items-center justify-center mr-3">
                    <span className="text-primary-foreground font-medium">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
