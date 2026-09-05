// ============================================================
// lib/server/session.ts — Server-side sessions.
//
// The cookie carries an opaque random token; the database stores only its
// HMAC. Every request looks the session up, which means logout, admin
// suspension and password changes take effect immediately and server-side —
// unlike a stateless JWT that stays valid until it expires.
// ============================================================

import 'server-only';
import { cookies } from 'next/headers';
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions, users, type UserRow } from '@/lib/db/schema';
import { generateToken, hashToken, newId } from './crypto';
import { env } from './env';

export const SESSION_COOKIE = 'coe_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SESSION_IDLE_REFRESH_MS = 1000 * 60 * 60; // refresh last_seen at most hourly

export interface SessionContext {
  user: UserRow;
  sessionId: string;
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {}
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    id: newId('sess'),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: meta.userAgent?.slice(0, 400) ?? null,
    ip: meta.ip ?? null,
  });
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    path: '/',
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    path: '/',
    maxAge: 0,
  });
}

/** Resolve the caller from the session cookie. Returns null when unauthenticated. */
export async function getSessionContext(): Promise<SessionContext | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const { session, user } = row;
  const now = Date.now();

  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= now) return null;
  if (user.deletedAt) return null;
  // A password change invalidates every session issued before it.
  if (user.passwordChangedAt && user.passwordChangedAt.getTime() > session.createdAt.getTime()) {
    return null;
  }

  if (now - session.lastSeenAt.getTime() > SESSION_IDLE_REFRESH_MS) {
    await db
      .update(sessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(sessions.id, session.id));
  }

  return { user, sessionId: session.id };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

/** Housekeeping: drop rows that can never authenticate again. */
export async function purgeExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(or(lt(sessions.expiresAt, new Date()), sql`${sessions.revokedAt} IS NOT NULL`));
  return result.rowCount ?? 0;
}
