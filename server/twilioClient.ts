import twilio from 'twilio';

// Twilio client for sending SMS OTP messages
// Gracefully handles missing configuration for development mode

let twilioClient: any = null;
let twilioPhoneNumber: string = '';

async function getTwilioCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const connectorName = 'twilio';
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
    console.warn('Twilio integration not configured. OTP will still work in development mode.');
    return null;
  }

  return {
    accountSid: connectionSettings.settings.account_sid,
    authToken: connectionSettings.settings.auth_token,
    phoneNumber: connectionSettings.settings.phone_number,
  };
}

export async function getTwilioClient() {
  if (twilioClient && twilioPhoneNumber) {
    return { client: twilioClient, phoneNumber: twilioPhoneNumber };
  }

  const credentials = await getTwilioCredentials();
  
  if (!credentials) {
    console.warn('Twilio not configured - SMS OTP will not be sent');
    return null;
  }

  twilioClient = twilio(credentials.accountSid, credentials.authToken);
  twilioPhoneNumber = credentials.phoneNumber;

  return { client: twilioClient, phoneNumber: twilioPhoneNumber };
}

export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    const twilioCredentials = await getTwilioClient();
    
    if (!twilioCredentials) {
      console.log(`[DEVELOPMENT] OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    const { client, phoneNumber: fromNumber } = twilioCredentials;

    await client.messages.create({
      body: `Your Kanche King Admin OTP is: ${otp}. Valid for 5 minutes.`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log(`SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    return false;
  }
}
