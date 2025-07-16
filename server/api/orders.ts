import { getConnection } from '../lib/db';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export async function createWhatsappOrderHandler(req: Request, res: Response) {
  const {
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    order_total,
    payment_method,
    tracking_code
  } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !shipping_address || !order_total || !payment_method || !tracking_code) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const id = uuidv4();
  const order_status = 'pending';

  const sql = `
    INSERT INTO orders
      (id, customer_name, customer_email, customer_phone, shipping_address, order_total, payment_method, order_status, tracking_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    order_total,
    payment_method,
    order_status,
    tracking_code
  ];

  const conn = await getConnection();
  try {
    await conn.query(sql, values);
    res.status(201).json({ id, tracking_code, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error inserting WhatsApp order:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

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

// PUT: Update order status
export async function updateOrderStatusHandler(req: Request, res: Response) {
  const { orderId } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return
  }
  

  const conn = await getConnection();
  try {
    const [result] = await conn.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, orderId]
    );
    res.status(200).json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}




