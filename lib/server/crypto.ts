// ============================================================
// lib/server/crypto.ts — Password hashing and opaque token handling.
// ============================================================

import 'server-only';
import bcrypt from 'bcryptjs';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from './env';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Constant-ish work even when the account does not exist, so that response
 * timing does not leak whether an email is registered.
 */
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.7Vd0Kx6Z0m0Z0m0Z0m0Z0m0Z0m0Z0m0';
export async function burnPasswordTime(plain: string): Promise<void> {
  try {
    await bcrypt.compare(plain, DUMMY_HASH);
  } catch {
    /* ignore */
  }
}

/** A high-entropy opaque token handed to the client. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Tokens are stored as a keyed HMAC, never in plaintext: a database dump alone
 * cannot be replayed as a session cookie or a password-reset link.
 */
export function hashToken(token: string): string {
  return createHmac('sha256', env.authSecret).update(token).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}
