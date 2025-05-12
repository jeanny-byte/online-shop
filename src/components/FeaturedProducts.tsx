
import React from 'react';
import ProductCard, { ProductProps } from './ProductCard';
import { Link } from 'react-router-dom';

// Sample product data
const featuredProducts: ProductProps[] = [
  {
    id: '1',
    name: 'Hydrating Rose Serum',
    price: 48,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'serum',
    featured: true
  },
  {
    id: '2',
    name: 'Vitamin C Brightening Moisturizer',
    price: 54,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70e758?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'moisturizer',
    featured: true
  },
  {
    id: '3',
    name: 'Gentle Enzyme Facial Cleanser',
    price: 36,
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'cleanser',
    featured: true
  },
  {
    id: '4',
    name: 'Overnight Renewal Mask',
    price: 58,
    image: 'https://images.unsplash.com/photo-1614806687394-7cd6c68d2025?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'mask',
    featured: true
  }
];

const FeaturedProducts: React.FC = () => {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-sm font-medium text-primary-foreground">Collection</span>
            <h2 className="text-3xl md:text-4xl font-serif font-medium mt-1">Featured Products</h2>
          </div>
          <Link to="/shop" className="hidden md:block underline text-sm font-medium hover:text-primary-foreground transition-colors">
            View All Products
          </Link>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        {/* Mobile View All Link */}
        <div className="mt-8 md:hidden text-center">
          <Link to="/shop" className="inline-block underline text-sm font-medium hover:text-primary-foreground transition-colors">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
