import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useCart } from '../context/CartContext';

// Use API URL from .env
const API_URL = process.env.VITE_API_URL;

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  featured?: boolean;
  stock_quantity?: number;
}

const ProductCard: React.FC<ProductProps> = ({ id, name, price, image, images, category, featured, stock_quantity }) => {
  const { addToCart } = useCart();
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, price, image, images, category, featured } as any, 1);
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };
  
  const imageUrl = images && images.length > 0 ? images[0] : image;

  return (
    <div className={`group relative ${featured ? 'animate-fade-in' : ''}`}>
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden rounded-md bg-lskin-lightGray mb-3 relative">
        {/* In Stock Badge */}
        {typeof stock_quantity === 'number' && stock_quantity > 0 && (
  <span className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
    {stock_quantity} in stock
  </span>
)}
{typeof stock_quantity === 'number' && stock_quantity <= 0 && (
  <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
    Out of Stock
  </span>
)}
        <Link to={`/product/${id}`}>
          <img
            src={imageUrl ? imageUrl : '/placeholder.jpg'}
            alt={name}
            className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Quick Add Button (appears on hover) */}
        <div className="absolute bottom-0 left-0 w-full p-3 bg-white/80 backdrop-blur-sm translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button 
            className="w-full py-2 bg-lskin-pink hover:bg-lskin-peach transition-colors text-sm font-medium disabled:bg-gray-300 disabled:text-gray-500"
            onClick={handleQuickAdd}
            disabled={typeof stock_quantity === 'number' && stock_quantity <= 0}
          >
            Quick Add
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground capitalize">{category}</p>
            <h3 className="mt-1 text-base font-medium">
              <Link to={`/product/${id}`} className="hover:underline">{name}</Link>
            </h3>
          </div>
          <p className="text-sm font-medium">Ghs{price}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
