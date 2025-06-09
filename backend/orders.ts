import express from 'express';
import { db } from './lib/mysql';
import { authenticateToken, isAdmin } from './middleware';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// GET /api/orders - List all orders (optionally filter by status)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM orders';
    let params: any[] = [];
    if (status) {
      sql += ' WHERE order_status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id - Update order (e.g., status)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { order_status } = req.body;
    await db.execute('UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?', [order_status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id - Delete order (admin only, optional)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
