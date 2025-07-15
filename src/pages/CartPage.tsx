
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Trash } from 'lucide-react';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">Your Cart</h1>
          <div className="text-center py-16">
            <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/shop" className="btn btn-primary py-2 px-6">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-md overflow-hidden">
              {cart.map((item) => (
                <div key={item.product.id} className="flex flex-col sm:flex-row p-4 border-b border-border last:border-b-0">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-grow sm:ml-4">
                    <div className="flex justify-between">
                      <Link to={`/product/${item.product.id}`} className="font-medium hover:underline">
                        {item.product.name}
                      </Link>
                      <span className="font-medium">Ghs{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground my-2">
                      Ghs{item.product.price} each
                    </p>
                    
                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <button 
                          className="w-8 h-8 border border-border rounded-l-md flex items-center justify-center"
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className="h-8 w-12 border-y border-border text-center"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        />
                        <button 
                          className="w-8 h-8 border border-border rounded-r-md flex items-center justify-center"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Back to Shop */}
            <div className="mt-6">
              <Link to="/shop" className="inline-flex items-center text-sm font-medium hover:underline">
                <ArrowLeft size={16} className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-lskin-lightGray p-6 rounded-md">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Ghs{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>Ghs{cartTotal}</span>
                </div>
              </div>
              
              <Link to="/checkout" className="btn btn-primary w-full py-3">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
