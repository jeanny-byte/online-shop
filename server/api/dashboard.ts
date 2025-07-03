import { getConnection } from '../lib/db';
import { Request, Response } from 'express';

// GET: Fetch dashboard stats (total orders, products, pending orders, total revenue, recent orders)
export async function dashboardHandler(req: Request, res: Response) {
  const conn = await getConnection();
  try {
    // Total orders
    const [rows]: any[] = await conn.query('SELECT COUNT(*) as totalOrders FROM orders');
    const totalOrders = rows[0]?.totalOrders || 0;
    // Total products
    const [[{ totalProducts }]] = await conn.query('SELECT COUNT(*) as totalProducts FROM products');
    // Pending orders
    const [[{ pendingOrders }]] = await conn.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE order_status = 'pending'");
    // Total revenue
    const [[{ totalRevenue }]] = await conn.query('SELECT IFNULL(SUM(order_total),0) as totalRevenue FROM orders');
    // Recent orders
    const [recentOrders] = await conn.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    res.status(200).json({
      totalOrders,
      totalProducts,
      pendingOrders,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
