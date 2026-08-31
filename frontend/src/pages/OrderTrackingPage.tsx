import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { verifyPaystackPayment } from '@/lib/paystack';

const API_URL = import.meta.env.VITE_API_URL || '';

interface TrackingFormData {
  trackingCode: string;
}

interface OrderItem {
  id?: number;
  product_id: string | number;
  quantity: number;
  price_per_item: number;
  product?: {
    name: string;
    image?: string;
  };
}

interface OrderDetails {
  id: string | number;
  customer_name: string;
  customer_phone?: string;
  shipping_address?: string;
  order_status: string;
  payment_status?: string;
  payment_method?: string;
  tracking_code: string;
  order_total?: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

const OrderTrackingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');

  // Animate progress bar width on mount and when order status changes
  useEffect(() => {
    if (!orderDetails) {
      setProgressWidth('0%');
      return;
    }
    const status = orderDetails.order_status.toLowerCase();
    let width = '0%';
    switch (status) {
      case 'pending':     width = '0%';   break;
      case 'processing':  width = '33%';  break;
      case 'shipped':     width = '66%';  break;
      case 'delivered':
      case 'cancelled':   width = '100%'; break;
      default:            width = '0%';
    }
    setProgressWidth('0%');
    const raf = requestAnimationFrame(() => setProgressWidth(width));
    return () => cancelAnimationFrame(raf);
  }, [orderDetails]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TrackingFormData>();
  
  const fetchOrder = async (code: string) => {
    if (!code) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/order-tracking/${encodeURIComponent(code)}`);
      if (!response.ok) {
        setOrderDetails(null);
        toast({
          title: 'Order not found',
          description: 'No order found with that tracking code. Please double-check and try again.',
          variant: 'destructive',
        });
        return;
      }
      const responseData = await response.json();
      if (responseData && responseData.order) {
        setOrderDetails(responseData.order);
      } else {
        setOrderDetails(null);
        toast({
          title: 'Order not found',
          description: 'No order matched that tracking code.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrderDetails(null);
      toast({
        title: 'Connection error',
        description: 'Could not reach the server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract tracking code or payment reference from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const reference = params.get('reference') || params.get('trxref');

    if (code) {
      setValue('trackingCode', code);
      fetchOrder(code);
    }

    if (reference) {
      verifyPaystackPayment(reference).then((res) => {
        if (res.status === 'success' && res.verified) {
          toast({
            title: 'Payment Successful!',
            description: 'Your payment was confirmed and your order status is now updated.',
          });
          if (code) fetchOrder(code);
        }
      });
    }
  }, [location.search]);
  
  const onSubmit = async (data: TrackingFormData) => {
    fetchOrder(data.trackingCode);
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusStepCompleted = (orderStatus: string, stepStatus: string) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const orderIndex = statuses.indexOf(orderStatus);
    const stepIndex = statuses.indexOf(stepStatus);
    
    if (orderIndex === -1 || stepIndex === -1) return false;
    return orderIndex >= stepIndex;
  };
  
  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">Track Your Order</h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-secondary/30 p-6 rounded-md mb-8 border border-border">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-2">
                <label htmlFor="trackingCode" className="block text-sm font-medium mb-1">
                  Enter your tracking code
                </label>
                <div className="flex gap-2">
                  <input
                    id="trackingCode"
                    type="text"
                    className={`flex-1 p-2 border rounded-md uppercase font-mono ${errors.trackingCode ? 'border-red-500' : 'border-border'}`}
                    placeholder="e.g., ABC123"
                    {...register('trackingCode', { required: 'Tracking code is required' })}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary px-6 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Tracking...' : 'Track Order'}
                  </button>
                </div>
                {errors.trackingCode && (
                  <span className="text-sm text-red-500">{errors.trackingCode.message}</span>
                )}
              </div>
            </form>
          </div>
          
          {orderDetails && (
            <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-medium font-serif">Order #{orderDetails.tracking_code}</h2>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(orderDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderDetails.order_status)}`}>
                      {orderDetails.order_status.toUpperCase()}
                    </div>
                    {orderDetails.payment_status && (
                      <span className={`text-xs px-2 py-0.5 rounded ${orderDetails.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        Payment: {orderDetails.payment_status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted/40 p-4 rounded-md">
                  <div>
                    <h3 className="font-semibold mb-1">Customer & Destination</h3>
                    <p className="font-medium">{orderDetails.customer_name}</p>
                    {orderDetails.shipping_address && <p className="text-muted-foreground">{orderDetails.shipping_address}</p>}
                    {orderDetails.customer_phone && <p className="text-muted-foreground">Tel: {orderDetails.customer_phone}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Order Summary</h3>
                    {orderDetails.order_total && <p className="font-medium">Total: Ghs {Number(orderDetails.order_total).toFixed(2)}</p>}
                    <p className="text-muted-foreground capitalize">Method: {orderDetails.payment_method || 'Standard'}</p>
                  </div>
                </div>

                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div className="mb-8 border-t border-border pt-4">
                    <h3 className="font-semibold text-sm mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {orderDetails.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-b-0">
                          <span>{item.quantity}x {item.product?.name || `Product #${item.product_id}`}</span>
                          <span className="font-medium">Ghs {(item.price_per_item * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="font-medium mb-4 text-sm">Fulfillment Progress</h3>
                  
                  <div className="relative">
                    {/* Progress Bar */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-muted">
                      <div
                        className={`h-1 transition-all duration-700 ease-in-out ${
                          orderDetails.order_status.toLowerCase() === 'cancelled' ? 'bg-red-500' : 'bg-primary'
                        }`}
                        style={{ width: progressWidth }}
                      ></div>
                    </div>
                    
                    {/* Status Steps */}
                    <div className="flex justify-between">
                      {['pending', 'processing', 'shipped', 'delivered'].map((status) => {
                        const orderStatusLower = orderDetails.order_status.toLowerCase();
                        const isCompleted = getStatusStepCompleted(orderStatusLower, status);
                        const isActive = orderStatusLower === status;

                        let colorClass = '';
                        if (isActive) {
                          switch (status) {
                            case 'processing':  colorClass = 'bg-blue-600 text-white';   break;
                            case 'shipped':     colorClass = 'bg-purple-600 text-white'; break;
                            case 'delivered':   colorClass = 'bg-green-600 text-white';  break;
                            default:            colorClass = 'bg-amber-500 text-white';
                          }
                        } else if (isCompleted) {
                          colorClass = 'bg-green-600 text-white';
                        } else {
                          colorClass = 'bg-muted text-muted-foreground';
                        }

                        return (
                          <div key={status} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}>
                              {isCompleted ? '✓' : ''}
                            </div>
                            <span className="text-xs font-medium mt-2 text-center capitalize">
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Last updated on {new Date(orderDetails.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
