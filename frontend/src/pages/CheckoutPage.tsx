import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { useCart } from '../context/CartContext';
import { useLoading } from '../context/LoadingContext';
import { useSettings } from '../context/SettingsContext';
import { formatOrderForWhatsApp, sendOrderToWhatsApp } from '../lib/orderUtils';
import { initializePaystackPayment } from '../lib/paystack';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CreditCard, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

type CheckoutFormData = { 
  fullName: string; 
  email: string; 
  phone: string; 
  address: string; 
  city: string; 
  state: string; 
  zipCode: string; 
  paymentMethod: 'paystack' | 'whatsapp';
  deliveryOption: 'personal_rider' | 'delivery_service';
};

const CheckoutPage: React.FC = () => {
  // Delivery fee logic
  function getDeliveryFee(city: string, region: string, deliveryOption: string): number {
    if (deliveryOption !== 'delivery_service') return 0;
    const cityLower = city.trim().toLowerCase();
    const regionLower = region.trim().toLowerCase();
    if (regionLower === 'greater accra' && cityLower !== 'accra') return 45;
    if (regionLower === 'greater accra' && (cityLower === 'tema' || cityLower === 'nsawam')) return 55;
    if (regionLower !== 'greater accra') return 45; 
    return 0;
  }

  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'paystack',
      deliveryOption: 'delivery_service',
    }
  });
  
  const { user } = useAuth();
  const city = watch('city') || '';
  const region = watch('state') || '';
  const deliveryOption = watch('deliveryOption') || '';
  const [deliveryFee, setDeliveryFee] = useState(0);
  const totalWithDelivery = cartTotal + deliveryFee;

  // Update deliveryFee whenever city, region, or deliveryOption changes
  useEffect(() => {
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
          if (profile.name) setValue('fullName', profile.name);
          if (profile.email) setValue('email', profile.email);
          if (profile.phone) setValue('phone', profile.phone);
          if (profile.shipping_address) setValue('address', profile.shipping_address);
          if (profile.city) setValue('city', profile.city);
          if (profile.state) setValue('state', profile.state);
        } catch {
          // Ignore profile fetch failure on autofill
        }
      }
    };
    fetchProfile();
  }, [user, setValue]);

  const { settings: storeSettings } = useSettings();

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    startLoading('Placing your order...');

    try {
      const shippingAddress = `${data.address || ''}, ${data.city}, ${data.state} ${data.zipCode || ''}`.trim();
      const tracking_code = Math.random().toString(36).substring(2, 8).toUpperCase();

      // ── Step 1: Create order and atomically decrement stock on backend ──
      startLoading('Creating order...');
      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          customer_name: data.fullName,
          customer_email: data.email || (user ? user.email : ''),
          customer_phone: data.phone,
          shipping_address: shippingAddress,
          order_total: totalWithDelivery,
          payment_method: data.paymentMethod,
          tracking_code,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price_per_item: item.product.price,
          })),
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || orderResult.errors?.items?.[0] || 'Failed to create order');
      }

      const trackingCode = orderResult.tracking_code || tracking_code;

      // ── Step 2: Payment flow handling ──
      if (data.paymentMethod === 'whatsapp') {
        startLoading('Preparing WhatsApp checkout...');
        const orderDetails = {
          id: orderResult.id,
          customer_name: data.fullName,
          customer_email: data.email,
          customer_phone: data.phone,
          shipping_address: shippingAddress,
          order_total: totalWithDelivery,
          payment_method: 'whatsapp',
          tracking_code: trackingCode,
          items: cart,
        };
        clearCart();
        toast({ title: 'Order placed!', description: 'Redirecting to WhatsApp to confirm your order.' });
        
        const whatsappNumber = storeSettings?.whatsapp_number?.replace(/\D/g, '') || '233557246424';
        sendOrderToWhatsApp(formatOrderForWhatsApp(orderDetails), whatsappNumber);
        navigate(`/track-order?code=${trackingCode}`);
        return;
      }

      if (data.paymentMethod === 'paystack') {
        startLoading('Connecting to secure payment gateway...');
        const customerEmail = data.email || (user ? user.email : `${data.phone.replace(/\D/g, '')}@nelysah.com`);

        const initResult = await initializePaystackPayment(
          totalWithDelivery,
          customerEmail,
          trackingCode,
          {
            customer_name: data.fullName,
            customer_phone: data.phone,
            shipping_address: shippingAddress,
          }
        );

        if (initResult && initResult.authorizationUrl) {
          clearCart();
          toast({ title: 'Redirecting to Paystack…', description: 'Complete your payment securely.' });
          window.location.href = initResult.authorizationUrl;
          return;
        } else {
          throw new Error(initResult.message || 'Failed to initiate online payment');
        }
      }

      // Fallback
      clearCart();
      navigate(`/track-order?code=${trackingCode}`);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      stopLoading();
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
                        Email Address* (for receipts & tracking)
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-border'}`}
                        {...register('email', { 
                          required: 'Email is required for receipt',
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
                        State/Region*
                      </label>
                      <select
                        id="state"
                        className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-border'}`}
                        {...register('state', { required: 'State/Region is required' })}
                        onChange={e => {
                          register('state').onChange(e);
                          setDeliveryFee(getDeliveryFee(city, e.target.value, deliveryOption));
                        }}
                      >
                        <option value="">Select a region</option>
                        <option value="Greater Accra">Greater Accra</option>
                        <option value="Ashanti">Ashanti</option>
                        <option value="Central">Central</option>
                        <option value="Eastern">Eastern</option>
                        <option value="Western">Western</option>
                        <option value="Volta">Volta</option>
                        <option value="Bono">Bono</option>
                        <option value="Bono East">Bono East</option>
                        <option value="Ahafo">Ahafo</option>
                        <option value="Northern">Northern</option>
                        <option value="North East">North East</option>
                        <option value="Savannah">Savannah</option>
                        <option value="Upper East">Upper East</option>
                        <option value="Upper West">Upper West</option>
                        <option value="Oti">Oti</option>
                        <option value="Western North">Western North</option>
                      </select>
                      {errors.state && <span className="text-sm text-red-500">{errors.state.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        GPS / Postal Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        placeholder="e.g. GA-123-4567"
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
                <h2 className="text-xl font-serif mb-4">Delivery Option</h2>
                <div className="space-y-4">
                  <div>
                    <select
                      id="deliveryOption"
                      className={`w-full p-2 border rounded-md ${errors.deliveryOption ? 'border-red-500' : 'border-border'}`}
                      {...register('deliveryOption', { required: 'Delivery option is required' })}
                      onChange={e => {
                        register('deliveryOption').onChange(e);
                        setDeliveryFee(getDeliveryFee(city, region, e.target.value));
                      }}
                    >
                      <option value="delivery_service">Direct Delivery Service</option>
                      <option value="personal_rider">Pick up by Personal Rider (Free)</option>
                    </select>
                    {errors.deliveryOption && <span className="text-sm text-red-500">{errors.deliveryOption.message}</span>}
                  </div>
                </div>
              </div>
              
              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-serif mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-secondary/40 transition-colors">
                    <input
                      id="paystack"
                      type="radio"
                      value="paystack"
                      className="mr-3"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="paystack" className="flex items-center cursor-pointer w-full">
                      <CreditCard className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <span className="font-medium">Pay Online (Card / Mobile Money)</span>
                        <p className="text-xs text-muted-foreground">Instant checkout via Paystack (MTN MoMo, Telecel, AT, Visa/Mastercard)</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-secondary/40 transition-colors">
                    <input
                      id="whatsapp"
                      type="radio"
                      value="whatsapp"
                      className="mr-3"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="whatsapp" className="flex items-center cursor-pointer w-full">
                      <MessageSquare className="h-5 w-5 mr-3 text-green-600" />
                      <div>
                        <span className="font-medium">Order via WhatsApp</span>
                        <p className="text-xs text-muted-foreground">Place your order and finalize details directly via WhatsApp</p>
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
                {isSubmitting ? 'Processing Order...' : `Complete Order (Ghs ${totalWithDelivery.toFixed(2)})`}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-secondary/20 p-6 rounded-md border border-border">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              
              <div className="mb-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between py-2 border-b border-border last:border-b-0 text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x </span>
                      <span>{item.product.name}</span>
                    </div>
                    <span className="font-medium">Ghs {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Ghs {cartTotal.toFixed(2)}</span>
                </div>
                {deliveryOption === 'delivery_service' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>Ghs {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>Ghs {totalWithDelivery.toFixed(2)}</span>
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
