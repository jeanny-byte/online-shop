
import React from 'react';
import { Link } from 'react-router-dom';
import BlogPostsSlider from './BlogPostsSlider';

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
              <Link to="/blog" className="btn btn-outline py-2 px-6">
                Read Our Blog
              </Link>
            </div>
          </div>
          
          {/* Hero Image replaced with Blog Posts Slider */}
          <div className="relative rounded-lg overflow-hidden">
            <BlogPostsSlider />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
