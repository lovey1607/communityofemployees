// ============================================================
// lib/emailDomains.ts — Work-email policy for corporate signups.
//
// Shared by client and server. The server is the enforcement point; the
// client imports it only to give immediate feedback in the signup form.
//
// The rule is "not a free consumer mailbox", not "on an allow-list": a
// company on Google Workspace or Microsoft 365 uses its own domain
// (@acme.in), which passes. Only the providers' own consumer domains are
// blocked. Admins can add domain overrides at runtime (email_domain_rules).
// ============================================================

export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft consumer
  'outlook.com', 'outlook.in', 'hotmail.com', 'hotmail.co.uk', 'hotmail.co.in',
  'live.com', 'live.in', 'live.co.uk', 'msn.com', 'passport.com',
  // Yahoo
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com',
  // Indian consumer ISPs / portals
  'rediffmail.com', 'rediff.com', 'indiatimes.com', 'sify.com', 'in.com',
  'bsnl.in', 'airtelmail.in', 'vsnl.net', 'vsnl.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Privacy / other free providers
  'proton.me', 'protonmail.com', 'pm.me', 'tutanota.com', 'tuta.io',
  'zoho.com', 'zohomail.com', 'gmx.com', 'gmx.net', 'mail.com', 'aol.com',
  'yandex.com', 'yandex.ru', 'fastmail.com', 'hushmail.com', 'inbox.com',
  'mail.ru', 'qq.com', '163.com', '126.com', 'naver.com',
]);

/** Throwaway / disposable inbox providers — never acceptable for a work account. */
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'sharklasers.com',
  '10minutemail.com', 'temp-mail.org', 'tempmail.com', 'throwawaymail.com',
  'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'fakeinbox.com', 'mintemail.com', 'moakt.com', 'emailondeck.com',
]);

export type EmailPolicyReason =
  | 'ok'
  | 'malformed'
  | 'free_provider'
  | 'disposable'
  | 'blocked_domain';

export interface EmailPolicyResult {
  ok: boolean;
  reason: EmailPolicyReason;
  domain: string;
  message?: string;
}

// Deliberately conservative: one @, no spaces, a dotted domain with a 2+ char TLD.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailDomain(email: string): string {
  return normalizeEmail(email).split('@')[1] ?? '';
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= 254 && EMAIL_RE.test(normalized);
}

/**
 * @param overrides admin-managed rules, e.g. { 'gmail.com': 'allow' } to let a
 *                  specific domain through, or { 'acme.in': 'block' }.
 */
export function checkWorkEmail(
  email: string,
  overrides: Record<string, 'allow' | 'block'> = {}
): EmailPolicyResult {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, reason: 'malformed', domain: '', message: "That doesn't look like a valid email address." };
  }

  const domain = emailDomain(normalized);
  const override = overrides[domain];
  if (override === 'allow') return { ok: true, reason: 'ok', domain };
  if (override === 'block') {
    return { ok: false, reason: 'blocked_domain', domain, message: 'This email domain is not accepted.' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: 'disposable',
      domain,
      message: 'Disposable inboxes are not accepted. Please use your work email.',
    };
  }
  if (FREE_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: 'free_provider',
      domain,
      message: 'Please sign up with your work email (yourname@yourcompany.com), not a personal one.',
    };
  }
  return { ok: true, reason: 'ok', domain };
}
