import { getConnection } from '../lib/db';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';

export async function submitProductHandler(req: Request, res: Response, next: NextFunction) {
  const conn = await getConnection();
  try {
    // Accept images as files (handled by multer)
    const { name, description, price, category, how_to_use, benefits, ingredients, stock_quantity, featured } = req.body;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "At least one image is required" });
      return;
    }
    // Construct URLs to serve images
    const imageUrls = files.map(file => `/uploads/${path.basename(file.path)}`);
    const image = imageUrls[0];

    await conn.query(
      'INSERT INTO products (id, name, description, price, image, images, category, how_to_use, benefits, ingredients, stock_quantity, featured) VALUES ( UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        description,
        price,
        image,
        JSON.stringify(imageUrls),
        category,
        how_to_use,
        benefits,
        ingredients,
        stock_quantity,
        featured
      ]
    );
    res.status(201).json({ message: 'Product created successfully' });
    return;
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    next(error);
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

//GET: feth all products
export async function getAllProductsHandler(req: Request, res: Response){
  const conn = await getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM products');
    if (Array.isArray(rows) && rows.length > 0){
      // Ensure every product has an images array
      const products = rows.map((row: any) => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : (row.image ? [row.image] : [])
      }));
      res.status(200).json(products)
    } else {
      res.status(404).json({ error: 'Product not found in Database' }); 
    }
  } catch (error) {
    console.error('Failed to load products from database',error)
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}

//DELETE: Delete products from database
export async function DeleteProductsHandler(req: Request, res: Response){
  const conn = await getConnection();
  const { id } = req.params;
  try {
    const [result]: any = await conn.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows > 0){
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found in Database' }); 
    }
  } catch (error) {
    console.error('Failed to delete product from database', error)
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
