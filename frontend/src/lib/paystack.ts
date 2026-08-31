import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || '';

export interface PaystackInitResponse {
  status: 'success' | 'error';
  reference?: string;
  authorizationUrl?: string;
  accessCode?: string;
  message?: string;
}

export interface PaystackVerifyResponse {
  status: 'success' | 'failed';
  verified: boolean;
  message?: string;
  order?: any;
  data?: any;
}

/**
 * Initialize a Paystack payment via backend proxy.
 */
export const initializePaystackPayment = async (
  amount: number,
  email: string,
  orderId: string, // tracking code
  metadata: Record<string, any> = {}
): Promise<PaystackInitResponse> => {
  try {
    const callbackUrl = `${window.location.origin}/track-order?code=${orderId}&payment=paystack_callback`;

    const response = await fetch(`${API_URL}/api/payments/paystack/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount,
        email,
        orderId,
        callbackUrl,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Payment initialization failed');
    }

    return data;
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    toast({
      title: 'Payment Error',
      description: error.message || 'Could not connect to payment gateway.',
      variant: 'destructive',
    });
    throw error;
  }
};

/**
 * Verify Paystack payment status via backend.
 */
export const verifyPaystackPayment = async (
  reference: string
): Promise<PaystackVerifyResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/payments/paystack/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    return {
      status: 'failed',
      verified: false,
      message: error.message || 'Failed to verify payment',
    };
  }
};
