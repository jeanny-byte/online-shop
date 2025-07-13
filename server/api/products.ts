import { getConnection } from '../lib/db';
import type { Request, Response } from 'express';


//POST: Submit created products
export async function submitProductHandler(req: Request, res: Response){
  const conn = await getConnection();
  try {
    const { name, description, price, image, category, how_to_use, benefits, ingredients, stock_quantity, featured } = req.body;
    await conn.query(
      'INSERT INTO products (name, description, price, image, category, how_to_use, benefits, ingredients, stock_quantity, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, image, category, how_to_use, benefits, ingredients, stock_quantity, featured]
    );
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}

// GET: Fetch product by ID
export async function getProductHandler(req: Request, res: Response) {
  const { id } = req.params;
  const conn = await getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [id]);
    if (Array.isArray(rows) && rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
