import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedProducts from '../components/FeaturedProducts';
import CategorySection from '../components/CategorySection';
import TestimonialSection from '../components/TestimonialSection';
import NewsletterSection from '../components/NewsletterSection';
import PromoBanner from '../components/PromoBanner';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <PromoBanner title="Grand Opening Sale Coming Soon!" targetDate="2025-07-30T23:59:59" />
      <FeaturedProducts />
      <CategorySection />
      <TestimonialSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
