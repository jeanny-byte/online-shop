<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string',
            'stock_quantity' => 'nullable|integer|min:0',
            'featured' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*' => 'image',
        ]);

        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('product-images', 'public');
                try {
                    $destDir = public_path('storage/product-images');
                    if (!file_exists($destDir)) {
                        @mkdir($destDir, 0755, true);
                    }
                    @copy(\Illuminate\Support\Facades\Storage::disk('public')->path($path), public_path('storage/' . $path));
                } catch (\Throwable $e) {
                    // Ignore copy error; stream route will serve it
                }
                $imageUrls[] = '/storage/' . $path;
            }
        }

        $validated['images'] = $imageUrls;
        $validated['image'] = count($imageUrls) > 0 ? $imageUrls[0] : null;
        $validated['stock_quantity'] = $validated['stock_quantity'] ?? 0;
        $validated['featured'] = $validated['featured'] ?? false;

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string',
            'stock_quantity' => 'sometimes|integer|min:0',
            'featured' => 'sometimes|boolean',
            'images' => 'nullable|array',
            'images.*' => 'image',
            'existingImages' => 'nullable|string',
        ]);

        $imageUrls = [];
        
        if ($request->has('existingImages')) {
            $existing = json_decode($request->input('existingImages'), true);
            if (is_array($existing)) {
                $imageUrls = $existing;
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('product-images', 'public');
                try {
                    $destDir = public_path('storage/product-images');
                    if (!file_exists($destDir)) {
                        @mkdir($destDir, 0755, true);
                    }
                    @copy(\Illuminate\Support\Facades\Storage::disk('public')->path($path), public_path('storage/' . $path));
                } catch (\Throwable $e) {
                    // Ignore copy error; stream route will serve it
                }
                $imageUrls[] = '/storage/' . $path;
            }
        }

        $validated['images'] = $imageUrls;
        $validated['image'] = count($imageUrls) > 0 ? $imageUrls[0] : ($product->image ?? null);

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function updateStockBatch(Request $request)
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer'
        ]);

        foreach ($items['items'] as $item) {
            $product = Product::find($item['id']);
            if ($product) {
                $product->decrement('stock_quantity', $item['quantity']);
            }
        }

        return response()->json(['message' => 'Stock updated']);
    }
}
