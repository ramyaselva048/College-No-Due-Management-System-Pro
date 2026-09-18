import nodemailer from 'nodemailer';
import dns from 'dns';

// Ensure IPv4 is prioritized in cloud container hosts like Render
if (typeof (dns as any).setDefaultResultOrder === 'function') {
  (dns as any).setDefaultResultOrder('ipv4first');
}

// Custom DNS lookup that strictly forces IPv4 resolution
// This is critical on Render, Docker, and cloud hosts where IPv6 outbound routing is disabled,
// preventing "connect ENETUNREACH 2404:6800:..." errors.
function forceIpv4Lookup(hostname: string, options: any, callback: any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const opts = Object.assign({}, options, { family: 4, all: false });
  return dns.lookup(hostname, opts, callback);
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
  if (process.env.GOOGLE_SCRIPT_URL || process.env.EMAIL_WEBHOOK_URL || process.env.RESEND_API_KEY || process.env.BREVO_API_KEY) {
    return true;
  }
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
          Expires in 30 minutes. You must enter this code or click the button below to set a new password.
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

  const text = `Hello ${adminName},\n\nA password reset request was initiated for your Administrator account (${to}).\n\nYour 6-digit approval code is: ${approvalCode}\n\nPlease click the following link to accept the request and reset your password:\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you did not make this request, please ignore this email.`;

  // 1. Check for Google Apps Script Web App or HTTPS Webhook (runs on port 443, never blocked by Render)
  const webhookUrl = process.env.GOOGLE_SCRIPT_URL || process.env.EMAIL_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      console.log(`[Email Service] Sending email via HTTPS Webhook / Google Apps Script: ${webhookUrl}`);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: `Password Reset Code: ${approvalCode} — Apex College Portal`,
          text,
          html
        })
      });
      if (res.ok) {
        return { sent: true, configured: true, message: `Password reset email dispatched to ${to} via Google Service.` };
      }
    } catch (e: any) {
      console.warn('[Email Service] HTTPS Webhook dispatch failed, falling back to SMTP:', e.message);
    }
  }

  // 2. Check for Resend API Key (HTTPS port 443)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('[Email Service] Sending email via Resend HTTPS API');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Apex College <onboarding@resend.dev>',
          to: [to],
          subject: `Password Reset Code: ${approvalCode} — Apex College Portal`,
          html,
          text
        })
      });
      if (res.ok) {
        return { sent: true, configured: true, message: `Password reset email successfully sent to ${to} via Resend.` };
      }
    } catch (e: any) {
      console.warn('[Email Service] Resend dispatch failed, falling back to SMTP:', e.message);
    }
  }

  // 3. Check for Brevo API Key (HTTPS port 443)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log('[Email Service] Sending email via Brevo HTTPS API');
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Apex College Portal', email: from },
          to: [{ email: to }],
          subject: `Password Reset Code: ${approvalCode} — Apex College Portal`,
          htmlContent: html,
          textContent: text
        })
      });
      if (res.ok) {
        return { sent: true, configured: true, message: `Password reset email successfully sent to ${to} via Brevo.` };
      }
    } catch (e: any) {
      console.warn('[Email Service] Brevo dispatch failed, falling back to SMTP:', e.message);
    }
  }

  // 4. Standard SMTP with strict IPv4 lookup (works locally, Koyeb, Railway, Render Paid, or anywhere IPv4 is available)
  try {
    const cleanPass = (pass || '').replace(/\s+/g, '');
    const isGmail = (host || '').toLowerCase().includes('gmail') || (user || '').toLowerCase().includes('gmail');

    const transporter = nodemailer.createTransport({
      host: isGmail ? 'smtp.gmail.com' : host,
      port: isGmail ? 587 : port,
      secure: false, // Port 587 uses STARTTLS
      requireTLS: true,
      lookup: forceIpv4Lookup, // CRITICAL: forces strictly IPv4 (prevents ENETUNREACH 2404:... on Render/cloud containers)
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

    await transporter.sendMail({
      from: `"Apex College Portal" <${from}>`,
      to,
      subject: `Password Reset Code: ${approvalCode} — Apex College Portal`,
      text,
      html
    });

    return { sent: true, configured: true, message: `Password reset email successfully sent to ${to}` };
  } catch (err: any) {
    console.error('[Email Service] Failed to send email via SMTP:', err);
    return { sent: false, configured: true, message: err.message || 'Failed to dispatch email' };
  }
}

