import twilio from 'twilio';

// Twilio client for sending SMS OTP messages
// Gracefully handles missing configuration for development mode

let twilioClient: any = null;
let twilioPhoneNumber: string = '';

async function getTwilioCredentials() {
  // First check environment variables (user-provided Twilio credentials)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    return {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    };
  }

  // Fallback to Replit connector if available
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
      return null;
    }

    return {
      accountSid: connectionSettings.settings.account_sid,
      authToken: connectionSettings.settings.auth_token,
      phoneNumber: connectionSettings.settings.phone_number,
    };
  } catch (error) {
    console.warn('Twilio connector not available, checking environment variables...');
    return null;
  }
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
