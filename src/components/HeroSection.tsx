
import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background */}
      <div className="absolute inset-0 bg-lskin-lightGray z-0"></div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight animate-fade-in">
              Reveal Your Natural Radiance
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Discover our premium skincare collection formulated with natural ingredients to nourish, protect, and revitalize your skin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn btn-primary py-2 px-6">
                Shop Now
              </Link>
              <Link to="/about" className="btn btn-outline py-2 px-6">
                Learn More
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative h-72 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-lskin-pink/40 to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Woman with glowing skin" 
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
