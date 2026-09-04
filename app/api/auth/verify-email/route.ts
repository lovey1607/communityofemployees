// POST /api/auth/verify-email — consume a one-time verification token.
// Verification does NOT sign the user in: the account still needs admin
// approval, and issuing a session here would hand out access early.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { authTokens, users } from '@/lib/db/schema';
import { hashToken } from '@/lib/server/crypto';
import { recordAudit } from '@/lib/server/audit';
import { assertSameOrigin, badRequest, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { verifyEmailSchema } from '@/lib/validation';

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const { token } = await parseJson(request, verifyEmailSchema);

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        eq(authTokens.purpose, 'email_verify'),
        isNull(authTokens.consumedAt)
      )
    )
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) {
    throw badRequest('That confirmation link is invalid or has expired. Request a new one.');
  }

  const [user] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
  if (!user || user.deletedAt) throw badRequest('That confirmation link is no longer valid.');

  await db.transaction(async (tx) => {
    await tx.update(authTokens).set({ consumedAt: new Date() }).where(eq(authTokens.id, row.id));
    if (!user.emailVerifiedAt) {
      await tx
        .update(users)
        .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }
  });

  await recordAudit(null, {
    action: 'auth.email_verified',
    entityType: 'user',
    entityId: user.id,
    ip: clientIp(request),
  });

  return jsonOk({
    status: 'verified',
    approvalStatus: user.approvalStatus,
    // Deliberate: the user is verified but still gated on admin approval.
    nextStep:
      user.approvalStatus === 'approved'
        ? 'You can sign in now.'
        : 'Email confirmed. An admin reviews your account next — we will email you when it is live.',
  });
});
