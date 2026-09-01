<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\StoreSetting;
use App\Services\EmailService;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    protected EmailService $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

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

        $wasReactivated = false;
        if (!$subscriber->wasRecentlyCreated && $subscriber->status !== 'active') {
            $subscriber->update(['status' => 'active']);
            $wasReactivated = true;
        }

        // Send welcome email if newly created or newly reactivated
        if ($subscriber->wasRecentlyCreated || $wasReactivated) {
            $this->emailService->sendNewsletterWelcome($subscriber);
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

    /**
     * Broadcast a newsletter campaign to active subscribers (Admin only).
     */
    public function broadcast(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'subtitle' => 'nullable|string|max:255',
            'banner_url' => 'nullable|url',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => 'nullable|url',
            'recipients' => 'nullable|array',
            'recipients.*' => 'email',
        ]);

        $result = $this->emailService->sendNewsletterBroadcast(
            $validated['subject'],
            $validated['content'],
            $validated['subtitle'] ?? null,
            $validated['banner_url'] ?? null,
            $validated['cta_text'] ?? null,
            $validated['cta_url'] ?? null,
            $validated['recipients'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => "Campaign sent to {$result['sent']} subscriber(s).",
            'stats' => $result,
        ]);
    }

    /**
     * Preview email template in browser (Admin / Developer utility).
     */
    public function previewEmail(Request $request, $template)
    {
        $storeSettings = StoreSetting::first();
        $sampleOrder = Order::with(['items.product', 'driver'])->latest()->first();

        // If no orders exist yet, create a mock order object for preview
        if (!$sampleOrder) {
            $sampleOrder = new Order([
                'customer_name' => 'Adwoa Mensah',
                'customer_email' => 'adwoa@example.com',
                'customer_phone' => '+233 55 123 4567',
                'shipping_address' => '14 Independence Avenue, Ridge, Accra, Ghana',
                'order_total' => 280.00,
                'payment_method' => 'Paystack (Card/MoMo)',
                'payment_reference' => 'PAY-SAMPLE-123456',
                'payment_status' => 'paid',
                'paid_at' => now(),
                'order_status' => 'Processing',
                'tracking_code' => 'ORD-SAMPLE789',
            ]);
            $sampleOrder->created_at = now();
            $sampleOrder->setRelation('items', collect([]));
        }

        $sampleSubscriber = new NewsletterSubscriber([
            'email' => 'adwoa@example.com',
            'status' => 'active'
        ]);

        switch ($template) {
            case 'order-placed':
                return view('emails.orders.placed', [
                    'order' => $sampleOrder,
                    'storeSettings' => $storeSettings,
                ]);

            case 'payment-success':
                return view('emails.orders.payment-success', [
                    'order' => $sampleOrder,
                    'storeSettings' => $storeSettings,
                ]);

            case 'status-updated':
                $sampleOrder->order_status = $request->query('status', 'Shipped');
                return view('emails.orders.status-updated', [
                    'order' => $sampleOrder,
                    'storeSettings' => $storeSettings,
                ]);

            case 'order-cancelled':
                return view('emails.orders.cancelled', [
                    'order' => $sampleOrder,
                    'storeSettings' => $storeSettings,
                ]);

            case 'newsletter-welcome':
                return view('emails.newsletter.welcome', [
                    'subscriber' => $sampleSubscriber,
                    'storeSettings' => $storeSettings,
                ]);

            case 'newsletter-campaign':
                return view('emails.newsletter.campaign', [
                    'subject' => $request->query('subject', 'Radiant Summer Skincare Drop ✨'),
                    'subtitle' => 'Exclusive early access & 15% off new botanical serums',
                    'campaignContent' => '<p>Dear VIP Member,</p><p>We are thrilled to introduce our new brightening Vitamin C and Botanical Glow formulas, handcrafted with organic rosehip and hyaluronic essence.</p><p>Use code <strong>ROYALGLOW</strong> at checkout to redeem your exclusive 15% discount on all new arrivals this week.</p>',
                    'bannerUrl' => null,
                    'ctaText' => 'Shop New Arrivals',
                    'ctaUrl' => env('FRONTEND_URL', 'http://localhost:8080') . '/shop',
                    'subscriber' => $sampleSubscriber,
                    'storeSettings' => $storeSettings,
                ]);

            default:
                return response()->json([
                    'error' => 'Invalid template name.',
                    'available_templates' => [
                        'order-placed',
                        'payment-success',
                        'status-updated',
                        'order-cancelled',
                        'newsletter-welcome',
                        'newsletter-campaign'
                    ]
                ], 404);
        }
    }
}

