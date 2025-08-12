import React, { useEffect, useState } from 'react';

// Use API URL from .env
const API_URL = "https://nelysah-server.onrender.com";
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Share, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCart } from '../context/CartContext';

// Define the Product type to match the MySQL 'products' table
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Add this to handle multiple images
  category: string;
  ingredients: string; // comma-separated
  how_to_use: string;
  benefits?: string; // Optional, for MySQL rows that may have this field
  // Add other fields as needed
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
    // Reset scroll position when product changes
    window.scrollTo(0, 0);
  }, [id]);
  
  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const prod = await res.json();
      setProduct(prod);
      // Set the first image as the selected one
      if (prod.images && prod.images.length > 0) {
        setSelectedImage(prod.images[0]);
      } else if (prod.image) {
        setSelectedImage(prod.image);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${product.name} (x${quantity}) has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Product not found</h1>
          <Link to="/shop" className="btn btn-primary py-2 px-6">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Ensure benefits is always an array for rendering
  const benefitsArray = Array.isArray(product?.benefits)
    ? (product?.benefits as string[])
    : (typeof product?.benefits === 'string' && product.benefits.length > 0)
      ? product.benefits.split('\n').map((b: string) => b.trim()).filter((b: string) => b)
      : [];

  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="text-muted-foreground hover:text-primary-foreground transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image Gallery */}
          <div>
            <div className="border border-border rounded-lg mb-4">
              <img
                src={selectedImage ? selectedImage : ''}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            <div className="flex space-x-2">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  className={`w-20 h-20 border rounded-md overflow-hidden ${selectedImage === img ? 'border-foreground' : 'border-border'}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            {/* Back to shop - Mobile only */}
            <Link to="/shop" className="inline-flex items-center text-sm font-medium mb-4 md:hidden">
              <ArrowLeft size={16} className="mr-1" />
              Back to Shop
            </Link>
            
            {/* Category */}
            <p className="text-sm capitalize text-muted-foreground">{product.category}</p>
            
            {/* Name & Price */}
            <h1 className="text-3xl md:text-4xl font-serif font-medium mt-1 mb-4">{product.name}</h1>
            <p className="text-2xl font-medium mb-6">Ghs{product.price}</p>
            
            {/* Description */}
            <p className="text-muted-foreground">{product.description}</p>
            
            {/* How to Use */}
            <div>
              <h3 className="font-medium mb-2">How to Use</h3>
              <p className="text-muted-foreground">{product.how_to_use}</p>
            </div>
            
            {/* Key Benefits */}
{benefitsArray.length > 0 && (
  <div className="mb-8">
    <h3 className="font-medium mb-2">Key Benefits:</h3>
    <ul className="space-y-1">
      {benefitsArray.map((benefit, index) => (
        <li key={index} className="flex items-start">
          <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
)}
            
            {/* Key Ingredients */}
            <div>
              <h3 className="font-medium mb-2">Key Ingredients</h3>
              <ul className="list-disc pl-5 space-y-1">
                {(product.ingredients ? product.ingredients.split(',').map(i => i.trim()) : []).map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            {/* Quantity */}
            <div className="mb-6">
              <label htmlFor="quantity" className="font-medium block mb-2">
                Quantity
              </label>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 border border-border rounded-l-md flex items-center justify-center"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="quantity" 
                  className="h-10 w-16 border-y border-border text-center"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button 
                  className="w-10 h-10 border border-border rounded-r-md flex items-center justify-center"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button 
                className="flex-1 btn btn-primary py-3"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} className="mr-2" />
                Add to Cart
              </button>
              <button className="sm:w-12 h-12 border border-border rounded-md flex items-center justify-center">
                <Heart size={20} />
              </button>
              <button className="sm:w-12 h-12 border border-border rounded-md flex items-center justify-center">
                <Share size={20} />
              </button>
            </div>
            
            {/* Product Details Tabs */}
            <div className="border-t border-border pt-6">
              <div className="flex space-x-6 border-b border-border">
                <button 
                  className={`pb-3 text-sm font-medium ${selectedTab === 'description' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`pb-3 text-sm font-medium ${selectedTab === 'ingredients' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedTab('ingredients')}
                >
                  Ingredients
                </button>
                <button 
                  className={`pb-3 text-sm font-medium ${selectedTab === 'howToUse' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedTab('howToUse')}
                >
                  How to Use
                </button>
              </div>
              
              <div className="py-4">
                {selectedTab === 'description' && (
                  <p>{product.description}</p>
                )}
                {selectedTab === 'ingredients' && (
                  <ul className="list-disc pl-5 space-y-1">
                    {(product.ingredients ? product.ingredients.split(',').map(i => i.trim()) : []).map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                )}
                {selectedTab === 'howToUse' && (
                  <p>{product.how_to_use}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
