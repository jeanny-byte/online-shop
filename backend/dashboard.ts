import express from 'express';
import { db } from './lib/mysql';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// GET /api/dashboard-stats
router.get('/stats', async (req, res) => {
  try {
    // Total orders
    const [orders] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as totalOrders FROM orders'
    );
    // Total products
    const [products] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as totalProducts FROM products'
    );
    // Pending orders
    const [pending] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as pendingOrders FROM orders WHERE order_status = 'pending'"
    );
    // Total revenue
    const [revenueRows] = await db.execute<RowDataPacket[]>(
      'SELECT SUM(order_total) as totalRevenue FROM orders'
    );

    res.json({
      totalOrders: orders[0]?.totalOrders || 0,
      totalProducts: products[0]?.totalProducts || 0,
      pendingOrders: pending[0]?.pendingOrders || 0,
      totalRevenue: revenueRows[0]?.totalRevenue || 0,
    });
  } catch (error) {
    console.error('Error in /api/dashboard-stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/recent-orders
router.get('/recent-orders', async (req, res) => {
  try {
    const [recentOrders] = await db.execute<RowDataPacket[]>(
      'SELECT id, order_total, customer_name, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5'
    );
    res.json(recentOrders);
  } catch (error) {
    console.error('Error in /api/recent-orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

export default router;
