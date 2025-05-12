
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../lib/supabase';

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
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TrackingFormData>();
  
  // Extract tracking code from URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setValue('trackingCode', code);
      onSubmit({ trackingCode: code });
    }
  }, [location.search]);
  
  const onSubmit = async (data: TrackingFormData) => {
    if (!data.trackingCode) return;
    
    setIsLoading(true);
    
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_code', data.trackingCode)
        .single();
      
      if (error) throw error;
      
      if (order) {
        setOrderDetails(order);
        
        // Update URL with tracking code
        const params = new URLSearchParams(location.search);
        params.set('code', data.trackingCode);
        navigate(`${location.pathname}?${params.toString()}`);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrderDetails(null);
      toast({
        title: "Order not found",
        description: "Please check your tracking code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
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
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.order_status)}`}>
                    {orderDetails.order_status.charAt(0).toUpperCase() + orderDetails.order_status.slice(1)}
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
                    <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200">
                      <div 
                        className="h-1 bg-green-500" 
                        style={{ 
                          width: orderDetails.order_status === 'pending' ? '0%' :
                                 orderDetails.order_status === 'processing' ? '33%' :
                                 orderDetails.order_status === 'shipped' ? '66%' :
                                 orderDetails.order_status === 'delivered' ? '100%' : '0%'
                        }}
                      ></div>
                    </div>
                    
                    {/* Status Steps */}
                    <div className="flex justify-between">
                      {['pending', 'processing', 'shipped', 'delivered'].map((status) => {
                        const isCompleted = getStatusStepCompleted(orderDetails.order_status, status);
                        
                        return (
                          <div key={status} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
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
