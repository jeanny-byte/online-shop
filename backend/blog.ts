import express from 'express';
import { db } from './lib/mysql';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all published blog posts (optionally with limit)
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC';
    let params: any[] = [];
    const limitStr = req.query.limit;
    if (
      typeof limitStr === 'string' &&
      /^\d+$/.test(limitStr) &&
      Number(limitStr) > 0
    ) {
      sql += ' LIMIT ?';
      params.push(Number(limitStr));
    }
    console.log('SQL:', sql, 'PARAMS:', params);
    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error in /api/blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get blog post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1',
      [slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Get blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE id = ? AND published = 1 LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// --- Admin-protected endpoints ---
import { authenticateToken, isAdmin } from './middleware';

// Create blog post
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, content, image, published } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [result] = await db.execute(
      'INSERT INTO blog_posts (title, slug, excerpt, content, image, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [title, slug, excerpt || '', content, image || '', published ? 1 : 0]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Update blog post
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, image, published } = req.body;
    const [result] = await db.execute(
      'UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, image=?, published=?, updated_at=NOW() WHERE id=?',
      [title, slug, excerpt || '', content, image || '', published ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Delete blog post
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM blog_posts WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
