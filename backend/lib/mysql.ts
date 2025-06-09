import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'lskin_beauty',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  debug: false
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('MySQL connection established successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to MySQL:', error);
    process.exit(1);
  });

export { pool as db };
