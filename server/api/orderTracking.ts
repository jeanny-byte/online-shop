import { getConnection } from '../lib/db';
import { Request, Response } from 'express';

// GET: Track order by tracking number
export async function trackOrderHandler(req: Request, res: Response) {
  const { trackingCode } = req.params;
  const conn = await getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM orders WHERE tracking_code = ?', [trackingCode]);
    if (Array.isArray(rows) && rows.length > 0) {
      res.status(200).json({ order: rows[0] });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
