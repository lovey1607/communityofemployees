// ============================================================
// lib/server/ratelimit.ts — Fixed-window rate limiting backed by Postgres.
//
// Deliberately not an in-memory map: on Vercel each invocation may be a fresh
// process, so an in-memory limiter enforces nothing. One UPSERT per check.
// ============================================================

import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tooManyRequests } from './http';

export interface RateLimitRule {
  /** Logical name, e.g. 'login' or 'signup'. */
  name: string;
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  login: { name: 'login', limit: 10, windowSeconds: 300 },
  signup: { name: 'signup', limit: 5, windowSeconds: 3600 },
  passwordReset: { name: 'password-reset', limit: 5, windowSeconds: 3600 },
  emailResend: { name: 'email-resend', limit: 5, windowSeconds: 3600 },
  rfpCreate: { name: 'rfp-create', limit: 20, windowSeconds: 3600 },
  bidCreate: { name: 'bid-create', limit: 60, windowSeconds: 3600 },
  review: { name: 'review', limit: 20, windowSeconds: 3600 },
  publicRead: { name: 'public-read', limit: 300, windowSeconds: 300 },
} as const satisfies Record<string, RateLimitRule>;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit(
  rule: RateLimitRule,
  identifier: string
): Promise<RateLimitResult> {
  const bucket = `${rule.name}:${identifier}`;
  const windowMs = rule.windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const rows = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limits (bucket, window_start, count)
    VALUES (${bucket}, ${windowStart.toISOString()}, 1)
    ON CONFLICT (bucket) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start < ${windowStart.toISOString()}::timestamptz THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start < ${windowStart.toISOString()}::timestamptz THEN ${windowStart.toISOString()}::timestamptz
        ELSE rate_limits.window_start
      END
    RETURNING count
  `);

  const count = Number(rows.rows[0]?.count ?? 1);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart.getTime() + windowMs - Date.now()) / 1000)
  );
  return {
    allowed: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfterSeconds,
  };
}

/** Throws a 429 when the caller is over the limit. */
export async function enforceRateLimit(rule: RateLimitRule, identifier: string): Promise<void> {
  const result = await checkRateLimit(rule, identifier);
  if (!result.allowed) {
    throw tooManyRequests(
      `Too many requests. Try again in ${result.retryAfterSeconds} seconds.`,
      result.retryAfterSeconds
    );
  }
}

/** Housekeeping: delete counters whose window closed over a day ago. */
export async function purgeStaleRateLimits(): Promise<void> {
  await db.execute(sql`DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 day'`);
}
