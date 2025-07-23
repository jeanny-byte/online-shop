import { getConnection } from '../lib/db';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export async function createWhatsappOrderHandler(req: Request, res: Response) {
  const {
    customer_name,
    customer_email = '',
    customer_phone,
    shipping_address = '',
    order_total,
    payment_method,
    tracking_code
  } = req.body;

  // Only require the truly compulsory fields
  if (!customer_name || !customer_phone || !order_total || !payment_method || !tracking_code) {
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

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Order must include at least one item' });
    return;
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(sql, values);
    // Insert order items
    for (const item of items) {
      if (!item.product_id || typeof item.quantity !== 'number' || item.quantity <= 0) {
        await conn.rollback();
        res.status(400).json({ error: 'Invalid item in order' });
        return;
      }
      await conn.query(
        'INSERT INTO order_items (id, order_id, product_id, quantity, price_per_item) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), id, item.product_id, item.quantity, item.price_per_item || 0]
      );
    }
    await conn.commit();
    res.status(201).json({ id, tracking_code, message: 'Order created successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Error inserting WhatsApp order:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

// GET: Fetch all orders
export async function getOrdersByUserEmailHandler(req: Request, res: Response) {
  const { email } = req.params;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const conn = await getConnection();
  try {
    // Get all orders for this user
    const [orders] = await conn.query(
      'SELECT id, order_status, tracking_code, created_at, updated_at, order_total FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
      [email]
    );
    // For each order, get its items
    for (const order of orders as any[]) {
      const [items] = await conn.query(
        `SELECT oi.product_id, p.name as product_name, oi.quantity, oi.price_per_item,
                (oi.quantity * oi.price_per_item) as total_price
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders by user email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}


export async function getDriverOrdersHandler(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token and get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const driverId = decoded.id;

    const conn = await getConnection();
    try {
      // First, verify the user is a driver
      const [userRows] = await conn.query(
        'SELECT is_driver FROM users WHERE id = ?',
        [driverId]
      );
      
      const user = (userRows as any[])[0];
      if (!user || !user.is_driver) {
        return res.status(403).json({ error: 'Access denied. Driver privileges required.' });
      }

      // Get all orders assigned to this driver
      const [orders] = await conn.query(
        `SELECT o.*, 
          (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
         FROM orders o
         ORDER BY 
           CASE 
             WHEN o.order_status = 'Pending' THEN 1
             WHEN o.order_status = 'Processing' THEN 2
             WHEN o.order_status = 'Shipped' THEN 3
             WHEN o.order_status = 'Delivered' THEN 4
             ELSE 5
           END,
           o.updated_at DESC`,
      );

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        (orders as any[]).map(async (order) => {
          const [items] = await conn.query(
            `SELECT oi.*, p.name as product_name, p.image 
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [order.id]
          );
          return { ...order, items };
        })
      );

      res.status(200).json({ orders: ordersWithItems });
    } catch (error) {
      console.error('Error fetching driver orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export async function getOrdersHandler(req: Request, res: Response) {
  const conn = await getConnection();
  try {
    let sql = 'SELECT * FROM orders';
    const params: any[] = [];
    let status: string | undefined;
    if (typeof req.query.status === 'string') {
      status = req.query.status;
    } else if (Array.isArray(req.query.status) && typeof req.query.status[0] === 'string') {
      status = req.query.status[0];
    }
    if (status && status !== 'all') {
      sql += ' WHERE order_status = ?';
      params.push(status.charAt(0).toUpperCase() + status.slice(1));
    }
    const [rows] = await conn.query(sql, params);
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
    await conn.beginTransaction();

    // Get current order status
    const [orderRows] = await conn.query('SELECT order_status FROM orders WHERE id = ?', [orderId]);
    const statusRows = orderRows as { order_status: string }[];
    const prevStatus = statusRows.length > 0 ? statusRows[0].order_status : null;
    console.log('updateOrderStatusHandler:', { orderId, prevStatus, status });

    // Update order status
    await conn.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, orderId]
    );

    // If cancelling, restore stock for all products in the order
    let stockRestored = false;
    if (status && status.toLowerCase() === 'cancelled') {
      // Get all order items for this order
      const [rows] = await conn.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );
      const items = rows as { product_id: string; quantity: number }[];
      console.log(`[CANCELLED] Restoring stock for order ${orderId}, items:`, items);
      for (const item of items) {
        // Increment stock for each product
        const [updateResult]: any = await conn.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
        console.log(`[CANCELLED] Updated product ${item.product_id}: +${item.quantity}, affectedRows:`, updateResult.affectedRows);
      }
      stockRestored = true;
    }

    // If the previous status was Cancelled and the new status is not, decrement stock for all products in the order
    let stockDecremented = false;
    if (prevStatus && prevStatus.toLowerCase() === 'cancelled' && status && status.toLowerCase() !== 'cancelled') {
      const [rows] = await conn.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );
      const items = rows as { product_id: string; quantity: number }[];
      console.log(`[FROM CANCELLED] Decrementing stock for order ${orderId}, items:`, items);
      for (const item of items) {
        const [updateResult]: any = await conn.query(
          'UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ?',
          [item.quantity, item.product_id]
        );
        console.log(`[FROM CANCELLED] Updated product ${item.product_id}: -${item.quantity}, affectedRows:`, updateResult.affectedRows);
      }
      stockDecremented = true;
    }
    await conn.commit();
    res.status(200).json({ message: 'Order status updated', stockRestored, stockDecremented });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}




