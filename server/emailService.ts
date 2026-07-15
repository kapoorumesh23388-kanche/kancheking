// Store OTPs in memory: { email: { otp, expiresAt } }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendLoginOTPEmail(email: string, otp: string): Promise<boolean> {
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
        subject: "Kanche King — Your Login OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a0a2e; color: #fff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #a855f7; text-align: center;">🎮 Kanche King</h2>
            <p>Your login OTP is:</p>
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
      console.error("[sendLoginOTPEmail] Resend API error:", response.status, errorBody);
      return false;
    }

    // Save OTP with 10 min expiry
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    return true;
  } catch (err) {
    console.error("[sendLoginOTPEmail] Error:", err);
    return false;
  }
}

export function verifyLoginOTP(email: string, otp: string): boolean {
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

// --- Redeem OTP (separate store from login OTP) ---
const redeemOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function sendRedeemOTPEmail(email: string, otp: string): Promise<boolean> {
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
        subject: "Kanche King — Confirm Your Redemption",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a0a2e; color: #fff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #a855f7; text-align: center;">🎮 Kanche King</h2>
            <p>Your OTP to confirm this points redemption is:</p>
            <div style="background: #2d1b69; border: 2px solid #a855f7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #f0abfc; font-size: 40px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #aaa;">This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="color: #aaa;">If you did not request this redemption, please ignore this email.</p>
          </div>
        `,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[sendRedeemOTPEmail] Resend API error:", response.status, errorBody);
      return false;
    }
    redeemOtpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    return true;
  } catch (err) {
    console.error("[sendRedeemOTPEmail] Error:", err);
    return false;
  }
}

export function verifyRedeemOTP(email: string, otp: string): boolean {
  const entry = redeemOtpStore.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    redeemOtpStore.delete(email);
    return false;
  }
  if (entry.otp !== otp) return false;
  redeemOtpStore.delete(email); // One-time use
  return true;
}

// Sends a notification email to the admin/owner inbox. Used for things
// like new feedback/support submissions and point redemptions. Fire this
// off without blocking the main request — a failed notification email
// should never stop the actual feedback/redemption from succeeding.
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "kancheking.kalijhota@gmail.com";

export async function sendAdminNotificationEmail(subject: string, htmlBody: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kanche King <notify@kancheking.com>",
        to: [ADMIN_EMAIL],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0a2e; color: #fff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #a855f7;">🎮 Kanche King — Admin Notification</h2>
            ${htmlBody}
          </div>
        `,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[sendAdminNotificationEmail] Resend API error:", response.status, errorBody);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sendAdminNotificationEmail] Error:", err);
    return false;
  }
}
