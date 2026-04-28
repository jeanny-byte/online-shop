<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index()
    {
        return response()->json(BlogPost::with('author')->where('published', true)->orderBy('created_at', 'desc')->get());
    }

    public function show($slug)
    {
        $post = BlogPost::with('author')->where('slug', $slug)->firstOrFail();
        return response()->json($post);
    }
}
