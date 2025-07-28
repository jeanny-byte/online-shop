import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

// Enable verbose logging
const DEBUG = process.env.NODE_ENV !== 'production';
const log = {
  info: (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`[PAYMENTS-INFO] ${new Date().toISOString()}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[PAYMENTS-ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  debug: (message: string, data?: any) => {
    if (DEBUG) {
      console.debug(`[PAYMENTS-DEBUG] ${new Date().toISOString()}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

// NOTE: Set these in your .env file
const MTN_MOMO_API_KEY = process.env.MTN_MOMO_API_KEY;
const MTN_MOMO_API_SECRET = process.env.MTN_MOMO_API_SECRET;
const MTN_MOMO_SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const MTN_MOMO_BASE_URL = process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
// Removed callback URL - using periodic status checking instead

if (!MTN_MOMO_API_KEY || !MTN_MOMO_API_SECRET || !MTN_MOMO_SUBSCRIPTION_KEY) {
  log.error('Missing MTN MoMo API credentials in .env', {
    hasApiKey: !!MTN_MOMO_API_KEY,
    hasApiSecret: !!MTN_MOMO_API_SECRET,
    hasSubscriptionKey: !!MTN_MOMO_SUBSCRIPTION_KEY
  });
} else {
  log.info('MTN MoMo API credentials loaded successfully');
}

log.info('MTN MoMo configuration', {
  baseUrl: MTN_MOMO_BASE_URL,
  environment: process.env.NODE_ENV || 'development'
});

// Helper: Get access token from MTN MoMo
async function getMtnMomoToken() {
  log.info('Requesting MTN MoMo access token');
  
  const url = `${MTN_MOMO_BASE_URL}/collection/token/`;
  const auth = Buffer.from(`${MTN_MOMO_API_KEY}:${MTN_MOMO_API_SECRET}`).toString('base64');
  
  log.debug('Token request details', {
    url,
    hasAuth: !!auth,
    subscriptionKeyLength: MTN_MOMO_SUBSCRIPTION_KEY?.length || 0
  });
  
  try {
    const response = await axios.post(url, null, {
      headers: {
        'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY,
        Authorization: `Basic ${auth}`,
      },
    });
    
    log.info('MTN MoMo access token obtained successfully', {
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in
    });
    
    return response.data.access_token;
  } catch (error: any) {
    log.error('Failed to obtain MTN MoMo access token', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// Helper: Check payment status using GET request
async function checkMtnMomoPaymentStatus(referenceId: string, accessToken: string, requestId: string) {
  log.info(`[${requestId}] Checking payment status for reference: ${referenceId}`);
  
  const url = `${MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`;
  
  log.debug(`[${requestId}] Status check request details`, {
    url,
    referenceId
  });
  
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Target-Environment': 'sandbox', // Change to 'production' in prod
        'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    log.info(`[${requestId}] Payment status retrieved successfully`, {
      status: response.data.status,
      financialTransactionId: response.data.financialTransactionId
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    log.error(`[${requestId}] Failed to check payment status`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// POST /api/payments/mtn-momo
export async function createMtnMomoPaymentHandler(req: Request, res: Response) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  log.info(`[${requestId}] MTN MoMo payment request initiated`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    const { amount, customerPhone, orderId, description } = req.body;
    
    log.debug(`[${requestId}] Request payload received`, {
      amount,
      customerPhone: customerPhone ? `***${customerPhone.slice(-4)}` : null,
      orderId,
      description,
      bodyKeys: Object.keys(req.body)
    });
    
    if (!amount || !customerPhone || !orderId) {
      log.error(`[${requestId}] Missing required fields`, {
        hasAmount: !!amount,
        hasCustomerPhone: !!customerPhone,
        hasOrderId: !!orderId
      });
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    log.info(`[${requestId}] Validation passed, proceeding with payment`);

    // Step 1: Get access token
    log.info(`[${requestId}] Step 1: Obtaining access token`);
    const accessToken = await getMtnMomoToken();
    log.debug(`[${requestId}] Access token obtained`, {
      tokenLength: accessToken?.length || 0
    });

    // Step 2: Initiate payment request
    log.info(`[${requestId}] Step 2: Initiating payment request`);
    const referenceId = orderId + '-' + Date.now();
    const url = `${MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`;
    
    const payload = {
      amount: amount.toString(),
      currency: 'GHS',
      externalId: orderId.toString(),
      payer: {
        partyIdType: 'MSISDN',
        partyId: customerPhone,
      },
      payerMessage: description || `Order #${orderId}`,
      payeeNote: 'Nelysah Payment',
      // Removed callbackUrl - using periodic status checking instead
    };
    
    log.debug(`[${requestId}] Payment request details`, {
      referenceId,
      url,
      payload: {
        ...payload,
        payer: {
          ...payload.payer,
          partyId: `***${customerPhone.slice(-4)}`
        }
      }
    });
    
    const paymentResponse = await axios.post(url, payload, {
      headers: {
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox', // Change to 'production' in prod
        'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    log.info(`[${requestId}] Payment request sent successfully`, {
      status: paymentResponse.status,
      statusText: paymentResponse.statusText,
    });
    
    log.info(`[${requestId}] Step 3: Payment initiated successfully`, {
      referenceId,
      orderId,
      amount
    });
    
    const response = {
      referenceId,
      paymentUrl: null,
      message: 'Payment initiated. Use referenceId to check status.',
      requestId
    };
    
    log.debug(`[${requestId}] Sending response to client`, response);
    res.json(response);
    return;
  } catch (error: any) {
    log.error(`[${requestId}] MTN MoMo payment failed`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      stack: DEBUG ? error.stack : undefined,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? Object.keys(error.config.headers) : undefined
      }
    });
    
    const errorResponse = {
      error: 'MTN MoMo payment failed',
      details: error.response?.data || error.message,
      requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(errorResponse);
    return;
  }
}

// GET /api/payments/mtn-momo/status/:referenceId
export async function checkMtnMomoPaymentStatusHandler(req: Request, res: Response) {
  const requestId = `status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  log.info(`[${requestId}] MTN MoMo payment status check initiated`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    const { referenceId } = req.params;
    
    log.debug(`[${requestId}] Status check request received`, {
      referenceId
    });
    
    if (!referenceId) {
      log.error(`[${requestId}] Missing reference ID`);
      res.status(400).json({ error: 'Reference ID is required' });
      return;
    }
    
    log.info(`[${requestId}] Validation passed, checking payment status`);

    // Step 1: Get access token
    log.info(`[${requestId}] Step 1: Obtaining access token`);
    const accessToken = await getMtnMomoToken();
    log.debug(`[${requestId}] Access token obtained`, {
      tokenLength: accessToken?.length || 0
    });

    // Step 2: Check payment status
    log.info(`[${requestId}] Step 2: Checking payment status`);
    const statusResult = await checkMtnMomoPaymentStatus(referenceId, accessToken, requestId);
    
    if (!statusResult.success) {
      log.error(`[${requestId}] Failed to retrieve payment status`, statusResult.error);
      res.status(500).json({
        error: 'Failed to check payment status',
        details: statusResult.error,
        requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    log.info(`[${requestId}] Payment status retrieved successfully`, {
      status: statusResult.data.status,
      financialTransactionId: statusResult.data.financialTransactionId
    });
    
    const response = {
      referenceId,
      status: statusResult.data.status,
      amount: statusResult.data.amount,
      currency: statusResult.data.currency,
      financialTransactionId: statusResult.data.financialTransactionId,
      externalId: statusResult.data.externalId,
      payer: statusResult.data.payer,
      payerMessage: statusResult.data.payerMessage,
      payeeNote: statusResult.data.payeeNote,
      reason: statusResult.data.reason,
      requestId,
      timestamp: new Date().toISOString()
    };
    
    log.debug(`[${requestId}] Sending response to client`, response);
    res.json(response);
    return;
  } catch (error: any) {
    log.error(`[${requestId}] MTN MoMo status check failed`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      stack: DEBUG ? error.stack : undefined,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? Object.keys(error.config.headers) : undefined
      }
    });
    
    const errorResponse = {
      error: 'MTN MoMo status check failed',
      details: error.response?.data || error.message,
      requestId,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(errorResponse);
    return;
  }
}
