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

export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    const client = await getClient();
    
    if (!client) {
      console.log(`[DEVELOPMENT] OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Format phone number for India
    let toPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.length === 10) {
        toPhoneNumber = '+91' + phoneNumber;
      } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
        toPhoneNumber = '+' + phoneNumber;
      }
    }

    if (serviceSid) {
      console.log(`Sending OTP via Twilio Verify to: ${toPhoneNumber}`);
      await client.verify.v2.services(serviceSid)
        .verifications
        .create({ to: toPhoneNumber, channel: 'sms' });
      console.log(`OTP sent successfully via Verify to ${toPhoneNumber}`);
    } else {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        console.log(`[DEVELOPMENT] OTP for ${phoneNumber}: ${otp}`);
        return true;
      }
      console.log(`Sending SMS to: ${toPhoneNumber} from: ${fromNumber}`);
      await client.messages.create({
        body: `Your Kanche King Admin OTP is: ${otp}. Valid for 5 minutes.`,
        from: fromNumber,
        to: toPhoneNumber,
      });
      console.log(`SMS sent successfully to ${toPhoneNumber}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    return false;
  }
}

export async function getTwilioClient() {
  const client = await getClient();
  if (!client) return null;
  return { client, phoneNumber: process.env.TWILIO_PHONE_NUMBER || '' };
}
