import express from 'express';
import cors from 'cors';
import { dashboardHandler } from './api/dashboard';
import { DeleteProductsHandler, getAllProductsHandler, getProductHandler, submitProductHandler } from './api/products';
import { signInHandler, signUpHandler, checkAdminHandler } from './api/auth';
import { verifyJWT, requireAdmin } from './middleware/auth';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


const PORT = process.env.PORT || 5080;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // or higher if needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Utility to wrap async route handlers
import type { Request, Response, NextFunction, RequestHandler } from 'express';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}


// API routes
app.get('/api/dashboard', verifyJWT, requireAdmin, asyncHandler(dashboardHandler));

app.get('/api/products/:id', getProductHandler);
app.post('/api/products', submitProductHandler);
app.get('/api/products', getAllProductsHandler);
app.delete('/api/products/:id', DeleteProductsHandler);
app.post('/api/auth/signin', asyncHandler(signInHandler));
app.post('/api/auth/signup', asyncHandler(signUpHandler));
app.get('/api/auth/check-admin', verifyJWT, asyncHandler(checkAdminHandler));

// Health check
app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
