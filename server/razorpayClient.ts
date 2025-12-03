// Razorpay client for handling Indian payments
// Razorpay is the leading payment gateway in India

export async function getRazorpayCredentials() {
  // Check environment variables for user-provided Razorpay credentials
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
    };
  }

  // Check Replit connector
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (!xReplitToken || !hostname) {
      return null;
    }

    const connectorName = 'razorpay';
    const url = new URL(`https://${hostname}/api/v2/connection`);
    url.searchParams.set('include_secrets', 'true');
    url.searchParams.set('connector_names', connectorName);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });

    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (!connectionSettings) {
      return null;
    }

    return {
      keyId: connectionSettings.settings.key_id,
      keySecret: connectionSettings.settings.key_secret,
    };
  } catch (error) {
    console.warn('Razorpay connector not available');
    return null;
  }
}

export async function createRazorpayOrder(
  amount: number, // in paise (amount * 100)
  userId: string,
  marblesCount: number
): Promise<any> {
  try {
    const credentials = await getRazorpayCredentials();
    
    if (!credentials) {
      throw new Error('Razorpay credentials not configured');
    }

    // Create basic auth header
    const authString = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // in paise
        currency: 'INR',
        receipt: `marble_${userId}_${Date.now()}`,
        notes: {
          userId,
          marblesCount,
          appName: 'KancheKing',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Razorpay API error: ${response.statusText}`);
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): Promise<boolean> {
  try {
    const crypto = require('crypto');
    
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return false;
  }
}
