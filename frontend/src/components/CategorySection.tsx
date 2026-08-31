import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

interface CategoryItem {
  id?: number;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
}

const fallbackCategories: CategoryItem[] = [
  {
    name: 'Cleansers',
    slug: 'cleansers',
    image: 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753782909/nelysah_uploads/1753782908569-r1.jpg.jpg',
    description: 'Gentle, effective cleansers for all skin types'
  },
  {
    name: 'Serums',
    slug: 'serums',
    image: 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753783234/nelysah_uploads/1753783233815-cc5.jpg.jpg',
    description: 'Targeted treatments for specific skin concerns'
  },
  {
    name: 'Moisturizers',
    slug: 'moisturizers',
    image: 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753783234/nelysah_uploads/1753783233818-cc1.jpg.jpg',
    description: 'Hydrating formulas for day and night'
  }
];

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Fallback already set
      });
  }, []);

  return (
    <section className="section bg-secondary/30 py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Browse</span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium mt-1">Shop By Category</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link 
              to={`/shop?category=${encodeURIComponent(category.name)}`} 
              key={category.name} 
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-muted shadow-sm">
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                
                {/* Image */}
                <img 
                  src={category.image || 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1374&auto=format&fit=crop'} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                  <h3 className="text-white text-2xl font-serif mb-1">{category.name}</h3>
                  {category.description && (
                    <p className="text-white/80 mb-3 text-sm max-w-xs line-clamp-2">{category.description}</p>
                  )}
                  <span className="inline-block text-white text-sm font-medium border-b border-white pb-1 transition-colors group-hover:border-primary">
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
