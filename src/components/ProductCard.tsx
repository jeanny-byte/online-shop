
import React from 'react';
import { Link } from 'react-router-dom';

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
}

const ProductCard: React.FC<ProductProps> = ({ id, name, price, image, category, featured }) => {
  return (
    <div className={`group relative ${featured ? 'animate-fade-in' : ''}`}>
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden rounded-md bg-lskin-lightGray mb-3">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Quick Add Button (appears on hover) */}
        <div className="absolute bottom-0 left-0 w-full p-3 bg-white/80 backdrop-blur-sm translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full py-2 bg-lskin-pink hover:bg-lskin-peach transition-colors text-sm font-medium">
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
          <p className="text-sm font-medium">${price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
