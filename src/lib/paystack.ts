
import { toast } from "@/hooks/use-toast";

// Paystack API base URL
const PAYSTACK_API_URL = "https://api.paystack.co";

// This would be stored securely in environment variables
// For demo purposes, we'll add it directly in the code
// In production, this should be stored in server-side environment variables
const TEST_SECRET_KEY = "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string | null;
    };
  };
}

/**
 * Initialize a Paystack transaction.
 * In a real-world app, this should be done on the server side.
 * For demonstration purposes, we're doing it on the client side.
 */
export const initializePayment = async (
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, any> = {}
): Promise<PaystackInitializeResponse> => {
  try {
    // In a real app, this would be a server-side API call
    // For demo purposes, we're returning a mock response
    // that simulates a successful Paystack initialization
    
    // Generate a unique test payment link based on the reference
    const mockAuthUrl = `https://checkout.paystack.com/${reference}`;
    
    return {
      status: true,
      message: "Authorization URL created",
      data: {
        authorization_url: mockAuthUrl,
        access_code: "ACCESS_CODE",
        reference: reference
      }
    };
    
    /* In a real implementation with a backend, you would make this call:
    
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_SECRET_KEY}`
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack amount is in kobo (smallest currency unit)
        reference,
        metadata
      })
    });
    
    return await response.json();
    */
  } catch (error) {
    console.error("Error initializing Paystack payment:", error);
    throw error;
  }
};

/**
 * Verify a Paystack transaction by reference.
 * In a real-world app, this should be done on the server side.
 */
export const verifyPayment = async (reference: string): Promise<PaystackVerifyResponse> => {
  try {
    // In a real app, this would be a server-side API call
    // For demo purposes, we're returning a mock successful response
    
    return {
      status: true,
      message: "Verification successful",
      data: {
        id: 123456789,
        domain: "test",
        status: "success",
        reference: reference,
        amount: 5000,
        message: null,
        gateway_response: "Successful",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: "card",
        currency: "NGN",
        customer: {
          id: 123456,
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          customer_code: "CUS_123456",
          phone: null
        }
      }
    };
    
    /* In a real implementation with a backend, you would make this call:
    
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_SECRET_KEY}`
      }
    });
    
    return await response.json();
    */
  } catch (error) {
    console.error("Error verifying Paystack payment:", error);
    throw error;
  }
};

/**
 * Generate a unique reference ID for Paystack transactions
 */
export const generatePaymentReference = (): string => {
  return `ref-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

