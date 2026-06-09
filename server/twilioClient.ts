import twilio from 'twilio';

let twilioClient: any = null;

async function getClient() {
  if (twilioClient) return twilioClient;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('Twilio not configured - TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing');
    return null;
  }
  
  console.log('Twilio client initialized with Account SID:', accountSid.slice(0, 10) + '...');
  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

function formatPhone(phoneNumber: string): string {
  if (phoneNumber.startsWith('+')) return phoneNumber;
  if (phoneNumber.length === 10) return '+91' + phoneNumber;
  if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) return '+' + phoneNumber;
  return phoneNumber;
}

export async function sendOTPViaTwilio(phoneNumber: string): Promise<boolean> {
  try {
    const client = await getClient();
    if (!client) {
      console.log(`[DEV] Twilio not configured - OTP not sent`);
      return false;
    }

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      console.error('TWILIO_VERIFY_SERVICE_SID missing');
      return false;
    }

    const toPhone = formatPhone(phoneNumber);
    console.log(`Sending OTP via Twilio Verify to: ${toPhone}`);

    await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: toPhone, channel: 'sms' });

    console.log(`OTP sent successfully to ${toPhone}`);
    return true;
  } catch (error) {
    console.error('Twilio send error:', error);
    return false;
  }
}

export async function verifyOTPViaTwilio(phoneNumber: string, code: string): Promise<boolean> {
  try {
    const client = await getClient();
    if (!client) return false;

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) return false;

    const toPhone = formatPhone(phoneNumber);
    console.log(`Verifying OTP for: ${toPhone}`);

    const result = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: toPhone, code });

    console.log(`OTP verify status: ${result.status}`);
    return result.status === 'approved';
  } catch (error) {
    console.error('Twilio verify error:', error);
    return false;
  }
}

// Purana function bhi rakha — backward compatibility ke liye
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  return sendOTPViaTwilio(phoneNumber);
}

export async function getTwilioClient() {
  const client = await getClient();
  if (!client) return null;
  return { client, phoneNumber: process.env.TWILIO_PHONE_NUMBER || '' };
}
