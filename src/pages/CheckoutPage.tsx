
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { initializePayment, generatePaymentReference } from '../lib/paystack';
import { formatOrderForWhatsApp, sendOrderToWhatsApp } from '../lib/orderUtils';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CreditCard } from 'lucide-react';

type CheckoutFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'paystack' | 'whatsapp';
};

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'paystack'
    }
  });
  
  const paymentMethod = watch('paymentMethod');
  
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
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: data.fullName,
          customer_email: data.email,
          customer_phone: data.phone,
          shipping_address: shippingAddress,
          order_total: cartTotal,
          payment_method: data.paymentMethod,
          order_status: 'pending',
          tracking_code
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_item: item.product.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Handle payment method
      if (data.paymentMethod === 'paystack') {
        try {
          // Generate a unique reference for this payment
          const paymentRef = generatePaymentReference();
          
          // Prepare metadata for the payment
          const metadata = {
            order_id: order.id,
            tracking_code,
            customer_name: data.fullName
          };
          
          // Initialize Paystack payment
          const paystackResponse = await initializePayment(
            data.email,
            cartTotal,
            paymentRef,
            metadata
          );
          
          if (paystackResponse.status) {
            // Update order with payment reference
            await supabase
              .from('orders')
              .update({ 
                payment_reference: paymentRef,
                order_status: 'awaiting_payment' 
              })
              .eq('id', order.id);
            
            // Forward order details to admin WhatsApp
            const orderDetails = {
              id: order.id,
              customer_name: data.fullName,
              customer_email: data.email,
              customer_phone: data.phone,
              shipping_address: shippingAddress,
              order_total: cartTotal,
              payment_method: 'paystack',
              tracking_code,
              items: cart
            };
            
            const whatsappMessage = formatOrderForWhatsApp(orderDetails);
            
            // This would normally be done server-side after payment confirmation
            // For demo purposes, we're sending it immediately
            const adminWhatsappNumber = '1234567890'; // Replace with your actual WhatsApp number
            sendOrderToWhatsApp(whatsappMessage, adminWhatsappNumber);
            
            toast({
              title: "Order placed successfully",
              description: "You will be redirected to Paystack to complete your payment.",
            });
            
            // Redirect to Paystack payment page
            window.location.href = paystackResponse.data.authorization_url;
          } else {
            throw new Error("Failed to initialize payment");
          }
        } catch (paymentError) {
          console.error('Payment initialization error:', paymentError);
          toast({
            title: "Payment Error",
            description: "There was an error initializing your payment. Please try again.",
            variant: "destructive",
          });
        }
      } else if (data.paymentMethod === 'whatsapp') {
        // Format order details for WhatsApp
        const orderDetails = {
          id: order.id,
          customer_name: data.fullName,
          customer_email: data.email,
          customer_phone: data.phone,
          shipping_address: shippingAddress,
          order_total: cartTotal,
          payment_method: 'whatsapp',
          tracking_code,
          items: cart
        };
        
        const whatsappMessage = formatOrderForWhatsApp(orderDetails);
        
        // Send to admin WhatsApp
        const adminWhatsappNumber = '1234567890'; // Replace with your actual WhatsApp number
        sendOrderToWhatsApp(whatsappMessage, adminWhatsappNumber);
        
        toast({
          title: "Order placed successfully",
          description: "You will be redirected to WhatsApp to complete your order.",
        });
      }
      
      // Clear the cart and navigate to success page
      clearCart();
      navigate(`/track-order?code=${tracking_code}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
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
                        Email*
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-border'}`}
                        {...register('email', { 
                          required: 'Email is required',
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
                      Street Address*
                    </label>
                    <input
                      id="address"
                      type="text"
                      className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-border'}`}
                      {...register('address', { required: 'Address is required' })}
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
                      />
                      {errors.city && <span className="text-sm text-red-500">{errors.city.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State/Province*
                      </label>
                      <input
                        id="state"
                        type="text"
                        className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-border'}`}
                        {...register('state', { required: 'State is required' })}
                      />
                      {errors.state && <span className="text-sm text-red-500">{errors.state.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        ZIP/Postal Code*
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        className={`w-full p-2 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-border'}`}
                        {...register('zipCode', { required: 'ZIP code is required' })}
                      />
                      {errors.zipCode && <span className="text-sm text-red-500">{errors.zipCode.message}</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-xl font-serif mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-lskin-lightGray transition-colors">
                    <input
                      id="paystack"
                      type="radio"
                      value="paystack"
                      className="mr-2"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="paystack" className="flex items-center cursor-pointer w-full">
                      <CreditCard className="h-5 w-5 mr-2" />
                      <div>
                        <span className="font-medium">Pay online with Paystack</span>
                        <p className="text-sm text-muted-foreground">Secure online payment</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-lskin-lightGray transition-colors">
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
              </div>
              
              <Button
                type="submit"
                className="w-full py-6 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order via WhatsApp'}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-lskin-lightGray p-6 rounded-md">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              
              <div className="mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <span>{item.quantity}x </span>
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
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
