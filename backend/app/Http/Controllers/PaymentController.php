<?php

namespace App\Http\Controllers;

use App\Services\MomoService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $momoService;

    public function __construct(MomoService $momoService)
    {
        $this->momoService = $momoService;
    }

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
