
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryProps {
  name: string;
  image: string;
  link: string;
  description: string;
}

const categories: CategoryProps[] = [
  {
    name: 'Cleansers',
    image: 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753782909/nelysah_uploads/1753782908569-r1.jpg.jpg',
    link: '/shop?category=cleansers',
    description: 'Gentle, effective cleansers for all skin types'
  },
  {
    name: 'Serums',
    image: 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753783234/nelysah_uploads/1753783233815-cc5.jpg.jpg',
    link: '/shop?category=serums',
    description: 'Targeted treatments for specific skin concerns'
  },
  {
    name: 'Moisturizers',
    image: 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753783234/nelysah_uploads/1753783233818-cc1.jpg.jpg',
    link: '/shop?category=moisturizers',
    description: 'Hydrating formulas for day and night'
  }
];

const CategorySection: React.FC = () => {
  return (
    <section className="section bg-lskin-lightGray">
      <div className="container-custom">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary-foreground">Browse</span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium mt-1">Shop By Category</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link to={category.link} key={category.name} className="group">
              <div className="relative overflow-hidden rounded-lg aspect-[4/5]">
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                
                {/* Image */}
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                  <h3 className="text-white text-2xl font-serif mb-1">{category.name}</h3>
                  <p className="text-white/80 mb-3 text-sm max-w-xs">{category.description}</p>
                  <span className="inline-block text-white text-sm font-medium border-b border-white pb-1 transition-colors group-hover:border-lskin-pink">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
