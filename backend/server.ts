import express from 'express';
import cors from 'cors';
import { db } from './lib/mysql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { OkPacket, RowDataPacket } from 'mysql2';

dotenv.config();

// Define types
interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends express.Request {
  userId?: string;
}

interface User extends RowDataPacket {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

interface AdminUser extends RowDataPacket {
  id: string;
  is_admin: boolean;
}

interface Session extends RowDataPacket {
  id: string;
  user_id: string;
  expires_at: Date;
}

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Protected route middleware
const authenticateToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    
    const [session] = await db.execute<Session[]>('SELECT * FROM sessions WHERE user_id = ? AND expires_at > NOW()', [req.userId]);
    if (session.length === 0) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin check middleware
const isAdmin = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [admin] = await db.execute<AdminUser[]>('SELECT is_admin FROM admin_users WHERE id = ?', [req.userId]);
    if (admin.length === 0 || !admin[0].is_admin) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Authentication routes

// Register
app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const [existingUser] = await db.execute<User[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute<OkPacket>('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [crypto.randomUUID(), email, hashedPassword]
    );
    
    if (!result.affectedRows) {
      throw new Error('Failed to create user');
    }
    
    // Fetch the newly created user
    const [userRows] = await db.execute<User[]>('SELECT id, email FROM users WHERE email = ?', [email]);
    const user = userRows[0];
    // Create JWT token and session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    await db.execute<OkPacket>('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [crypto.randomUUID(), user.id, new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );
    res.status(201).json({ token, user });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: 'Database connection error' });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const [user] = await db.execute<User[]>('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET, { expiresIn: '24h' });
    const [sessionResult] = await db.execute<OkPacket>('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [crypto.randomUUID(), user[0].id, new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );
    
    if (!sessionResult.affectedRows) {
      throw new Error('Failed to create session');
    }
    
    res.json({ token, user: { id: user[0].id, email: user[0].email } });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Verify session
app.get('/api/auth/verify', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No user ID in request' });
    }
    
    const [user] = await db.execute<User[]>('SELECT id, email FROM users WHERE id = ?', [req.userId]);
    if (user.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ user: user[0] });
  } catch (error: any) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Admin routes
app.get('/api/admin/users', [authenticateToken, isAdmin], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const [users] = await db.execute<User[]>('SELECT id, email, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific user by ID (admin only)
app.get('/api/admin/users/:id', [authenticateToken, isAdmin], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const [users] = await db.execute<User[]>('SELECT id, is_admin, email, created_at FROM admin_users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin status check endpoint
app.get('/api/admin/status/:id', [authenticateToken], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute<RowDataPacket[]>('SELECT is_admin FROM admin_users WHERE id = ?', [userId]);
    const isAdmin = rows.length > 0 ? !!rows[0].is_admin : false;
    res.json({ userId, isAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
