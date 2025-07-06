import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
console.log(dbConfig);

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
