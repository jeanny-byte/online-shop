import { getConnection } from '../lib/db';
import type { Request, Response } from 'express';

// GET: Fetch dashboard stats (total orders, products, pending orders, total revenue, recent orders)
export async function dashboardHandler(req: Request, res: Response) {
  const conn = await getConnection();
  try {
    // Total orders
    const [rows]: [any[], any] = await conn.query('SELECT COUNT(*) as totalOrders FROM orders');
    const totalOrders = rows[0]?.totalOrders || 0;
    // Total products
    const [totalProductsRows]: [any[], any] = await conn.query('SELECT COUNT(*) as totalProducts FROM products');
const totalProducts = totalProductsRows[0]?.totalProducts || 0;
    // Pending orders
    const [pendingOrdersRows]: [any[], any] = await conn.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE order_status = 'pending'");
const pendingOrders = pendingOrdersRows[0]?.pendingOrders || 0;
    // Total revenue
    const [totalRevenueRows]: [any[], any] = await conn.query('SELECT IFNULL(SUM(order_total),0) as totalRevenue FROM orders');
const totalRevenue = totalRevenueRows[0]?.totalRevenue || 0;
    // Recent orders
    const [recentOrders]: [any[], any] = await conn.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
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
