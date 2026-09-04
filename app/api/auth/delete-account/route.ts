// POST /api/auth/delete-account — self-service account closure.
//
// Soft delete: RFPs, bids and audit trail reference this user, so the row
// stays but is anonymised, de-authenticated and released from the unique
// email index. Open RFPs are cancelled and live bids withdrawn.

import { and, eq, inArray, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { bids, rfps, users } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/server/crypto';
import { requireUser } from '@/lib/server/guards';
import { clearSessionCookie, revokeAllSessionsForUser } from '@/lib/server/session';
import { recordAudit } from '@/lib/server/audit';
import { assertSameOrigin, badRequest, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';

const bodySchema = z.object({ password: z.string().min(1).max(200) });

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireUser();
  const { password } = await parseJson(request, bodySchema);

  if (!(await verifyPassword(password, caller.user.passwordHash))) {
    throw badRequest('Password is not correct.');
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    if (caller.user.role === 'corporate') {
      await tx
        .update(rfps)
        .set({ status: 'cancelled', updatedAt: now })
        .where(
          and(
            eq(rfps.corporateUserId, caller.user.id),
            inArray(rfps.status, ['draft', 'open', 'bid-received'])
          )
        );
    }
    if (caller.user.role === 'vendor') {
      await tx
        .update(bids)
        .set({ status: 'withdrawn', deletedAt: now, updatedAt: now })
        .where(and(eq(bids.vendorUserId, caller.user.id), eq(bids.status, 'pending')));
    }
    await tx
      .update(users)
      .set({
        deletedAt: now,
        isSuspended: true,
        email: `deleted+${caller.user.id}@invalid.local`,
        emailNormalized: `deleted+${caller.user.id}@invalid.local`,
        passwordHash: 'deleted',
        passwordChangedAt: now,
        updatedAt: now,
      })
      .where(and(eq(users.id, caller.user.id), isNull(users.deletedAt)));
  });

  await revokeAllSessionsForUser(caller.user.id);
  await clearSessionCookie();
  await recordAudit(caller, {
    action: 'account.self_deleted',
    entityType: 'user',
    entityId: caller.user.id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'account_deleted' });
});
