// POST /api/auth/login — password login with rate limiting and lockout.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { corporateProfiles, users, vendorProfiles } from '@/lib/db/schema';
import { burnPasswordTime, verifyPassword } from '@/lib/server/crypto';
import { createSession, setSessionCookie } from '@/lib/server/session';
import { recordAudit } from '@/lib/server/audit';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import {
  HttpError,
  assertSameOrigin,
  clientIp,
  jsonOk,
  parseJson,
  route,
} from '@/lib/server/http';
import { loginSchema } from '@/lib/validation';
import {
  serializeCorporateProfile,
  serializeUser,
  serializeVendorProfile,
} from '@/lib/server/serialize';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 15; // 15 minutes

const invalidCredentials = () =>
  new HttpError(401, 'Email or password is incorrect.', 'invalid_credentials');

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const ip = clientIp(request);
  const body = await parseJson(request, loginSchema);

  // Two limiters: one per IP (blocks a spray from one host) and one per
  // account (blocks a distributed guess at one inbox).
  await enforceRateLimit(RATE_LIMITS.login, `ip:${ip}`);
  await enforceRateLimit(RATE_LIMITS.login, `email:${body.email}`);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.emailNormalized, body.email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    await burnPasswordTime(body.password); // keep response timing flat
    throw invalidCredentials();
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new HttpError(
      423,
      `Too many failed attempts. This account is locked for another ${minutes} minute(s).`,
      'account_locked'
    );
  }

  const passwordOk = await verifyPassword(body.password, user.passwordHash);
  if (!passwordOk) {
    const failed = user.failedLoginCount + 1;
    const lock = failed >= MAX_FAILED_ATTEMPTS;
    await db
      .update(users)
      .set({
        failedLoginCount: lock ? 0 : failed,
        lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MS) : user.lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    await recordAudit(null, {
      action: 'auth.login.failed',
      entityType: 'user',
      entityId: user.id,
      metadata: { attempt: failed, lockedOut: lock },
      ip,
    });
    if (lock) {
      throw new HttpError(
        423,
        'Too many failed attempts. This account is locked for 15 minutes.',
        'account_locked'
      );
    }
    throw invalidCredentials();
  }

  // Password is right — everything below is an *authorization* answer, so it is
  // safe (and more useful) to be specific.
  if (user.isSuspended) {
    throw new HttpError(403, 'This account has been suspended.', 'suspended');
  }
  if (!user.emailVerifiedAt) {
    throw new HttpError(
      403,
      'Confirm your email address first — check your inbox for the link.',
      'email_unverified'
    );
  }
  if (user.approvalStatus === 'rejected') {
    throw new HttpError(403, 'This registration was not approved.', 'rejected');
  }
  if (user.approvalStatus !== 'approved') {
    throw new HttpError(
      403,
      "You're verified — an admin still needs to approve this account. We'll email you.",
      'pending_approval'
    );
  }

  await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  const { token, expiresAt } = await createSession(user.id, {
    userAgent: request.headers.get('user-agent'),
    ip,
  });
  await setSessionCookie(token, expiresAt);
  await recordAudit({ user, sessionId: '' }, {
    action: 'auth.login',
    entityType: 'user',
    entityId: user.id,
    ip,
  });

  const [corporate] =
    user.role === 'corporate'
      ? await db.select().from(corporateProfiles).where(eq(corporateProfiles.userId, user.id)).limit(1)
      : [];
  const [vendor] =
    user.role === 'vendor'
      ? await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, user.id)).limit(1)
      : [];

  return jsonOk({
    user: serializeUser(user),
    corporateProfile: corporate ? serializeCorporateProfile(corporate, user) : null,
    vendorProfile: vendor ? serializeVendorProfile(vendor, user) : null,
  });
});
