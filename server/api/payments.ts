import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

// NOTE: You must set these in your .env file
const HUBTEL_MERCHANT_ACCOUNT = process.env.HUBTEL_MERCHANT_ACCOUNT;
const HUBTEL_API_KEY = process.env.HUBTEL_API_KEY;
const HUBTEL_CALLBACK_URL = process.env.HUBTEL_CALLBACK_URL || 'https://yourdomain.com/payment-callback';

if (!HUBTEL_MERCHANT_ACCOUNT || !HUBTEL_API_KEY) {
  console.error('Missing Hubtel API credentials in .env');
}

// POST /api/payments/hubtel
export async function createHubtelPaymentHandler(req: Request, res: Response) {
  try {
    const { amount, customerName, customerEmail, customerPhone, orderId, description } = req.body;
    if (!amount || !customerPhone || !orderId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Hubtel API endpoint
    const url = 'https://api.hubtel.com/v1/merchantaccount/onlinecheckout/invoice/create';
    const payload = {
      totalAmount: amount,
      description: description || `Order #${orderId}`,
      callbackUrl: HUBTEL_CALLBACK_URL,
      returnUrl: HUBTEL_CALLBACK_URL, // You can use a success page
      merchantBusinessAccount: HUBTEL_MERCHANT_ACCOUNT,
      customerName,
      customerEmail,
      customerMsisdn: customerPhone,
      clientReference: orderId,
      // Add other fields as needed
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${HUBTEL_MERCHANT_ACCOUNT}:${HUBTEL_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.data && response.data.data.checkoutUrl) {
      res.json({ paymentUrl: response.data.data.checkoutUrl });
    } else {
      res.status(500).json({ error: 'Failed to create Hubtel payment' });
    }
    return;
  } catch (error: any) {
    console.error('Hubtel payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Hubtel payment failed', details: error.response?.data || error.message });
    return;
  }
}
