
import React, { useEffect, useState } from 'react';
import ProductCard, { ProductProps } from './ProductCard';
import { Link } from 'react-router-dom';
import { fetchProducts, Product } from '../data/products';

// No more hardcoded featuredProducts array

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilter = async () => {
      const products = await fetchProducts();
      setFeaturedProducts(
        products
          .filter((p) => p.featured)
          .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : (p.image || ''),
            images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
            category: p.category,
            featured: p.featured,
          }))
      );
      setLoading(false);
    };
    fetchAndFilter();
  }, []);

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
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
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
