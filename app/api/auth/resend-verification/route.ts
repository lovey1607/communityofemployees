// POST /api/auth/resend-verification — always answers the same way, whether or
// not the address exists or is already verified.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { authTokens, users } from '@/lib/db/schema';
import { generateToken, hashToken, newId } from '@/lib/server/crypto';
import { sendVerificationEmail } from '@/lib/server/email';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import { assertSameOrigin, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { resendVerificationSchema } from '@/lib/validation';

const VERIFY_TTL_MS = 1000 * 60 * 60 * 24;

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const ip = clientIp(request);
  const { email } = await parseJson(request, resendVerificationSchema);
  await enforceRateLimit(RATE_LIMITS.emailResend, `ip:${ip}`);
  await enforceRateLimit(RATE_LIMITS.emailResend, `email:${email}`);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.emailNormalized, email), isNull(users.deletedAt)))
    .limit(1);

  if (user && !user.emailVerifiedAt) {
    const token = generateToken(32);
    await db.insert(authTokens).values({
      id: newId('tok'),
      userId: user.id,
      tokenHash: hashToken(token),
      purpose: 'email_verify',
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    });
    await sendVerificationEmail(user.email, token);
  }

  return jsonOk({ status: 'sent_if_applicable' });
});
