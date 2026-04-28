import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;

import AdminLayout from './components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DollarSign, Package, ShoppingBag, Clock } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_URL}/api/dashboard`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    const data = await res.json();
    setStats({
      totalOrders: data.totalOrders || 0,
      totalProducts: data.totalProducts || 0,
      pendingOrders: data.pendingOrders || 0,
      totalRevenue: data.totalRevenue || 0,
    });
    setRecentOrders(data.recentOrders || []);
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time customer orders
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders awaiting processing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active products in inventory
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">  Ghs{Number(stats.totalRevenue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime store revenue
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" asChild>
                <Link to="/admin/orders">View All Orders</Link>
              </Button>
            </CardHeader>
            
            {recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.tracking_code}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>Ghs{order.order_total}</TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor(order.order_status))}>
                          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent>
                <p className="text-center text-muted-foreground">No orders yet</p>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
