import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload
interface MulterRequest extends express.Request {
  file: Express.Multer.File;
}

router.post('/', upload.single('image'), async (req, res) => {
  const file = (req as MulterRequest).file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: 'blog' },
      (error, result) => {
        if (error || !result) {
          return res.status(500).json({ error: error?.message || 'Upload failed' });
        }
        return res.json({ url: result.secure_url });
      }
    );
    // Pipe the buffer to the upload stream
    // @ts-ignore
    uploadResult.end(req.file.buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
