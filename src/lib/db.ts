
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'lskinDb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection: SUCCESSFUL');
    connection.release();
  } catch (error) {
    console.error('Database connection: FAILED', error);
  }
};
