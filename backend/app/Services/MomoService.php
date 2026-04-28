<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MomoService
{
    protected $baseUrl;
    protected $subscriptionKey;
    protected $apiKey;
    protected $apiSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.momo.base_url');
        $this->subscriptionKey = config('services.momo.subscription_key');
        $this->apiKey = config('services.momo.api_key');
        $this->apiSecret = config('services.momo.api_secret');
    }

    public function getToken()
    {
        $url = "{$this->baseUrl}/collection/token/";
        $auth = base64_encode("{$this->apiKey}:{$this->apiSecret}");

        try {
            $response = Http::withHeaders([
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'Authorization' => "Basic {$auth}",
            ])->post($url);

            if ($response->successful()) {
                return $response->json('access_token');
            }

            Log::error('Momo Token Error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Momo Token Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    public function initiatePayment($amount, $phone, $orderId, $description)
    {
        $token = $this->getToken();
        if (!$token) return null;

        $referenceId = $orderId . '-' . time();
        $url = "{$this->baseUrl}/collection/v1_0/requesttopay";

        try {
            $response = Http::withHeaders([
                'X-Reference-Id' => $referenceId,
                'X-Target-Environment' => 'sandbox', // Use 'production' in prod
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
            ])->post($url, [
                'amount' => (string)$amount,
                'currency' => 'GHS',
                'externalId' => (string)$orderId,
                'payer' => [
                    'partyIdType' => 'MSISDN',
                    'partyId' => $phone,
                ],
                'payerMessage' => $description ?: "Order #$orderId",
                'payeeNote' => 'Nelysah Payment',
            ]);

            if ($response->successful()) {
                return [
                    'referenceId' => $referenceId,
                    'message' => 'Payment initiated successfully'
                ];
            }

            Log::error('Momo Payment Initiation Error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Momo Payment Initiation Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    public function checkStatus($referenceId)
    {
        $token = $this->getToken();
        if (!$token) return null;

        $url = "{$this->baseUrl}/collection/v1_0/requesttopay/{$referenceId}";

        try {
            $response = Http::withHeaders([
                'X-Target-Environment' => 'sandbox',
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'Authorization' => "Bearer {$token}",
            ])->get($url);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Momo Status Check Error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Momo Status Check Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }
}
