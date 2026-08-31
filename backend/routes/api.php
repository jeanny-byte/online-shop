<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/signup', [AuthController::class, 'register']);
Route::post('/auth/signin', [AuthController::class, 'login']);

Route::get('/settings', [StoreSettingController::class, 'index']);

Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/slug/{slug}', [BlogPostController::class, 'showBySlug']);
Route::get('/blog-posts/{id}', [BlogPostController::class, 'showById']);

Route::get('/testimonials', [TestimonialController::class, 'index']);

// Order management (Public creation & lookup)
Route::get('/order-tracking/{trackingCode}', [OrderController::class, 'trackOrder']);
Route::post('/orders', [OrderController::class, 'store']);
Route::post('/orders/whatsapp', [OrderController::class, 'store']);

// Payment routes (Paystack & MTN MoMo)
Route::post('/payments/paystack/initialize', [PaymentController::class, 'initializePaystackPayment']);
Route::get('/payments/paystack/verify/{reference}', [PaymentController::class, 'verifyPaystackPayment']);
Route::post('/payments/paystack/webhook', [PaymentController::class, 'paystackWebhook']);

Route::post('/payments/mtn_momo', [PaymentController::class, 'createMtnMomoPayment']);
Route::get('/payments/mtn_momo/status/{referenceId}', [PaymentController::class, 'checkMtnMomoStatus']);

// Newsletter routes
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/check-admin', [AuthController::class, 'checkAdmin']);
    Route::get('/auth/is-driver', [AuthController::class, 'isDriver']);

    Route::get('/orders/user/{email}', [OrderController::class, 'userOrders']);
    Route::get('/orders/driver', [OrderController::class, 'driverOrders']);
    
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/{id}', [ProfileController::class, 'show']);
    Route::get('/profile/email/{email}', [ProfileController::class, 'showByEmail']);

    Route::post('/testimonials', [TestimonialController::class, 'store']);

    // Admin routes
    Route::middleware('can:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Category management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
        
        // Product management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/products/update-stock', [ProductController::class, 'updateStockBatch']);
        
        Route::post('/blog-posts', [BlogPostController::class, 'store']);
        Route::put('/blog-posts/{id}', [BlogPostController::class, 'update']);
        Route::delete('/blog-posts/{id}', [BlogPostController::class, 'destroy']);
        
        Route::get('/orders', [OrderController::class, 'index']);
        Route::put('/orders/{orderId}/assign-driver', [OrderController::class, 'assignDriver']);

        Route::post('/settings', [StoreSettingController::class, 'update']);
        Route::get('/newsletter/subscribers', [NewsletterController::class, 'index']);
    });

    Route::put('/orders/{orderId}', [OrderController::class, 'updateStatus'])->middleware('can:staff');
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
