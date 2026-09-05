// ============================================================
// lib/server/env.ts — Server-only environment access.
// Never import this from a client component.
// ============================================================

import 'server-only';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example for the full list.`
    );
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return required('DATABASE_URL');
  },
  /** Used to HMAC session and one-time tokens before they are stored. */
  get authSecret() {
    const secret = required('AUTH_SECRET');
    if (secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -hex 32');
    }
    return secret;
  },
  get appUrl() {
    return process.env.APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
  smtp: {
    get host() {
      return process.env.SMTP_HOST ?? '';
    },
    get port() {
      return Number(process.env.SMTP_PORT ?? 587);
    },
    get user() {
      return process.env.SMTP_USER ?? '';
    },
    get pass() {
      return process.env.SMTP_PASSWORD ?? '';
    },
    get from() {
      return process.env.SMTP_FROM ?? 'COE Portal <no-reply@communityofemployees.com>';
    },
    get enabled() {
      return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    },
  },
  /** Comma-separated list of admin emails allowed to self-serve an admin signup token. */
  get bootstrapAdminEmail() {
    return process.env.BOOTSTRAP_ADMIN_EMAIL ?? '';
  },
  get bootstrapAdminPassword() {
    return process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';
  },
};
