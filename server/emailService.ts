import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Store OTPs in memory: { key: { otp, expiresAt, type } }
const otpStore = new Map<string, { otp: string; expiresAt: number; type: string }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Redemption OTP (existing) ───────────────────────────────────────────────
export async function sendOTPEmail(email: string, otp: string, playerName: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Kanche King" <${process.env.GMAIL_USER}>`,
      to: email,
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
    });
    otpStore.set(`redemption:${email}`, { otp, expiresAt: Date.now() + 10 * 60 * 1000, type: "redemption" });
    return true;
  } catch (err) {
    console.error("[sendOTPEmail] Error:", err);
    return false;
  }
}

export function verifyOTP(email: string, otp: string): boolean {
  const entry = otpStore.get(`redemption:${email}`);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { otpStore.delete(`redemption:${email}`); return false; }
  if (entry.otp !== otp) return false;
  otpStore.delete(`redemption:${email}`);
  return true;
}

// ─── Login/Register OTP via Email ─────────────────────────────────────────────
export async function sendLoginOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Kanche King" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Kanche King — Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a0a2e; color: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #a855f7; text-align: center;">🎮 Kanche King</h2>
          <p>Your login OTP is:</p>
          <div style="background: #2d1b69; border: 2px solid #a855f7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #f0abfc; font-size: 40px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #aaa;">Valid for <strong>10 minutes</strong>. Do not share this OTP.</p>
        </div>
      `,
    });
    otpStore.set(`login:${email}`, { otp, expiresAt: Date.now() + 10 * 60 * 1000, type: "login" });
    return true;
  } catch (err) {
    console.error("[sendLoginOTPEmail] Error:", err);
    return false;
  }
}

export function verifyLoginOTP(email: string, otp: string): boolean {
  const key = `login:${email}`;
  const entry = otpStore.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { otpStore.delete(key); return false; }
  if (entry.otp !== otp) return false;
  otpStore.delete(key);
  return true;
}
