import express from 'express';
import db from './lib/db';
import { authenticateToken, isAdmin } from './middleware';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, how_to_use, benefits, ingredients, stock_quantity, featured } = req.body;
    const [result]: any = await db.execute(
      'INSERT INTO products (name, description, price, image, category, how_to_use, benefits, ingredients, stock_quantity, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, image, category, how_to_use, JSON.stringify(benefits), JSON.stringify(ingredients), stock_quantity, featured]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, how_to_use, benefits, ingredients, stock_quantity, featured } = req.body;
    await db.execute(
      'UPDATE products SET name=?, description=?, price=?, image=?, category=?, how_to_use=?, benefits=?, ingredients=?, stock_quantity=?, featured=? WHERE id=?',
      [name, description, price, image, category, how_to_use, JSON.stringify(benefits), JSON.stringify(ingredients), stock_quantity, featured, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
