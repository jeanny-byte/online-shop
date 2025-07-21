import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { useCart } from '../context/CartContext';
import { formatOrderForWhatsApp, sendOrderToWhatsApp } from '../lib/orderUtils';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

type CheckoutFormData = { 
  fullName: string; 
  email: string; 
  phone: string; 
  address: string; 
  city: string; 
  state: string; 
  zipCode: string; 
  paymentMethod: 'whatsapp' | 'hubtel';
  deliveryOption: 'personal_rider' | 'delivery_service';
};

const CheckoutPage: React.FC = () => {
  // Delivery fee logic
  function getDeliveryFee(city: string, region: string, deliveryOption: string): number {
    if (deliveryOption !== 'delivery_service') return 0;
    const cityLower = city.trim().toLowerCase();
    const regionLower = region.trim().toLowerCase();
    if (regionLower === 'greater accra' && cityLower !== 'accra') return 45;
    if (regionLower === 'greater accra' && cityLower === 'tema' || cityLower === 'nsawam') return 55;
    if (regionLower !== 'greater accra' ) return 45; 
    return 0;
  }

  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'whatsapp',
      deliveryOption: 'delivery_service'
    }
  });
  
  const { user } = useAuth();
const paymentMethod = watch('paymentMethod');
  const city = watch('city') || '';
  const region = watch('state') || '';
  const deliveryOption = watch('deliveryOption') || '';
  const [deliveryFee, setDeliveryFee] = useState(0);
  const totalWithDelivery = cartTotal + deliveryFee;

  // Update deliveryFee whenever city, region, or deliveryOption changes
  React.useEffect(() => {
    setDeliveryFee(getDeliveryFee(city, region, deliveryOption));
  }, [city, region, deliveryOption]);

  // Autofill user profile data if logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.email) {
        try {
          const res = await fetch(`${API_URL}/api/profile/email/${encodeURIComponent(user.email)}`);
          if (!res.ok) return;
          const profile = await res.json();
          if (profile.full_name) setValue('fullName', profile.full_name);
          if (profile.email) setValue('email', profile.email);
          if (profile.phone) setValue('phone', profile.phone);
          if (profile.shipping_address) setValue('address', profile.shipping_address);
          if (profile.city) setValue('city', profile.city);
          if (profile.state) setValue('state', profile.state);
        } catch (error) {
          // Optionally handle error
        }
      }
    };
    fetchProfile();
    // Only run when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format shipping address
      const shippingAddress = `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`;
      
      // Generate a random tracking code
      const tracking_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create order in database
      console.warn('Creating order is not implemented');
      const order = { id: 'fake_order_id' };
      
      // Add order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_item: item.product.price
      }));
      
      // Handle payment method
      if (data.paymentMethod === 'whatsapp') {
        // Format order details for WhatsApp
        const orderDetails = {
          id: 'fake_order_id', // You can ignore this field for frontend
          customer_name: data.fullName,
          customer_email: data.email,
          customer_phone: data.phone,
          shipping_address: shippingAddress,
          order_total: cartTotal,
          payment_method: 'whatsapp',
          tracking_code,
          items: cart
        };

        // 1. Store order in database
        try {
          const response = await fetch(`${API_URL}/api/orders/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: orderDetails.customer_name,
              customer_email: orderDetails.customer_email,
              customer_phone: orderDetails.customer_phone,
              shipping_address: orderDetails.shipping_address,
              order_total: orderDetails.order_total,
              payment_method: orderDetails.payment_method,
              tracking_code: orderDetails.tracking_code,
              items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price_per_item: item.product.price
              }))
            })
          });

          if (!response.ok) {
            throw new Error('Failed to store order. Please try again.');
          }

          toast({
            title: "Order placed successfully",
            description: "You will be redirected to WhatsApp to complete your order.",
          });
          setTimeout(() => {
            
          }, 2000);

          // 2. Prepare WhatsApp message and redirect
          const whatsappMessage = formatOrderForWhatsApp(orderDetails);
          const adminWhatsappNumber = '233557246424'; // Ghana format, change to your number
          sendOrderToWhatsApp(whatsappMessage, adminWhatsappNumber);

          // Update stock after order is placed
          try {
            const stockResponse = await fetch('/api/products/update-stock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
              })))
            });
            if (!stockResponse.ok) {
              throw new Error('Failed to update product stock');
            }
          } catch (stockErr) {
            toast({
              title: 'Order placed, but stock update failed',
              description: 'Please contact support if you have issues.',
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
          clearCart();
          navigate(`/track-order?code=${tracking_code}`);
          return;
        } catch (err: any) {
          toast({
            title: "Order failed",
            description: err.message || "Could not create order in store.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (data.paymentMethod === 'hubtel') {
        // Online payment via Hubtel
        try {
          const response = await fetch(`${API_URL}/api/payments/hubtel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: cartTotal,
              customerName: data.fullName,
              customerEmail: data.email,
              customerPhone: data.phone,
              orderId: tracking_code,
              description: `Order for ${data.fullName}`
            })
          });
          const result = await response.json();
          if (response.ok && result.paymentUrl) {
            toast({
              title: "Redirecting to payment",
              description: "You will be redirected to Hubtel to complete your payment.",
            });
            // Update stock after initiating payment
            try {
              const stockResponse = await fetch('/api/products/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart.map(item => ({
                  productId: item.product.id,
                  quantity: item.quantity
                })))
              });
              if (!stockResponse.ok) {
                throw new Error('Failed to update product stock');
              }
            } catch (stockErr) {
              toast({
                title: 'Order placed, but stock update failed',
                description: 'Please contact support if you have issues.',
                variant: 'destructive',
              });
              setIsSubmitting(false);
              return;
            }
            clearCart();
            window.location.href = result.paymentUrl;
            return;
          } else {
            throw new Error(result.error || 'Failed to initiate payment');
          }
        } catch (err: any) {
          toast({
            title: "Payment failed",
            description: err.message || 'Could not connect to payment gateway.',
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Clear the cart and navigate to success page
      clearCart();
      navigate(`/track-order?code=${tracking_code}`);
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: `There was an error processing your order. Please try again. ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">Checkout</h1>
          <div className="text-center py-16">
            <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some products to your cart before checkout.</p>
            <button 
              onClick={() => navigate('/shop')}
              className="btn btn-primary py-2 px-6"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Customer Information */}
              <div className="mb-8">
                <h2 className="text-xl font-serif mb-4">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name*
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className={`w-full p-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-border'}`}
                      {...register('fullName', { required: 'Full name is required' })}
                    />
                    {errors.fullName && <span className="text-sm text-red-500">{errors.fullName.message}</span>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-border'}`}
                        {...register('email', { 
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone Number*
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-border'}`}
                        {...register('phone', { required: 'Phone number is required' })}
                      />
                      {errors.phone && <span className="text-sm text-red-500">{errors.phone.message}</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping Information */}
              <div className="mb-8">
                <h2 className="text-xl font-serif mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Street Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-border'}`}
                      {...register('address')}
                    />
                    {errors.address && <span className="text-sm text-red-500">{errors.address.message}</span>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City*
                      </label>
                      <input
                        id="city"
                        type="text"
                        className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-border'}`}
                        {...register('city', { required: 'City is required' })}
                        onChange={e => {
                          register('city').onChange(e);
                          setDeliveryFee(getDeliveryFee(e.target.value, region, deliveryOption));
                        }}
                      />
                      {errors.city && <span className="text-sm text-red-500">{errors.city.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State/Province*
                      </label>
                      <select
                        id="state"
                        className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-border'}`}
                        {...register('state', { required: 'State is required' })}
                        onChange={e => {
                          register('state').onChange(e);
                          setDeliveryFee(getDeliveryFee(city, e.target.value, deliveryOption));
                        }}
                      >
                        <option value="">Select a region</option>
                        <option value="Ahafo">Ahafo</option>
                        <option value="Ashanti">Ashanti</option>
                        <option value="Bono">Bono</option>
                        <option value="Bono East">Bono East</option>
                        <option value="Central">Central</option>
                        <option value="Eastern">Eastern</option>
                        <option value="Greater Accra">Greater Accra</option>
                        <option value="North East">North East</option>
                        <option value="Northern">Northern</option>
                        <option value="Oti">Oti</option>
                        <option value="Savannah">Savannah</option>
                        <option value="Upper East">Upper East</option>
                        <option value="Upper West">Upper West</option>
                        <option value="Volta">Volta</option>
                        <option value="Western">Western</option>
                        <option value="Western North">Western North</option>
                      </select>
                      {errors.state && <span className="text-sm text-red-500">{errors.state.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        ZIP/Postal Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        className={`w-full p-2 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-border'}`}
                        {...register('zipCode')}
                      />
                      {errors.zipCode && <span className="text-sm text-red-500">{errors.zipCode.message}</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Options */}
              <div className="mb-8">
                <h2 className="text-xl font-serif mb-4">Delivery Options</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="deliveryOption" className="block text-sm font-medium mb-1">
                      Delivery Options*
                    </label>
                    <select
                      id="deliveryOption"
                      className={`w-full p-2 border rounded-md ${errors.deliveryOption ? 'border-red-500' : 'border-border'}`}
                      {...register('deliveryOption', { required: 'Delivery option is required' })}
                      onChange={e => {
                        register('deliveryOption').onChange(e);
                        setDeliveryFee(getDeliveryFee(city, region, e.target.value));
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="personal_rider">Pick up by Personal Rider</option>
                      <option value="delivery_service">Delivery service</option>
                    </select>
                    {errors.deliveryOption && <span className="text-sm text-red-500">{errors.deliveryOption.message}</span>}
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-xl font-serif mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-Nelysah-lightGray transition-colors">
                    <input
                      id="whatsapp"
                      type="radio"
                      value="whatsapp"
                      className="mr-2"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="whatsapp" className="flex items-center cursor-pointer w-full">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      <div>
                        <span className="font-medium">Order via WhatsApp</span>
                        <p className="text-sm text-muted-foreground">Complete your order through WhatsApp</p>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Pay via Hubtel */}
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-Nelysah-lightGray transition-colors">
                    <input
                      id="hubtel"
                      type="radio"
                      value="hubtel"
                      className="mr-2"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="hubtel" className="flex items-center cursor-pointer w-full">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      <div>
                        <span className="font-medium">Order Online</span>
                        <p className="text-sm text-muted-foreground">Complete your order Now</p>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
              
              <Button
                type="submit"
                className="w-full py-6 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-Nelysah-lightGray p-6 rounded-md">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              
              <div className="mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <span>{item.quantity}x </span>
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                    <span>Ghs{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Ghs{cartTotal.toFixed(2)}</span>
                </div>
                {deliveryOption === 'delivery_service' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>Ghs{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>Ghs{totalWithDelivery.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
