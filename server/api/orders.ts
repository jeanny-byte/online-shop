import { getConnection } from '../lib/db';
import { Request, Response } from 'express';

// GET: Fetch all orders
export async function getOrdersHandler(req: Request, res: Response) {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM orders');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
