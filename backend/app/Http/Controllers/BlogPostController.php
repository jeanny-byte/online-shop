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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'published' => 'required|in:true,false,1,0,true,false',
            'author_id' => 'nullable|exists:users,id',
            'image' => 'required',
        ]);

        $validated['published'] = filter_var($validated['published'], FILTER_VALIDATE_BOOLEAN);
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']) . '-' . time();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blog-images', 'public');
            $validated['image'] = url('storage/' . $path);
        }

        $post = BlogPost::create($validated);

        return response()->json($post, 201);
    }

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'sometimes|string',
            'content' => 'sometimes|string',
            'published' => 'sometimes|in:true,false,1,0',
            'author_id' => 'nullable|exists:users,id',
            'image' => 'sometimes',
        ]);

        if (isset($validated['published'])) {
            $validated['published'] = filter_var($validated['published'], FILTER_VALIDATE_BOOLEAN);
        }

        if (isset($validated['title'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']) . '-' . time();
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blog-images', 'public');
            $validated['image'] = url('storage/' . $path);
        }

        $post->update($validated);

        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }
}
