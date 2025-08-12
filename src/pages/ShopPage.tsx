import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts, Product } from '../data/products';
//import { products } from '../data/products';
import { Filter, X } from 'lucide-react';

const ShopPage: React.FC = () => {
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Fetch products on mount
  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
    });
  }, []);

  // Extract category from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // In a real app, we would sort by date
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, sortOption]);

  // Get unique categories
  const categories = Array.from(new Set(products.map(product => product.category)));

  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium">Shop All Products</h1>
            <p className="text-muted-foreground mt-2">
              Discover our premium skincare collection
            </p>
          </div>
          
          {/* Mobile filter button */}
          <button 
            className="flex items-center text-sm font-medium mt-4 md:hidden"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={16} className="mr-2" />
            Filter & Sort
          </button>
          
          {/* Desktop sorting */}
          <div className="hidden md:block">
            <label className="text-sm text-muted-foreground mr-2">Sort by:</label>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-border rounded-md py-1 px-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="border border-border rounded-md p-4">
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                <div 
                  className={`cursor-pointer ${!selectedCategory ? 'font-medium text-primary-foreground' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Products
                </div>
                {categories.map((category) => (
                  <div 
                    key={category} 
                    className={`cursor-pointer capitalize ${selectedCategory === category ? 'font-medium text-primary-foreground' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile filter drawer */}
          {filterOpen && (
            <div className="fixed inset-0 z-50 bg-white p-4 md:hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium">Filter & Sort</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Sort by:</h4>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="block w-full border border-border rounded-md py-2 px-3"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-3">
                  <div 
                    className={`${!selectedCategory ? 'font-medium text-primary-foreground' : ''}`}
                    onClick={() => {
                      setSelectedCategory(null);
                      setFilterOpen(false);
                    }}
                  >
                    All Products
                  </div>
                  {categories.map((category) => (
                    <div 
                      key={category} 
                      className={`capitalize ${selectedCategory === category ? 'font-medium text-primary-foreground' : ''}`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setFilterOpen(false);
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t">
                <button 
                  className="w-full py-2 bg-lskin-pink"
                  onClick={() => setFilterOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    images={product.images}
                    category={product.category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p>No products found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
