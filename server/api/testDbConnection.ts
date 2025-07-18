import type { Request, Response } from 'express';
import { testConnection } from '../lib/db';

export const testDbConnectionHandler = async (req: Request, res: Response) => {
  try {
    await testConnection();
    res.status(200).json({ success: true, message: 'Database connection successful.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed.', error: error instanceof Error ? error.message : error });
  }
};
