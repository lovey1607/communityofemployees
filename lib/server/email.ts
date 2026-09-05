// ============================================================
// lib/server/email.ts — Transactional email.
//
// With SMTP configured, mail is sent via nodemailer. Without it (local dev),
// messages are logged to the server console so verification links are still
// usable. Nothing here ever writes a secret to the log.
// ============================================================

import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.smtp.enabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail(message: MailMessage): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.info(
      `\n──── [dev email] ────\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n─────────────────────\n`
    );
    return;
  }
  try {
    await t.sendMail({ from: env.smtp.from, ...message });
  } catch (error) {
    // Email failure must not roll back the user-facing action (signup, award).
    console.error('[email] send failed', { to: message.to, subject: message.subject, error });
  }
}

const shell = (title: string, body: string) => `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#0b0d12;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#151922;border:1px solid #232a38;border-radius:14px;padding:28px;color:#e6e9f0">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;color:#f97316;text-transform:uppercase">Community of Employees</p>
    <h1 style="margin:0 0 16px;font-size:20px;color:#fff">${title}</h1>
    ${body}
    <p style="margin:26px 0 0;font-size:12px;color:#7c869c">Currently live in Gurgaon. If you weren't expecting this email you can ignore it.</p>
  </div>
</div>`;

const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${href}" style="display:inline-block;background:#f97316;color:#0b0d12;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:9px">${label}</a></p>
   <p style="margin:0;font-size:12px;color:#7c869c;word-break:break-all">Or paste this into your browser: ${href}</p>`;

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${env.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail({
    to,
    subject: 'Confirm your COE email address',
    text: `Confirm your email address to finish signing up for Community of Employees:\n\n${link}\n\nThe link expires in 24 hours. After confirming, an admin reviews your account before it goes live.`,
    html: shell(
      'Confirm your email address',
      `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8">One click and your signup is done. After this, an admin reviews your account before it goes live — usually the same working day.</p>${button(link, 'Confirm email')}<p style="margin:14px 0 0;font-size:12px;color:#7c869c">This link expires in 24 hours.</p>`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to,
    subject: 'Reset your COE password',
    text: `Reset your Community of Employees password:\n\n${link}\n\nThe link expires in 1 hour. If you didn't ask for this, ignore this email — nothing changes.`,
    html: shell(
      'Reset your password',
      `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8">Set a new password for your account.</p>${button(link, 'Reset password')}<p style="margin:14px 0 0;font-size:12px;color:#7c869c">This link expires in 1 hour. If you didn't ask for this, ignore this email — nothing changes.</p>`
    ),
  });
}

export async function sendApprovalEmail(to: string, approved: boolean, reason?: string): Promise<void> {
  if (approved) {
    await sendMail({
      to,
      subject: 'Your COE account is approved',
      text: `You're in. Sign in at ${env.appUrl} and start posting requirements.`,
      html: shell(
        "You're in",
        `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8">Your account has been approved.</p>${button(env.appUrl, 'Sign in')}`
      ),
    });
    return;
  }
  await sendMail({
    to,
    subject: 'About your COE registration',
    text: `We couldn't approve this registration.${reason ? `\n\nReason: ${reason}` : ''}\n\nReply to this email if you think that's a mistake.`,
    html: shell(
      'About your registration',
      `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8">We couldn't approve this registration.${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ''}<br><br>Reply to this email if you think that's a mistake.</p>`
    ),
  });
}

export async function sendBidAwardedEmail(
  to: string,
  args: { rfpTitle: string; amount: number; counterpart: string; won: boolean }
): Promise<void> {
  const money = `₹${args.amount.toLocaleString('en-IN')}`;
  if (args.won) {
    await sendMail({
      to,
      subject: `You won the bid — ${args.rfpTitle}`,
      text: `${args.counterpart} awarded you "${args.rfpTitle}" at ${money}. Open the portal to see the details and coordinate.\n\n${env.appUrl}/vendor/dashboard`,
      html: shell(
        'You won the bid',
        `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8"><strong>${args.counterpart}</strong> awarded you <strong>${args.rfpTitle}</strong> at <strong>${money}</strong>.</p>${button(`${env.appUrl}/vendor/dashboard`, 'Open dashboard')}`
      ),
    });
    return;
  }
  await sendMail({
    to,
    subject: `Bid awarded — ${args.rfpTitle}`,
    text: `You awarded "${args.rfpTitle}" to ${args.counterpart} at ${money}. They've been notified.\n\n${env.appUrl}/corporate/dashboard`,
    html: shell(
      'Bid awarded',
      `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8">You awarded <strong>${args.rfpTitle}</strong> to <strong>${args.counterpart}</strong> at <strong>${money}</strong>. They've been notified.</p>${button(`${env.appUrl}/corporate/dashboard`, 'Open dashboard')}`
    ),
  });
}

export async function sendNewRfpDigestEmail(to: string, rfpTitle: string): Promise<void> {
  await sendMail({
    to,
    subject: `New requirement in your category — ${rfpTitle}`,
    text: `A new requirement matching your category and service area is open for bids: ${rfpTitle}\n\n${env.appUrl}/vendor/dashboard`,
    html: shell(
      'New requirement open for bids',
      `<p style="margin:0;font-size:14px;line-height:1.6;color:#c3cad8">${rfpTitle}</p>${button(`${env.appUrl}/vendor/dashboard`, 'Place a bid')}`
    ),
  });
}
