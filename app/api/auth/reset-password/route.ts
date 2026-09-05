// POST /api/auth/reset-password — consume a reset token, set a new password,
// and kill every existing session for that user.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { authTokens, users } from '@/lib/db/schema';
import { hashPassword, hashToken } from '@/lib/server/crypto';
import { revokeAllSessionsForUser } from '@/lib/server/session';
import { recordAudit } from '@/lib/server/audit';
import { assertSameOrigin, badRequest, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { resetPasswordSchema } from '@/lib/validation';

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const { token, password } = await parseJson(request, resetPasswordSchema);

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        eq(authTokens.purpose, 'password_reset'),
        isNull(authTokens.consumedAt)
      )
    )
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) {
    throw badRequest('That reset link is invalid or has expired. Request a new one.');
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.update(authTokens).set({ consumedAt: now }).where(eq(authTokens.id, row.id));
    await tx
      .update(users)
      .set({
        passwordHash,
        passwordChangedAt: now,
        failedLoginCount: 0,
        lockedUntil: null,
        // Resetting the password proves inbox control, so treat it as verifying
        // the address if it was not verified yet.
        emailVerifiedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, row.userId));
  });

  await revokeAllSessionsForUser(row.userId);
  await recordAudit(null, {
    action: 'auth.password_reset.completed',
    entityType: 'user',
    entityId: row.userId,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'password_reset' });
});
