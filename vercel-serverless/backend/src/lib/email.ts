import nodemailer from 'nodemailer';

// In-memory OTP store: email -> { otp, expiresAt, purpose }
// Purpose: 'register' | 'reset'
interface OtpEntry {
  otp: string;
  expiresAt: number;
  purpose: 'register' | 'reset';
}

const otpStore = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export function storeOtp(email: string, purpose: 'register' | 'reset'): string {
  const otp = generateOtp();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    purpose,
  });
  return otp;
}

export function verifyOtp(email: string, otp: string, purpose: 'register' | 'reset'): boolean {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;
  if (entry.purpose !== purpose) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (entry.otp !== otp) return false;
  otpStore.delete(email.toLowerCase()); // consume OTP
  return true;
}

export function hasValidOtp(email: string, purpose: 'register' | 'reset'): boolean {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;
  if (entry.purpose !== purpose) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  return true;
}

export async function sendOtpEmail(email: string, otp: string, purpose: 'register' | 'reset'): Promise<void> {
  const transporter = createTransporter();

  const isRegister = purpose === 'register';
  const subject = isRegister ? 'Verify your Cantio account' : 'Reset your Cantio password';
  const action = isRegister ? 'complete your registration' : 'reset your password';

  await transporter.sendMail({
    from: `"Cantio" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.08);">
            <h1 style="margin: 0 0 8px; font-size: 28px; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Cantio</h1>
            <p style="color: #9ca3af; margin: 0 0 32px; font-size: 14px;">Your music, everywhere.</p>

            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 24px;">Use the code below to ${action}:</p>

            <div style="background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
              <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #a855f7;">${otp}</span>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin: 0;">This code expires in <strong style="color: #9ca3af;">10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  });
}
