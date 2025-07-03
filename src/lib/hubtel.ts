
import { toast } from "@/hooks/use-toast";

// Hubtel API base URL
const HUBTEL_API_URL = "https://paystack.hubtel.com/v1"; // Replace with Hubtel's actual base URL

// These should be stored securely in environment variables
const HUBTEL_CLIENT_ID = process.env.NEXT_PUBLIC_HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.NEXT_PUBLIC_HUBTEL_CLIENT_SECRET;

interface HubtelRequestMoneyResponse {
  ResponseCode: string;
  Description: string;
  Data: {
    Token: string;
    CheckoutUrl: string;
  };
}

interface HubtelVerifyPaymentResponse {
  ResponseCode: string;
  Description: string;
  Data: {
    TransactionId: string;
    Status: string;
    Amount: number;
    CustomerEmail: string;
    CustomerMsisdn: string;
  };
}

/**
 * Initiates a payment request to Hubtel.
 */
export const requestMoney = async (
  amount: number,
  customerEmail: string,
  customerMsisdn: string,
  description: string,
  callbackUrl: string
): Promise<HubtelRequestMoneyResponse> => {
  try {
    const basicAuth = btoa(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`);

    const response = await fetch(`${HUBTEL_API_URL}/requestmoney`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        Amount: amount,
        CustomerEmail: customerEmail,
        CustomerMsisdn: customerMsisdn,
        Description: description,
        CallbackUrl: callbackUrl,
        ClientReference: `REF-${Date.now()}`, // Generate a unique reference
      }),
    });

    const data: HubtelRequestMoneyResponse = await response.json();

    if (data.ResponseCode !== "0000") {
      toast({
        title: "Payment Error",
        description: `Hubtel Error: ${data.Description}`,
        variant: "destructive",
      });
      throw new Error(`Hubtel API Error: ${data.Description}`);
    }

    return data;
  } catch (error: any) {
    console.error("Error requesting money from Hubtel:", error);
    toast({
      title: "Payment Error",
      description: `Failed to initiate payment. ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Verifies the payment status with Hubtel.
 */
export const verifyPayment = async (
  token: string
): Promise<HubtelVerifyPaymentResponse> => {
  try {
    const basicAuth = btoa(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`);

    const response = await fetch(
      `${HUBTEL_API_URL}/verify_payment?token=${token}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    const data: HubtelVerifyPaymentResponse = await response.json();

    if (data.ResponseCode !== "0000") {
      toast({
        title: "Payment Verification Error",
        description: `Hubtel Error: ${data.Description}`,
        variant: "destructive",
      });
      throw new Error(`Hubtel API Error: ${data.Description}`);
    }

    return data;
  } catch (error: any) {
    console.error("Error verifying Hubtel payment:", error);
    toast({
      title: "Payment Verification Error",
      description: `Failed to verify payment. ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Generates a unique client reference.
 */
export const generateClientReference = (): string => {
  return `REF-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};