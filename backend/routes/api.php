<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TestimonialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/signup', [AuthController::class, 'register']);
Route::post('/auth/signin', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/slug/{slug}', [BlogPostController::class, 'showBySlug']);
Route::get('/blog-posts/{id}', [BlogPostController::class, 'showById']);

Route::get('/testimonials', [TestimonialController::class, 'index']);

Route::get('/order-tracking/{trackingCode}', [OrderController::class, 'trackOrder']);
Route::post('/orders/whatsapp', [OrderController::class, 'store']);

Route::post('/payments/mtn_momo', [\App\Http\Controllers\PaymentController::class, 'createMtnMomoPayment']);
Route::get('/payments/mtn_momo/status/{referenceId}', [\App\Http\Controllers\PaymentController::class, 'checkMtnMomoStatus']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/check-admin', [AuthController::class, 'checkAdmin']);
    Route::get('/auth/is-driver', [AuthController::class, 'isDriver']);

    Route::get('/orders/user/{email}', [OrderController::class, 'userOrders']);
    Route::get('/orders/driver', [OrderController::class, 'driverOrders']);
    
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::get('/profile/{id}', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::get('/profile/email/{email}', [\App\Http\Controllers\ProfileController::class, 'showByEmail']);

    Route::post('/testimonials', [TestimonialController::class, 'store']);

    // Admin routes
    Route::middleware('can:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\UserController::class, 'show']);
        Route::post('/users', [\App\Http\Controllers\UserController::class, 'store']);
        Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update']);
        Route::delete('/users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);
        
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/products/update-stock', [ProductController::class, 'updateStockBatch']);
        
        Route::post('/blog-posts', [BlogPostController::class, 'store']);
        Route::put('/blog-posts/{id}', [BlogPostController::class, 'update']);
        Route::delete('/blog-posts/{id}', [BlogPostController::class, 'destroy']);
        
        Route::get('/orders', [OrderController::class, 'index']);
        Route::put('/orders/{orderId}', [OrderController::class, 'updateStatus']);
    });
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
