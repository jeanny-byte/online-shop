import React, { useEffect, useState } from 'react';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from '@/hooks/use-toast';
import AdminLayout from './components/AdminLayout';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
const [startDate, setStartDate] = useState<string>('');
const [endDate, setEndDate] = useState<string>('');

  // Export orders to CSV
  const handleExportCSV = () => {
    if (!orders.length) return;
    // Get all keys from the first order for headers
    const headers = Object.keys(orders[0]);
    const csvRows = [headers.join(",")];
    for (const order of orders) {
      const row = headers.map(key => {
        let val = order[key];
        if (val === null || val === undefined) return '';
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        // Wrap fields with commas or newlines in quotes
        if (val.search(/([",\n])/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      });
      csvRows.push(row.join(","));
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${filter}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);
  
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let url = `/api/orders`;
      if (filter && filter !== 'all') {
        url += `?status=${encodeURIComponent(filter)}`;
      }
      
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(url.startsWith('/api') ? `${API_URL}${url}` : url, {
        headers: {
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
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
  // Map the status to the correct casing
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
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status: mappedStatus })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const data = await res.json();
    toast({
      title: "Success",
      description: "Order status updated successfully",
    });
    if (data.stockRestored) {
      toast({
        title: "Stock Restored",
        description: "Product stock has been restored for this cancelled order.",
        variant: "default",
      });
    }
    if (data.stockDecremented) {
      toast({
        title: "Stock Decremented",
        description: "Product stock has been re-allocated to this order (status changed from Cancelled).",
        variant: "default",
      });
    }
    // Update the status in the local state
      setOrders(orders.map(order => 
        order.id === orderId
          ? { ...order, order_status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <label htmlFor="filter" className="mr-2 text-sm">
            Filter by status:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-border rounded-md"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <button
          onClick={() => fetchOrders()}
          className="btn btn-outline py-2 px-4"
        >
          Refresh
        </button>
        <button
          onClick={handleExportCSV}
          className="btn btn-outline py-2 px-4 ml-2"
        >
          Export CSV
        </button>
      </div>
      
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search: Name, Tracking Code, Phone, Email"
          className="p-2 border border-border rounded-md w-full max-w-md"
        />
        <div className="flex gap-2 items-center">
          <label className="text-sm">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="p-2 border border-border rounded-md"
          />
          <label className="text-sm">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="p-2 border border-border rounded-md"
          />
        </div>
      </div>
      <div className="bg-white border border-border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto" style={{ maxWidth: '100vw' }}>
            <table className="w-full min-w-[900px]" style={{ minWidth: 900 }}>
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders
                  .filter(order => {
                    // Search filter
                    if (search.trim()) {
                      const fields = [order.customer_name, order.tracking_code, order.customer_phone, order.customer_email];
                      try {
                        const regex = new RegExp(search, 'i');
                        if (!fields.some(f => typeof f === 'string' && regex.test(f))) return false;
                      } catch {
                        // Invalid regex: fallback to case-insensitive substring
                        if (!fields.some(f => typeof f === 'string' && f.toLowerCase().includes(search.toLowerCase()))) return false;
                      }
                    }
                    // Date range filter
                    if (startDate) {
                      if (!order.created_at || new Date(order.created_at) < new Date(startDate)) return false;
                    }
                    if (endDate) {
                      // Set endDate to the end of the day
                      const end = new Date(endDate);
                      end.setHours(23,59,59,999);
                      if (!order.created_at || new Date(order.created_at) > end) return false;
                    }
                    return true;
                  })
                  .map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      #{order.tracking_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{order.customer_name}</div>
                      <div className="text-muted-foreground text-xs">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      Ghs{order.order_total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="p-1 border border-border rounded-md text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
