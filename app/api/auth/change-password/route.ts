// POST /api/auth/change-password — signed-in password change.

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, verifyPassword } from '@/lib/server/crypto';
import { requireUser } from '@/lib/server/guards';
import {
  createSession,
  revokeAllSessionsForUser,
  setSessionCookie,
} from '@/lib/server/session';
import { recordAudit } from '@/lib/server/audit';
import { assertSameOrigin, badRequest, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { changePasswordSchema } from '@/lib/validation';

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireUser();
  const body = await parseJson(request, changePasswordSchema);

  if (!(await verifyPassword(body.currentPassword, caller.user.passwordHash))) {
    throw badRequest('Your current password is not correct.');
  }
  if (await verifyPassword(body.newPassword, caller.user.passwordHash)) {
    throw badRequest('Pick a password you have not used here before.');
  }

  const now = new Date();
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(body.newPassword), passwordChangedAt: now, updatedAt: now })
    .where(eq(users.id, caller.user.id));

  // Every other device is signed out; this one gets a fresh session.
  await revokeAllSessionsForUser(caller.user.id);
  const { token, expiresAt } = await createSession(caller.user.id, {
    userAgent: request.headers.get('user-agent'),
    ip: clientIp(request),
  });
  await setSessionCookie(token, expiresAt);

  await recordAudit(caller, {
    action: 'auth.password_changed',
    entityType: 'user',
    entityId: caller.user.id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'password_changed' });
});
