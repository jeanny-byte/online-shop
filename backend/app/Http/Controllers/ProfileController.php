<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function showByEmail($email)
    {
        $user = User::where('email', $email)->firstOrFail();
        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'string|max:255',
            'display_name' => 'string|nullable',
            'email' => 'string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'string|nullable',
            'shipping_address' => 'string|nullable',
            'city' => 'string|nullable',
            'state' => 'string|nullable',
            'avatar_url' => 'string|nullable',
            'website' => 'string|nullable',
        ]);

        $user->update($validated);

        return response()->json(['success' => true, 'user' => $user]);
    }
}
