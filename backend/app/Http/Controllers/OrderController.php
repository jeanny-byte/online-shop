<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'string|email',
            'customer_phone' => 'required|string',
            'shipping_address' => 'string',
            'order_total' => 'required|numeric',
            'payment_method' => 'required|string',
            'tracking_code' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price_per_item' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated) {
            $order = Order::create([
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'] ?? '',
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'] ?? '',
                'order_total' => $validated['order_total'],
                'payment_method' => $validated['payment_method'],
                'order_status' => 'pending',
                'tracking_code' => $validated['tracking_code'],
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price_per_item' => $item['price_per_item'],
                ]);
            }

            return response()->json([
                'id' => $order->id,
                'tracking_code' => $order->tracking_code,
                'message' => 'Order created successfully'
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Order::query();

        if ($status && $status !== 'all') {
            $query->where('order_status', ucfirst($status));
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function userOrders($email)
    {
        $orders = Order::with('items.product')
            ->where('customer_email', $email)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['orders' => $orders]);
    }

    public function driverOrders(Request $request)
    {
        $user = $request->user();
        if (!$user->is_driver) {
            return response()->json(['error' => 'Access denied. Driver privileges required.'], 403);
        }

        $orders = Order::with('items.product')
            ->orderByRaw("CASE 
                WHEN order_status = 'Pending' THEN 1
                WHEN order_status = 'Processing' THEN 2
                WHEN order_status = 'Shipped' THEN 3
                WHEN order_status = 'Delivered' THEN 4
                ELSE 5
            END")
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['orders' => $orders]);
    }

    public function updateStatus(Request $request, $orderId)
    {
        $request->validate([
            'status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled',
        ]);

        $order = Order::findOrFail($orderId);
        $prevStatus = $order->order_status;
        $status = $request->status;

        return DB::transaction(function () use ($order, $status, $prevStatus) {
            $order->update(['order_status' => $status]);

            $stockRestored = false;
            $stockDecremented = false;

            if (strtolower($status) === 'cancelled') {
                foreach ($order->items as $item) {
                    Product::where('id', $item->product_id)->increment('stock_quantity', $item->quantity);
                }
                $stockRestored = true;
            }

            if (strtolower($prevStatus) === 'cancelled' && strtolower($status) !== 'cancelled') {
                foreach ($order->items as $item) {
                    Product::where('id', $item->product_id)->decrement('stock_quantity', $item->quantity);
                }
                $stockDecremented = true;
            }

            // In a real app, we would fire an event for email notification here
            // event(new OrderStatusUpdated($order));

            return response()->json([
                'message' => 'Order status updated',
                'stockRestored' => $stockRestored,
                'stockDecremented' => $stockDecremented
            ]);
        });
    }

    public function trackOrder($trackingCode)
    {
        $order = Order::with('items.product')
            ->where('tracking_code', $trackingCode)
            ->firstOrFail();

        return response()->json($order);
    }
}
