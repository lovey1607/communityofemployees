// POST /api/auth/forgot-password — issues a reset link. The response is
// identical whether or not the address is registered.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { authTokens, users } from '@/lib/db/schema';
import { generateToken, hashToken, newId } from '@/lib/server/crypto';
import { sendPasswordResetEmail } from '@/lib/server/email';
import { recordAudit } from '@/lib/server/audit';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import { assertSameOrigin, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { forgotPasswordSchema } from '@/lib/validation';

const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const ip = clientIp(request);
  const { email } = await parseJson(request, forgotPasswordSchema);
  await enforceRateLimit(RATE_LIMITS.passwordReset, `ip:${ip}`);
  await enforceRateLimit(RATE_LIMITS.passwordReset, `email:${email}`);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.emailNormalized, email), isNull(users.deletedAt)))
    .limit(1);

  if (user && !user.isSuspended) {
    const token = generateToken(32);
    await db.insert(authTokens).values({
      id: newId('tok'),
      userId: user.id,
      tokenHash: hashToken(token),
      purpose: 'password_reset',
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });
    await sendPasswordResetEmail(user.email, token);
    await recordAudit(null, {
      action: 'auth.password_reset.requested',
      entityType: 'user',
      entityId: user.id,
      ip,
    });
  }

  return jsonOk({ status: 'sent_if_applicable' });
});
