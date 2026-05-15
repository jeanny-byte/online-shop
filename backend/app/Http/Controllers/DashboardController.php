<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalUsers = User::count();
        $totalRevenue = Order::where('order_status', 'Delivered')->sum('order_total');
        
        $pendingOrders = Order::where('order_status', 'Pending')->count();
        $processingOrders = Order::where('order_status', 'Processing')->count();
        
        $lowStockProducts = Product::where('stock_quantity', '<=', 5)->get();

        return response()->json([
            'summary' => [
                'totalOrders' => $totalOrders,
                'totalProducts' => $totalProducts,
                'totalUsers' => $totalUsers,
                'totalRevenue' => $totalRevenue,
                'pendingOrders' => $pendingOrders,
                'processingOrders' => $processingOrders,
            ],
            'lowStockProducts' => $lowStockProducts,
            'recentOrders' => Order::orderBy('created_at', 'desc')->take(5)->get(),
        ]);
    }
}
