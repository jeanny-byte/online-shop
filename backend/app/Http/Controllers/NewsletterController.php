<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Subscribe an email to the newsletter.
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $subscriber = NewsletterSubscriber::firstOrCreate(
            ['email' => strtolower(trim($validated['email']))],
            ['status' => 'active']
        );

        if (!$subscriber->wasRecentlyCreated && $subscriber->status !== 'active') {
            $subscriber->update(['status' => 'active']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Thank you for subscribing to our newsletter!',
            'subscriber' => $subscriber,
        ], 200);
    }

    /**
     * List all subscribers (Admin only).
     */
    public function index()
    {
        $subscribers = NewsletterSubscriber::orderBy('created_at', 'desc')->get();
        return response()->json($subscribers);
    }

    /**
     * Unsubscribe an email.
     */
    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $subscriber = NewsletterSubscriber::where('email', strtolower(trim($validated['email'])))->first();
        if ($subscriber) {
            $subscriber->update(['status' => 'unsubscribed']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'You have been unsubscribed successfully.',
        ]);
    }
}
