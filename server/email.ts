import nodemailer from 'nodemailer';
import dns from 'dns';

// Ensure IPv4 is prioritized in cloud container hosts like Render
if (typeof (dns as any).setDefaultResultOrder === 'function') {
  (dns as any).setDefaultResultOrder('ipv4first');
}

interface SendResetEmailParams {
  to: string;
  adminName: string;
  resetUrl: string;
  approvalCode: string;
}

// Built-in verified Gmail SMTP credentials (used as defaults if Render/Host environment variables are not set)
const DEFAULT_SMTP_USER = 'ramyaselva048@gmail.com';
const DEFAULT_SMTP_PASS = 'ngthpsdryoytezsj';
const DEFAULT_SMTP_HOST = 'smtp.gmail.com';

export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER || DEFAULT_SMTP_USER;
  const pass = process.env.SMTP_PASS || DEFAULT_SMTP_PASS;
  return Boolean(user && pass);
}

export async function sendPasswordResetEmail({
  to,
  adminName,
  resetUrl,
  approvalCode
}: SendResetEmailParams): Promise<{ sent: boolean; message: string; configured: boolean }> {
  const host = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || DEFAULT_SMTP_USER;
  const pass = process.env.SMTP_PASS || DEFAULT_SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'ramyaselva048@gmail.com';

  if (!isSmtpConfigured()) {
    console.log(`[Email Service] SMTP not configured. Password Reset Request dispatched for ${to}:`);
    console.log(`[Email Service] Target: ${to}`);
    console.log(`[Email Service] Approval Code: ${approvalCode}`);
    console.log(`[Email Service] Reset URL: ${resetUrl}`);
    return {
      sent: true,
      configured: false,
      message: `Password reset request registered for ${to}. Approval link and verification code generated.`
    };
  }

  try {
    const cleanPass = (pass || '').replace(/\s+/g, '');
    const isGmail = (host || '').toLowerCase().includes('gmail') || (user || '').toLowerCase().includes('gmail');

    // In Render, AWS, GCP containers, IPv6 outbound routing is not available.
    // Node.js by default resolves IPv6 first, causing "connect ENETUNREACH 2404:6800:...:465".
    // Using family: 4 and port 587 with STARTTLS guarantees delivery on Render and all cloud hosts.
    const transporter = nodemailer.createTransport({
      host: isGmail ? 'smtp.gmail.com' : host,
      port: isGmail ? 587 : port,
      secure: false, // Port 587 uses STARTTLS
      requireTLS: true,
      family: 4, // Strict IPv4 to eliminate ENETUNREACH errors on cloud container platforms
      auth: {
        user,
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    } as any);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800;">Apex College of Engineering</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Clearance & No Due Portal — Security Alert</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">Hello <strong>${adminName}</strong>,</p>

        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px; color: #334155;">
          A password reset request was initiated for your Administrator account (<strong>${to}</strong>).
        </p>

        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin: 0 0 8px 0;">
            Verification Approval Code
          </p>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #4f46e5; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
            ${approvalCode}
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">
            Expires in 30 minutes. You must accept the request to set a new password.
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px; color: #334155;">
          To complete your reset, please click the secure approval link below:
        </p>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Accept Request & Reset Password &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you did not request this password reset, please disregard this email. Your administrator password will remain secure and unchanged until explicitly approved.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Apex College Portal" <${from}>`,
      to,
      subject: `Password Reset Code: ${approvalCode} — Apex College Portal`,
      text: `Hello ${adminName},\n\nA password reset request was initiated for your Administrator account (${to}).\n\nYour 6-digit approval code is: ${approvalCode}\n\nPlease click the following link to accept the request and reset your password:\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you did not make this request, please ignore this email.`,
      html
    });

    return { sent: true, configured: true, message: `Password reset email successfully sent to ${to}` };
  } catch (err: any) {
    console.error('[Email Service] Failed to send email via SMTP:', err);
    return { sent: false, configured: true, message: err.message || 'Failed to dispatch email' };
  }
}
