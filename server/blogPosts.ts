import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateSlug } from './utils';

// Strict BlogPost type matching the DB schema
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  excerpt: string;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

import mysql from 'mysql2/promise';

// MySQL pool (reuse your existing credentials)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'nelyluxdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const router = express.Router();

// GET /api/blog-posts?limit=5 or ?admin=1&all=1
router.get('/', async (req: Request, res: Response) => {
  try {
    let sql = 'SELECT * FROM blog_posts';
    const params: any[] = [];
    if (!req.query.admin) {
      sql += ' WHERE published = 1';
    }
    sql += ' ORDER BY created_at DESC';
    if (req.query.limit) {
      sql += ' LIMIT ?';
      params.push(Number(req.query.limit));
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

// GET /api/blog-posts/slug/:slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1', [req.params.slug]);
    if (!rows.length) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

// GET /api/blog-posts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

// POST /api/blog-posts
router.post('/', async (req: Request, res: Response) => {
  const slug = generateSlug(req.body.title);
  const { title, content, image, excerpt, author_id, published } = req.body;
  if (!slug || !title || !content) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const id = uuidv4();
  const now = new Date();
  try {
    await pool.execute(
      `INSERT INTO blog_posts
        (id, title, slug, content, image, excerpt, author_id, published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        slug,
        content,
        image,
        excerpt,
        author_id || null,
        published ? 1 : 0,
        now,
        now
      ]
    );
    res.status(201).json({ id, title, slug, content, image, excerpt, author_id, published, created_at: now, updated_at: now });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Slug must be unique' });
    } else {
      res.status(500).json({ error: 'Database error', details: err });
    }
  }
});

// PUT /api/blog-posts/:id
router.put('/:id', async (req: Request, res: Response) => {
    const slug = generateSlug(req.body.title);
  const { title, content, image, excerpt, author_id, published } = req.body;
  if (!slug || !title || !content) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const now = new Date();
  const safe = (v: any) => v === undefined ? null : v;
  try {
    const [result]: any = await pool.execute(
      `UPDATE blog_posts SET title=?, slug=?, content=?, image=?, excerpt=?, author_id=?, published=?, updated_at=? WHERE id=?`,
      [
        safe(title),
        safe(slug),
        safe(content),
        safe(image),
        safe(excerpt),
        safe(author_id),
        published === undefined ? 0 : (published ? 1 : 0),
        now,
        req.params.id
      ]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    // Return the updated post
    const [rows]: any = await pool.query('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [req.params.id]);
    res.json(rows[0]);
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Slug must be unique' });
    } else {
      res.status(500).json({ error: 'Database error', details: err });
    }
  }
});

// DELETE /api/blog-posts/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const [result]: any = await pool.execute('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

export default router;


