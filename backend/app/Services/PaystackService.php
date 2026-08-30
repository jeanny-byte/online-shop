<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected string $secretKey;
    protected string $publicKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key', env('PAYSTACK_SECRET_KEY', ''));
        $this->publicKey = config('services.paystack.public_key', env('PAYSTACK_PUBLIC_KEY', ''));
        $this->baseUrl = config('services.paystack.payment_url', 'https://api.paystack.co');
    }

    /**
     * Initialize a payment transaction with Paystack.
     *
     * @param float|int $amount In standard GHS (converted to pesewas: x 100)
     * @param string $email
     * @param string $reference Unique reference (e.g. order tracking code or REF-xxx)
     * @param string|null $callbackUrl
     * @param array $metadata
     * @return array|null
     */
    public function initializeTransaction($amount, string $email, string $reference, ?string $callbackUrl = null, array $metadata = []): ?array
    {
        $url = "{$this->baseUrl}/transaction/initialize";

        // Paystack expects amount in lowest currency unit (pesewas/kobo -> multiply by 100)
        $amountInSubunits = (int) round($amount * 100);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
                'Content-Type' => 'application/json',
            ])->post($url, [
                'amount' => $amountInSubunits,
                'email' => $email,
                'currency' => 'GHS',
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'metadata' => $metadata,
            ]);

            if ($response->successful() && $response->json('status') === true) {
                return $response->json('data');
            }

            Log::error('Paystack Initialize Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Paystack Initialize Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Verify a transaction with Paystack by reference.
     *
     * @param string $reference
     * @return array|null
     */
    public function verifyTransaction(string $reference): ?array
    {
        $url = "{$this->baseUrl}/transaction/verify/" . rawurlencode($reference);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
            ])->get($url);

            if ($response->successful() && $response->json('status') === true) {
                return $response->json('data');
            }

            Log::error('Paystack Verify Error', [
                'reference' => $reference,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Paystack Verify Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Validate Paystack webhook signature.
     *
     * @param string $payload Raw request content
     * @param string $signature Content of X-Paystack-Signature header
     * @return bool
     */
    public function validateWebhookSignature(string $payload, string $signature): bool
    {
        if (empty($this->secretKey) || empty($signature)) {
            return false;
        }
        $computed = hash_hmac('sha512', $payload, $this->secretKey);
        return hash_equals($computed, $signature);
    }
}
