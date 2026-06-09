import twilio from 'twilio';

let twilioClient: any = null;

async function getClient() {
  if (twilioClient) return twilioClient;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('Twilio not configured');
    return null;
  }
  
  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

// Send OTP using Twilio Verify API
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
      // Use Twilio Verify API (no phone number needed)
      console.log(`Sending OTP via Verify to: ${toPhoneNumber}`);
      await client.verify.v2.services(serviceSid)
        .verifications
        .create({ to: toPhoneNumber, channel: 'sms' });
      console.log(`OTP sent successfully to ${toPhoneNumber}`);
    } else {
      // Fallback: use regular SMS
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        console.log(`[DEVELOPMENT] OTP for ${phoneNumber}: ${otp}`);
        return true;
      }
      await client.messages.create({
        body: `Your Kanche King Admin OTP is: ${otp}. Valid for 5 minutes.`,
        from: fromNumber,
        to: toPhoneNumber,
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    return false;
  }
}

// Verify OTP using Twilio Verify API
export async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    const client = await getClient();
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    if (!client || !serviceSid) {
      return true; // Development mode
    }

    let toPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.length === 10) {
        toPhoneNumber = '+91' + phoneNumber;
      } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
        toPhoneNumber = '+' + phoneNumber;
      }
    }

    const verification = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: toPhoneNumber, code: otp });

    return verification.status === 'approved';
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

export async function getTwilioClient() {
  const client = await getClient();
  if (!client) return null;
  return { client, phoneNumber: process.env.TWILIO_PHONE_NUMBER || '' };
}
