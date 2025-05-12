
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminLayout from './components/AdminLayout';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total orders
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        // Fetch total products
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Fetch pending orders
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('order_status', 'pending');
        
        // Calculate total revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('order_total');
        
        const totalRevenue = orders?.reduce((sum, order) => sum + order.order_total, 0) || 0;
        
        // Fetch recent orders
        const { data: recent } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setStats({
          totalOrders: totalOrders || 0,
          totalProducts: totalProducts || 0,
          pendingOrders: pendingOrders || 0,
          totalRevenue,
        });
        
        setRecentOrders(recent || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
  
  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-md border border-border">
              <h3 className="text-lg font-medium">Total Orders</h3>
              <p className="text-3xl mt-2">{stats.totalOrders}</p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-border">
              <h3 className="text-lg font-medium">Pending Orders</h3>
              <p className="text-3xl mt-2">{stats.pendingOrders}</p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-border">
              <h3 className="text-lg font-medium">Total Products</h3>
              <p className="text-3xl mt-2">{stats.totalProducts}</p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-border">
              <h3 className="text-lg font-medium">Total Revenue</h3>
              <p className="text-3xl mt-2">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white rounded-md border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Recent Orders</h2>
                <Link to="/admin/orders" className="text-sm underline hover:text-primary-foreground">
                  View All Orders
                </Link>
              </div>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">#{order.tracking_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">${order.order_total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.order_status)}`}>
                            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
