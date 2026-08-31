import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import AdminLayout from './components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Driver {
  id: number;
  name: string;
  email: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Export orders to CSV
  const handleExportCSV = () => {
    if (!orders.length) return;
    const headers = ['Tracking Code', 'Customer', 'Phone', 'Email', 'Address', 'Total', 'Payment Status', 'Order Status', 'Driver', 'Created At'];
    const csvRows = [headers.join(",")];
    
    for (const order of orders) {
      const row = [
        `"${order.tracking_code || ''}"`,
        `"${(order.customer_name || '').replace(/"/g, '""')}"`,
        `"${order.customer_phone || ''}"`,
        `"${order.customer_email || ''}"`,
        `"${(order.shipping_address || '').replace(/"/g, '""')}"`,
        `"${order.order_total || 0}"`,
        `"${order.payment_status || 'unpaid'}"`,
        `"${order.order_status || 'Pending'}"`,
        `"${(order.driver?.name || 'Unassigned').replace(/"/g, '""')}"`,
        `"${order.created_at || ''}"`,
      ];
      csvRows.push(row.join(","));
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${filter}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [filter]);
  
  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_URL}/api/users`, {
        headers: token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const users = await res.json();
        setDrivers(users.filter((u: any) => u.role === 'driver' || u.is_driver));
      }
    } catch {
      // Non-fatal
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/api/orders`;
      if (filter && filter !== 'all') {
        url += `?status=${encodeURIComponent(filter)}`;
      }
      
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    const mappedStatus = statusMap[newStatus.toLowerCase()] || newStatus;
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: mappedStatus })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      const data = await res.json();
      
      toast({
        title: "Order Updated",
        description: `Order status set to ${mappedStatus}`,
      });

      if (data.stockRestored) {
        toast({
          title: "Stock Restored",
          description: "Inventory was returned to available stock.",
        });
      }
      if (data.stockDecremented) {
        toast({
          title: "Stock Decremented",
          description: "Inventory was deducted for this re-activated order.",
        });
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId
          ? { ...order, order_status: mappedStatus, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleAssignDriver = async (orderId: string | number, driverId: string) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_URL}/api/orders/${orderId}/assign-driver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ driver_id: driverId ? Number(driverId) : null }),
      });
      if (!res.ok) throw new Error('Failed to assign driver');
      const data = await res.json();
      
      toast({
        title: "Driver Assigned",
        description: "Delivery assignment updated successfully.",
      });

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, driver_id: driverId ? Number(driverId) : null, driver: data.order?.driver } : order
      ));
    } catch (error: any) {
      toast({
        title: "Assignment Error",
        description: error.message || "Failed to assign driver",
        variant: "destructive",
      });
    }
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
  
  return (
    <AdminLayout title="Orders">
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm font-medium">
            Status:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-border rounded-md text-sm"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => fetchOrders()}
            className="btn btn-outline py-2 px-4 text-sm"
          >
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline py-2 px-4 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer, code, phone, email..."
          className="p-2 border border-border rounded-md w-full max-w-md text-sm"
        />
        <div className="flex gap-2 items-center text-sm">
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="p-2 border border-border rounded-md text-sm"
          />
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="p-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Driver</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {orders
                  .filter(order => {
                    if (search.trim()) {
                      const fields = [order.customer_name, order.tracking_code, order.customer_phone, order.customer_email];
                      const q = search.toLowerCase();
                      if (!fields.some(f => typeof f === 'string' && f.toLowerCase().includes(q))) return false;
                    }
                    if (startDate && new Date(order.created_at) < new Date(startDate)) return false;
                    if (endDate) {
                      const end = new Date(endDate);
                      end.setHours(23, 59, 59, 999);
                      if (new Date(order.created_at) > end) return false;
                    }
                    return true;
                  })
                  .map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-medium">
                      #{order.tracking_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-0.5">
                          {order.items.map((it: any, i: number) => (
                            <div key={i}>{it.quantity}x {it.product?.name || `Item #${it.product_id}`}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Ghs {Number(order.order_total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.payment_status ? order.payment_status.toUpperCase() : 'UNPAID'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.order_status?.toLowerCase()}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="p-1 border border-border rounded text-xs bg-background font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.driver_id || ''}
                        onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                        className="p-1 border border-border rounded text-xs bg-background"
                      >
                        <option value="">-- Unassigned --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
