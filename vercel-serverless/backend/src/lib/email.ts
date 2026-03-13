import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

// ─── Typed email error ────────────────────────────────────────────────────────
export type EmailErrorCode =
  | 'RATE_LIMITED'      // per-email cooldown (resend too soon)
  | 'QUOTA_EXCEEDED'    // Gmail daily send limit hit
  | 'AUTH_FAILED'       // wrong Gmail credentials
  | 'INVALID_RECIPIENT' // bad/non-existent address
  | 'NETWORK_ERROR'     // SMTP unreachable
  | 'UNKNOWN';

export class EmailError extends Error {
  constructor(
    message: string,
    public readonly code: EmailErrorCode,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

// ─── OTP store ───────────────────────────────────────────────────────────────
interface OtpEntry {
  otp: string;
  expiresAt: number;
  sentAt: number;      // when the OTP was last sent (for per-email cooldown)
  purpose: 'register' | 'reset';
}

const otpStore = new Map<string, OtpEntry>();

const OTP_TTL_MS       = 10 * 60 * 1000; // 10 min validity
const RESEND_COOLDOWN  = 60;             // seconds before another OTP is allowed

// ─── Global daily quota guard ────────────────────────────────────────────────
// Gmail free: ~500 emails/day; Workspace: ~2000. We cap at 480 to stay safe.
const DAILY_QUOTA = 480;
let dailySentCount  = 0;
let quotaResetAt    = Date.now() + 24 * 60 * 60 * 1000;

function checkAndIncrementQuota(): void {
  if (Date.now() > quotaResetAt) {
    dailySentCount = 0;
    quotaResetAt   = Date.now() + 24 * 60 * 60 * 1000;
  }
  if (dailySentCount >= DAILY_QUOTA) {
    const secsUntilReset = Math.ceil((quotaResetAt - Date.now()) / 1000);
    throw new EmailError(
      'Email service daily limit reached. Please try again tomorrow.',
      'QUOTA_EXCEEDED',
      secsUntilReset,
    );
  }
  dailySentCount++;
}

function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
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

// Classify raw nodemailer / SMTP errors into our typed codes
function classifySmtpError(err: any): EmailError {
  const response: string = (err.response || err.message || '').toLowerCase();
  const code: number     = err.responseCode || 0;

  // Gmail daily quota
  if (response.includes('daily user sending limit') || response.includes('quota exceeded') || code === 550 && response.includes('limit')) {
    return new EmailError('Email service daily limit reached. Please try again later.', 'QUOTA_EXCEEDED');
  }
  // Too many connections / transient rate limit
  if (code === 421 || response.includes('too many') || response.includes('rate limit')) {
    return new EmailError('Email service is busy. Please wait a moment and try again.', 'RATE_LIMITED', 30);
  }
  // Auth failure
  if (code === 535 || response.includes('invalid credentials') || response.includes('username and password') || response.includes('5.7.8')) {
    return new EmailError('Email service configuration error. Please contact support.', 'AUTH_FAILED');
  }
  // Invalid recipient
  if (code === 550 || response.includes('no such user') || response.includes('user unknown') || response.includes('5.1.1')) {
    return new EmailError('The email address appears to be invalid or non-existent.', 'INVALID_RECIPIENT');
  }
  // Network / connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === 'ESOCKET') {
    return new EmailError('Could not connect to email service. Please try again shortly.', 'NETWORK_ERROR');
  }

  return new EmailError('Failed to send email. Please try again.', 'UNKNOWN');
}

export function checkResendCooldown(email: string): void {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return;
  const elapsed = Math.floor((Date.now() - entry.sentAt) / 1000);
  if (elapsed < RESEND_COOLDOWN) {
    throw new EmailError(
      `Please wait ${RESEND_COOLDOWN - elapsed} seconds before requesting another code.`,
      'RATE_LIMITED',
      RESEND_COOLDOWN - elapsed,
    );
  }
}

export function storeOtp(email: string, purpose: 'register' | 'reset'): string {
  const now = Date.now();
  const otp = generateOtp();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: now + OTP_TTL_MS,
    sentAt: now,
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
  // Check daily quota before even opening a connection
  checkAndIncrementQuota();

  const transporter = createTransporter();

  const isRegister = purpose === 'register';
  const subject = isRegister ? 'Verify your Cantio account' : 'Reset your Cantio password';
  const action = isRegister ? 'complete your registration' : 'reset your password';

  // Split OTP into individual digit spans to prevent wrapping
  const otpDigits = otp.split('').map(d =>
    `<span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;background:rgba(168,85,247,0.15);border:1.5px solid rgba(168,85,247,0.4);border-radius:10px;font-size:28px;font-weight:700;color:#c084fc;margin:0 4px;">${d}</span>`
  ).join('');

  await transporter.sendMail({
    from: `"Cantio" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
            <tr><td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111827;border-radius:20px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

                <!-- Header bar -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 36px;">
                    <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🎵 Cantio</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">Your music, everywhere.</div>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 36px 28px;">
                    <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f9fafb;">
                      ${isRegister ? 'Verify your email' : 'Reset your password'}
                    </p>
                    <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6;">
                      Use the one-time code below to ${action}. It expires in <strong style="color:#e5e7eb;">10 minutes</strong>.
                    </p>

                    <!-- OTP digits -->
                    <div style="text-align:center;margin:0 0 28px;">
                      ${otpDigits}
                    </div>

                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 20px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                        🔒 If you didn't request this, you can safely ignore this email. Your account remains secure.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">
                      © ${new Date().getFullYear()} Cantio &nbsp;·&nbsp; This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  }).catch((err: any) => {
    // Undo the quota increment — the mail was never delivered
    dailySentCount = Math.max(0, dailySentCount - 1);
    throw classifySmtpError(err);
  });
}
