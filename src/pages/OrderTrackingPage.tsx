
import React, { useState } from 'react';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';


interface TrackingFormData {
  trackingCode: string;
}

interface OrderDetails {
  id: string;
  customer_name: string;
  order_status: string;
  tracking_code: string;
  created_at: string;
  updated_at: string;
}

const OrderTrackingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');

  // Animate progress bar width on mount and when order status changes
  React.useEffect(() => {
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
      const response = await fetch(`${API_URL}/api/order-tracking/${code}`);
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

  // Extract tracking code from URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setValue('trackingCode', code);
      fetchOrder(code);
    }
  }, [location.search]);
  
  const onSubmit = async (data: TrackingFormData) => {
    fetchOrder(data.trackingCode);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
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
          <div className="bg-lskin-lightGray p-6 rounded-md mb-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="trackingCode" className="block text-sm font-medium mb-1">
                  Enter your tracking code
                </label>
                <div className="flex">
                  <input
                    id="trackingCode"
                    type="text"
                    className={`flex-1 p-2 border rounded-l-md ${errors.trackingCode ? 'border-red-500' : 'border-border'}`}
                    placeholder="e.g., ABC123"
                    {...register('trackingCode', { required: 'Tracking code is required' })}
                  />
                  <button
                    type="submit"
                    className="bg-lskin-pink px-4 py-2 rounded-r-md hover:bg-lskin-peach transition-colors"
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
            <div className="border border-border rounded-md overflow-hidden">
              <div className="bg-white p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-medium">Order #{orderDetails.tracking_code}</h2>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(orderDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.order_status.toLowerCase())}`}>
                    {orderDetails.order_status.charAt(0).toUpperCase() + orderDetails.order_status.slice(1).toLowerCase()}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Shipping to</h3>
                  <p>{orderDetails.customer_name}</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-medium mb-4">Order Status</h3>
                  
                  <div className="relative">
                    {/* Progress Bar */}
                    {orderDetails && (
                      <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200">
                        <div
                          className={`h-1 transition-all duration-700 ease-in-out ${
                            orderDetails.order_status.toLowerCase() === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: progressWidth }}
                        ></div>
                      </div>
                    )} 
                    
                    {/* Status Steps */}
                    <div className="flex justify-between">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                        const orderStatusLower = orderDetails.order_status.toLowerCase();
                        const isCompleted = getStatusStepCompleted(orderStatusLower, status);
                        const isActive = orderStatusLower === status;

                        let colorClass = '';
                        if (isActive) {
                          switch (status) {
                            case 'processing':  colorClass = 'bg-blue-500 text-white';   break;
                            case 'shipped':     colorClass = 'bg-purple-500 text-white'; break;
                            case 'delivered':   colorClass = 'bg-green-500 text-white';  break;
                            case 'cancelled':   colorClass = 'bg-red-500 text-white';    break;
                            default:            colorClass = 'bg-yellow-500 text-white';
                          }
                        } else if (isCompleted) {
                          colorClass = 'bg-green-500 text-white';
                        } else {
                          colorClass = 'bg-gray-200';
                        }

                        return (
                          <div key={status} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
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
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
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
