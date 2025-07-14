import { getConnection } from '../lib/db';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';

export async function signInHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email, password } = req.body;
  const conn = await getConnection();
  try {
    // Authenticate user from users table
    const [rows] = await conn.query(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const user = rows[0] as any;
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check is_admin from admin_users table
    const [adminRows] = await conn.query(
      'SELECT is_admin FROM admin_users WHERE email = ?',
      [email]
    );
    const adminRowsArray = adminRows as { is_admin: boolean }[];
    const is_admin = Array.isArray(adminRowsArray) && adminRowsArray.length > 0 ? adminRowsArray[0].is_admin : false;

    // Issue JWT
    const token = jwt.sign({ id: user.id, is_admin }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ user: { id: user.id, email: user.email, is_admin }, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

export async function signUpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email, password } = req.body;
  const conn = await getConnection();
  try {
    // Check if email already exists
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.query(
      'INSERT INTO users (email, password, id) VALUES (?, ?, UUID())',
      [email, hashedPassword]
    );
    res.status(201).json({ message: 'Account created' });
  } catch (error) {
    // Always return JSON error
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

// JWT-protected admin check endpoint
export async function checkAdminHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(400).json({ error: 'Missing email or password' }); return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    res.json({ is_admin: !!payload.is_admin }); return;
  } catch {
    res.status(401).json({ error: 'Invalid token' }); return;
  }
}

