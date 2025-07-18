import express from 'express';
import path from 'path';
import fs from 'fs';
import { getConnection } from '../lib/db';

const router = express.Router();

// Ensure profile_pictures directory exists
const profilePicturesDir = path.join(__dirname, '..', 'uploads', 'profile_pictures');
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir);
}

// Custom multer storage for profile pictures
import multer from 'multer';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicturesDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const profileUpload = multer({ storage });

// PUT /api/profile - update user profile
router.put('/', profileUpload.single('avatar'), async (req, res) => {
  const {
    id,
    full_name,
    display_name,
    website,
    email,
    phone,
    shipping_address
  } = req.body;

  let avatar_url = req.body.avatar_url;
  if (req.file) {
    // Save the relative path for the avatar_url
    avatar_url = `/uploads/profile_pictures/${req.file.filename}`;
  }

  try {
    const connection = await getConnection();
    const [result] = await connection.query(
      `UPDATE users SET full_name = ?, display_name = ?, avatar_url = ?, website = ?, email = ?, phone = ?, shipping_address = ?, updated_at = NOW() WHERE id = ?`,
      [full_name, display_name, avatar_url, website, email, phone, shipping_address, id]
    );
    connection.release();
    res.json({ success: true, avatar_url });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Profile update failed' });
  }
});

// GET /api/profile/email/:email - fetch user profile by email
router.get('/email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(
      'SELECT id, full_name, display_name, avatar_url, website, updated_at, email, phone, shipping_address, city, state FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Fetch profile by email error:', error);
    res.status(500).json({ error: 'Failed to fetch profile by email' });
  }
});

// GET /api/profile/:id - fetch user profile by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(
      'SELECT id, full_name, display_name, avatar_url, website, updated_at, email, phone, shipping_address FROM users WHERE id = ?',
      [id]
    );
    connection.release();
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
