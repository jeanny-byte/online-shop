import express from 'express';
import cors from 'cors';
import { createWhatsappOrderHandler } from './api/orders';
import { dashboardHandler } from './api/dashboard';
import { createHubtelPaymentHandler } from './api/payments';
import { DeleteProductsHandler, getAllProductsHandler, getProductHandler, submitProductHandler } from './api/products';
import { upload } from './upload';
import { getOrdersHandler, updateOrderStatusHandler } from './api/orders';
import { signInHandler, signUpHandler, checkAdminHandler } from './api/auth';
import { verifyJWT, requireAdmin } from './middleware/auth';
import dotenv from 'dotenv';
dotenv.config();
import { trackOrderHandler } from './api/orderTracking';

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
// Hubtel payment endpoint
app.post('/api/payments/hubtel', asyncHandler(createHubtelPaymentHandler));
app.post('/api/orders/whatsapp', asyncHandler(createWhatsappOrderHandler));
app.get('/api/products/:id', asyncHandler(getProductHandler));
app.use('/uploads', express.static('uploads'));
app.post('/api/products', upload.array('images', 5), asyncHandler(submitProductHandler));
app.put('/api/products', upload.array('images', 5), asyncHandler(submitProductHandler));
app.get('/api/products', asyncHandler(getAllProductsHandler));
app.delete('/api/products/:id', asyncHandler(DeleteProductsHandler));
app.post('/api/auth/signin', asyncHandler(signInHandler));
app.post('/api/auth/signup', asyncHandler(signUpHandler));
app.get('/api/auth/check-admin', verifyJWT, asyncHandler(checkAdminHandler));
app.get('/api/order-tracking/:trackingCode', asyncHandler(trackOrderHandler));
app.get('/api/orders', asyncHandler(getOrdersHandler));
app.put('/api/orders/:orderId', asyncHandler(updateOrderStatusHandler));
// Health check
app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
