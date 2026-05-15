<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'brands' => 'required|string',
            'how_to_use' => 'required|string',
            'stock_quantity' => 'integer',
            'featured' => 'boolean',
            'benefits' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image',
        ]);

        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('product-images', 'public');
                $imageUrls[] = url('storage/' . $path);
            }
        }

        $validated['images'] = $imageUrls;
        $validated['image'] = count($imageUrls) > 0 ? $imageUrls[0] : null;

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string',
            'description' => 'string',
            'price' => 'numeric',
            'category' => 'string',
            'brands' => 'string',
            'how_to_use' => 'string',
            'stock_quantity' => 'integer',
            'featured' => 'boolean',
            'benefits' => 'nullable|string',
            'ingredients' => 'nullable|string',
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
                $imageUrls[] = url('storage/' . $path);
            }
        }

        $validated['images'] = $imageUrls;
        $validated['image'] = count($imageUrls) > 0 ? $imageUrls[0] : null;

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
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
