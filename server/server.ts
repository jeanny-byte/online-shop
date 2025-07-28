import express from 'express';
import cors from 'cors';
import path from 'path';
import { createWhatsappOrderHandler } from './api/orders';
import { dashboardHandler } from './api/dashboard';
import { createMtnMomoPaymentHandler, checkMtnMomoPaymentStatusHandler } from './api/payments';
import { DeleteProductsHandler, getAllProductsHandler, getProductHandler, submitProductHandler, updateStockBatchHandler } from './api/products';
import uploadRouter, { upload } from './upload';
import blogPostsRouter from './blogPosts';
import { getOrdersHandler, updateOrderStatusHandler, getOrdersByUserEmailHandler, getDriverOrdersHandler } from './api/orders';
import { signInHandler, signUpHandler, checkAdminHandler, isDriverHandler } from './api/auth';
import { verifyJWT, requireAdmin } from './middleware/auth';
import dotenv from 'dotenv';
dotenv.config();
import { trackOrderHandler } from './api/orderTracking';
import { testDbConnectionHandler } from './api/testDbConnection';
const app = express();

const PORT = process.env.PORT || 5080;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // or higher if needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Utility to wrap async route handlers
import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// API routes
import profileRouter from './api/profile';

app.use('/api/profile', profileRouter);
app.get('/api/testimonials', asyncHandler(require('./api/testimonials').getTestimonialsHandler));
app.post('/api/testimonials', verifyJWT, asyncHandler(require('./api/testimonials').submitTestimonialHandler));
app.get('/api/dashboard', verifyJWT, requireAdmin, asyncHandler(dashboardHandler));
app.post('/api/payments/mtn_momo', asyncHandler(createMtnMomoPaymentHandler));
app.get('/api/payments/mtn_momo/status/:referenceId', asyncHandler(checkMtnMomoPaymentStatusHandler));
app.post('/api/orders/whatsapp', asyncHandler(createWhatsappOrderHandler));
app.get('/api/products/:id', asyncHandler(getProductHandler));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRouter);
app.use('/api/blog-posts', blogPostsRouter);
app.post('/api/products', upload.array('images', 5), asyncHandler(submitProductHandler));
app.put('/api/products', upload.array('images', 5), asyncHandler(submitProductHandler));
app.post('/api/products/update-stock', asyncHandler(updateStockBatchHandler));
app.get('/api/products', asyncHandler(getAllProductsHandler));
app.delete('/api/products/:id', asyncHandler(DeleteProductsHandler));
app.post('/api/auth/signin', asyncHandler(signInHandler));
app.post('/api/auth/signup', asyncHandler(signUpHandler));
app.get('/api/auth/check-admin', verifyJWT, asyncHandler(checkAdminHandler));
app.get('/api/auth/is-driver', verifyJWT, asyncHandler(isDriverHandler));
app.get('/api/order-tracking/:trackingCode', asyncHandler(trackOrderHandler));
app.get('/api/orders', asyncHandler(getOrdersHandler));
app.get('/api/orders/user/:email', asyncHandler(getOrdersByUserEmailHandler));
app.get('/api/orders/driver', verifyJWT, asyncHandler(getDriverOrdersHandler));
app.put('/api/orders/:orderId', asyncHandler(updateOrderStatusHandler));
// Health check
app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });
app.get('/api/test-db-connection', asyncHandler(testDbConnectionHandler));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
