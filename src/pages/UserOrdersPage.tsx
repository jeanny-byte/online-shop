import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.VITE_API_URL;

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

interface Order {
  id: string;
  order_status: string;
  tracking_code: string;
  created_at: string;
  updated_at: string;
  order_total?: number;
  items?: OrderItem[];
}

const UserOrdersPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchUserOrders();
    }
    // eslint-disable-next-line
  }, [user, isLoading]);

  const fetchUserOrders = async () => {
    if (!user || !user.email) return;
    try {
      setLoadingOrders(true);
      const res = await fetch(`${API_URL}/api/orders/user/${encodeURIComponent(user.email)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">My Orders</h1>
        {loadingOrders ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No orders found.</div>
        ) : (
          <div className="grid gap-6 max-w-2xl mx-auto">
            {orders.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/track-order?code=${order.tracking_code}`)}>
                <CardHeader>
                  
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm mb-1">Status: <span className="capitalize">{order.order_status}</span></div>
                      <div className="text-xs text-muted-foreground">Placed: {new Date(order.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">Last update: {new Date(order.updated_at).toLocaleString()}</div>
                      {order.order_total && <div className="text-xs text-muted-foreground">Total: Ghs {order.order_total.toLocaleString()}</div>}

{order.items && order.items.length > 0 && (
  <div className="mt-3">
    <div className="font-semibold text-sm mb-1">Items:</div>
    <ul className="text-xs text-muted-foreground space-y-1">
      {order.items.map(item => (
        <li key={item.product_id} className="flex justify-between">
          <span>{item.product_name} x {item.quantity}</span>
          <span>Ghs {item.total_price.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  </div>
) }
                    </div>
                    <div>
                      <div className="text-xs">Tracking Code:</div>
                      <div className="font-mono text-sm">{order.tracking_code}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;
