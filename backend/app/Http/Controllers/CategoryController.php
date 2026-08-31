<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * List all categories.
     */
    public function index()
    {
        return response()->json(Category::orderBy('name', 'asc')->get());
    }

    /**
     * Store a newly created category (Admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'image' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('category-images', 'public');
            $validated['image'] = url('storage/' . $path);
        }

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }

    /**
     * Update an existing category (Admin).
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'image' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('category-images', 'public');
            $validated['image'] = url('storage/' . $path);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category,
        ]);
    }

    /**
     * Delete a category (Admin).
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
