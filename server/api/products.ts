import { getConnection } from '../lib/db';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';

export async function submitProductHandler(req: Request, res: Response, next: NextFunction) {
  const conn = await getConnection();
  try {
    // Accept images as files (handled by multer)
    const { name, description, price, category, how_to_use, benefits, ingredients, stock_quantity, featured } = req.body;
    let existingImages: string[] = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        // fallback: ignore if not valid JSON
      }
    }
    const files = req.files as Express.Multer.File[];
    // Accept zero or more files, but at least one image must exist overall
    const newImageUrls = files && files.length > 0 ? files.map(file => `/uploads/${path.basename(file.path)}`) : [];
    const allImages = [...existingImages, ...newImageUrls];
    if (allImages.length === 0) {
      res.status(400).json({ error: "At least one image is required" });
      return;
    }
    const image = allImages[0];

    if (req.body.id) {
      // Update existing product
      await conn.query(
        'UPDATE products SET name=?, description=?, price=?, image=?, images=?, category=?, how_to_use=?, benefits=?, ingredients=?, stock_quantity=?, featured=? WHERE id=?',
        [
          name,
          description,
          price,
          image,
          JSON.stringify(allImages),
          category,
          how_to_use,
          benefits,
          ingredients,
          stock_quantity,
          featured,
          req.body.id
        ]
      );
      res.status(200).json({ message: 'Product updated successfully' });
    } else {
      // Insert new product
      await conn.query(
        'INSERT INTO products (id, name, description, price, image, images, category, how_to_use, benefits, ingredients, stock_quantity, featured) VALUES ( UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          name,
          description,
          price,
          image,
          JSON.stringify(allImages),
          category,
          how_to_use,
          benefits,
          ingredients,
          stock_quantity,
          featured
        ]
      );
      res.status(201).json({ message: 'Product created successfully' });
    }
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

// Batch update stock quantities for products
export async function updateStockBatchHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const updates: { productId: string, quantity: number }[] = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400).json({ error: 'No updates provided' });
    return;
  }
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    for (const { productId, quantity } of updates) {
      // Decrement stock only if quantity is positive
      if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        await conn.rollback();
        res.status(400).json({ error: 'Invalid productId or quantity' });
        return;
      }
      // Decrement stock, but prevent negative stock
      const [result]: any = await conn.query(
        'UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ?',
        [quantity, productId]
      );
      if (result.affectedRows === 0) {
        await conn.rollback();
        res.status(404).json({ error: `Product not found: ${productId}` });
        return;
      }
    }
    await conn.commit();
    res.status(200).json({ message: 'Stock updated successfully' });
    return;
  } catch (error) {
    await conn.rollback();
    console.error('Failed to update stock in batch', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}

//PUT: Update products in database
export async function UpdateProductsHandler(req: Request, res: Response){
  const conn = await getConnection();
  const { id } = req.params;
  try {
    const [result]: any = await conn.query('UPDATE products SET name=?, description=?, price=?, image=?, images=?, category=?, how_to_use=?, benefits=?, ingredients=?, stock_quantity=?, featured=? WHERE id=?', [id]);
    if (result.affectedRows > 0){
      res.status(200).json({ message: 'Product updated successfully' });
    } else {
      res.status(404).json({ error: 'Product not found in Database' }); 
    }
  } catch (error) {
    console.error('Failed to update product from database', error)
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
