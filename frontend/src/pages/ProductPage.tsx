import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || '';

export type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  stock_quantity?: number;
  featured?: boolean;
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
    window.scrollTo(0, 0);
  }, [id]);
  
  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const prod = await res.json();
      setProduct(prod);
      if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
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
      addToCart(product as any, quantity);
      toast({
        title: "Added to cart",
        description: `${product.name} (x${quantity}) has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-medium mb-4">Product Not Found</h1>
          <Link to="/shop" className="btn btn-primary py-2 px-6">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const imageList = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-muted-foreground hover:text-primary transition-colors capitalize">
              {product.category}
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image Gallery */}
          <div>
            <div className="border border-border rounded-xl mb-4 overflow-hidden bg-secondary/10 aspect-square flex items-center justify-center">
              <img
                src={selectedImage || product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            {imageList.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {imageList.map((img, index) => (
                  <button
                    key={index}
                    className={`w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all ${selectedImage === img ? 'border-primary shadow-sm' : 'border-border opacity-70 hover:opacity-100'}`}
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
            )}
          </div>
          
          {/* Product Details */}
          <div>
            {/* Back to shop - Mobile only */}
            <Link to="/shop" className="inline-flex items-center text-sm font-medium mb-4 md:hidden text-muted-foreground hover:text-primary">
              <ArrowLeft size={16} className="mr-1" />
              Back to Shop
            </Link>
            
            {/* Category Tag */}
            <div className="mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                {product.category}
              </span>
            </div>
            
            {/* Name & Price */}
            <h1 className="text-3xl md:text-4xl font-serif font-medium mt-2 mb-3 text-foreground">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-2xl md:text-3xl font-semibold text-primary">Ghs {Number(product.price).toFixed(2)}</p>
              {inStock ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">In Stock</span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800">Out of Stock</span>
              )}
            </div>
            
            {/* Description */}
            <div className="prose prose-sm text-muted-foreground mb-8">
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
            
            {/* Quantity Selector */}
            {inStock && (
              <div className="mb-6">
                <label htmlFor="quantity" className="font-medium text-sm block mb-2">
                  Quantity
                </label>
                <div className="flex items-center w-36">
                  <button 
                    className="w-10 h-10 border border-border rounded-l-md flex items-center justify-center hover:bg-secondary transition-colors"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity" 
                    className="h-10 w-16 border-y border-border text-center font-medium bg-background"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button 
                    className="w-10 h-10 border border-border rounded-r-md flex items-center justify-center hover:bg-secondary transition-colors"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button 
                className="flex-1 btn btn-primary py-3.5 flex items-center justify-center text-base"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingBag size={18} className="mr-2" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                className="w-12 h-12 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                title="Save to wishlist"
              >
                <Heart size={20} className="text-muted-foreground" />
              </button>
              <button 
                className="w-12 h-12 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied!", description: "Product link copied to clipboard." });
                }}
                title="Share product"
              >
                <Share2 size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            {/* Highlights / Guarantees */}
            <div className="border-t border-border pt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Fast regional delivery available across Ghana</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <span>100% Authentic quality guaranteed</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Secure payment via Paystack (Cards & Mobile Money) or WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
