<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index()
    {
        return response()->json(Testimonial::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'location' => 'string',
            'quote' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'image' => 'string',
        ]);

        $testimonial = Testimonial::create($validated);

        return response()->json($testimonial, 201);
    }
}
