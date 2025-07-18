import { getConnection } from '../lib/db';
import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2/promise';

// GET: Fetch all testimonials
export async function getTestimonialsHandler(req: Request, res: Response) {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Failed to load testimonials from database', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}

// POST: Submit a new testimonial (requires authentication)
export async function submitTestimonialHandler(req: any, res: Response) {
  // req.user is set by verifyJWT middleware
  const { name, location, quote, rating } = req.body;
  if (!name || !quote || !rating) {
    return res.status(400).json({ error: 'Name, quote, and rating are required.' });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  // Get user id from JWT
  const userId = req.user?.id;
  let avatar = null;
  const conn = await getConnection();
  try {
    if (userId) {
      // Fetch avatar from profiles table
      const [profileRows] = await conn.query('SELECT avatar_url FROM users WHERE id = ?', [userId]);
      if (Array.isArray(profileRows) && profileRows.length > 0) {
        const profile = profileRows[0] as RowDataPacket;
        avatar = profile.avatar || null;
      }
    }
    const id = uuidv4();
    await conn.query(
      'INSERT INTO testimonials (id, name, location, quote, rating, image) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, location || '', quote, rating, avatar]
    );
    res.status(201).json({ message: 'Testimonial submitted successfully.' });
  } catch (error) {
    console.error('Failed to submit testimonial', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}
