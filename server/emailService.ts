// Store OTPs in memory: { email: { otp, expiresAt } }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string, playerName: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kanche King <otp@kancheking.com>",
        to: [email],
        subject: "Kanche King — Your Redemption OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a0a2e; color: #fff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #a855f7; text-align: center;">🎮 Kanche King</h2>
            <p>Hi <strong>${playerName}</strong>,</p>
            <p>Your OTP for point redemption is:</p>
            <div style="background: #2d1b69; border: 2px solid #a855f7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #f0abfc; font-size: 40px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #aaa;">This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="color: #aaa;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[sendOTPEmail] Resend API error:", response.status, errorBody);
      return false;
    }

    // Save OTP with 10 min expiry
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    return true;
  } catch (err) {
    console.error("[sendOTPEmail] Error:", err);
    return false;
  }
}

export function verifyOTP(email: string, otp: string): boolean {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  if (entry.otp !== otp) return false;
  otpStore.delete(email); // One-time use
  return true;
}