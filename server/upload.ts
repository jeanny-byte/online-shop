import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

export const upload = multer({ storage });

import express from 'express';

const router = express.Router();

// POST /api/upload
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

router.post('/', upload.single('image'), (req: express.Request, res: express.Response): void => {
  const fileReq = req as unknown as MulterRequest;
  if (!fileReq.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  // Return the relative URL for the uploaded file
  const fileUrl = `/uploads/${fileReq.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
