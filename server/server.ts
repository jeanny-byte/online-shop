import express from 'express';
import cors from 'cors';
import { dashboardHandler } from './api/dashboard';
import { getProductHandler } from './api/products';
import { signInHandler, signUpHandler, checkAdminHandler } from './api/auth';
import { verifyJWT, requireAdmin } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
app.post('/api/auth/signin', asyncHandler(signInHandler));
app.post('/api/auth/signup', asyncHandler(signUpHandler));
app.get('/api/auth/check-admin', verifyJWT, asyncHandler(checkAdminHandler));

// Health check
app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
