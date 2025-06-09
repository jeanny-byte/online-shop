import { Request, Response, NextFunction } from 'express';
import { db } from './lib/mysql';
import { RowDataPacket } from 'mysql2';

export interface AdminUser {
  id: string;
  is_admin: boolean;
}

import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT is_admin FROM admin_users WHERE id = ?', [req.userId]);
    const admin = rows as AdminUser[];
    if (admin.length === 0 || !admin[0].is_admin) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
