<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\EmailService;
use App\Services\MomoService;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected MomoService $momoService;
    protected PaystackService $paystackService;
    protected EmailService $emailService;

    public function __construct(MomoService $momoService, PaystackService $paystackService, EmailService $emailService)
    {
        $this->momoService = $momoService;
        $this->paystackService = $paystackService;
        $this->emailService = $emailService;
    }

    /**
     * Initialize Paystack checkout.
     */
    public function initializePaystackPayment(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'email' => 'required|email',
            'orderId' => 'required|string', // Tracking code or order ID
            'callbackUrl' => 'nullable|url',
            'metadata' => 'nullable|array',
        ]);

        $reference = 'PAY-' . $validated['orderId'] . '-' . time();

        $result = $this->paystackService->initializeTransaction(
            $validated['amount'],
            $validated['email'],
            $reference,
            $validated['callbackUrl'] ?? null,
            array_merge($validated['metadata'] ?? [], [
                'tracking_code' => $validated['orderId'],
            ])
        );

        if ($result) {
            // Update order with payment reference if exists
            Order::where('tracking_code', $validated['orderId'])
                ->update(['payment_reference' => $reference]);

            return response()->json([
                'status' => 'success',
                'reference' => $reference,
                'authorizationUrl' => $result['authorization_url'] ?? null,
                'accessCode' => $result['access_code'] ?? null,
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Unable to initialize Paystack payment. Please verify payment configuration.',
        ], 500);
    }

    /**
     * Verify Paystack payment transaction.
     */
    public function verifyPaystackPayment(Request $request, $reference)
    {
        $data = $this->paystackService->verifyTransaction($reference);

        if ($data && isset($data['status']) && $data['status'] === 'success') {
            $trackingCode = $data['metadata']['tracking_code'] ?? null;
            
            // If tracking code is in metadata, find and update order
            $order = null;
            if ($trackingCode) {
                $order = Order::where('tracking_code', $trackingCode)->first();
            }
            if (!$order) {
                $order = Order::where('payment_reference', $reference)->first();
            }

            if ($order) {
                $wasPaid = $order->payment_status === 'paid';
                $order->update([
                    'payment_status' => 'paid',
                    'payment_reference' => $reference,
                    'paid_at' => now(),
                    'order_status' => $order->order_status === 'Pending' ? 'Processing' : $order->order_status,
                ]);

                // Send payment receipt notification if not already sent
                if (!$wasPaid) {
                    $this->emailService->sendPaymentReceivedNotification($order);
                }
            }

            return response()->json([
                'status' => 'success',
                'verified' => true,
                'order' => $order,
                'data' => $data,
            ]);
        }

        return response()->json([
            'status' => 'failed',
            'verified' => false,
            'message' => 'Payment could not be verified or is still pending.',
            'data' => $data,
        ], 400);
    }

    /**
     * Paystack Webhook Handler.
     */
    public function paystackWebhook(Request $request)
    {
        $signature = $request->header('x-paystack-signature', '');
        $payload = $request->getContent();

        if (!$this->paystackService->validateWebhookSignature($payload, $signature)) {
            Log::warning('Invalid Paystack Webhook Signature');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = json_decode($payload, true);
        Log::info('Paystack Webhook Event Received', ['event' => $event['event'] ?? 'unknown']);

        if (isset($event['event']) && $event['event'] === 'charge.success') {
            $data = $event['data'] ?? [];
            $reference = $data['reference'] ?? null;
            $trackingCode = $data['metadata']['tracking_code'] ?? null;

            $order = null;
            if ($trackingCode) {
                $order = Order::where('tracking_code', $trackingCode)->first();
            }
            if (!$order && $reference) {
                $order = Order::where('payment_reference', $reference)->first();
            }

            if ($order) {
                $wasPaid = $order->payment_status === 'paid';
                $order->update([
                    'payment_status' => 'paid',
                    'payment_reference' => $reference,
                    'paid_at' => now(),
                    'order_status' => $order->order_status === 'Pending' ? 'Processing' : $order->order_status,
                ]);

                if (!$wasPaid) {
                    $this->emailService->sendPaymentReceivedNotification($order);
                }
            }
        }

        return response()->json(['status' => 'ok'], 200);
    }

    // Legacy MTN MoMo endpoints maintained for backward compatibility
    public function createMtnMomoPayment(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'customerPhone' => 'required|string',
            'orderId' => 'required|string',
            'description' => 'string|nullable',
        ]);

        $result = $this->momoService->initiatePayment(
            $validated['amount'],
            $validated['customerPhone'],
            $validated['orderId'],
            $validated['description'] ?? ''
        );

        if ($result) {
            return response()->json($result);
        }

        return response()->json(['error' => 'Payment initiation failed'], 500);
    }

    public function checkMtnMomoStatus($referenceId)
    {
        $status = $this->momoService->checkStatus($referenceId);

        if ($status) {
            return response()->json($status);
        }

        return response()->json(['error' => 'Status check failed'], 500);
    }
}
