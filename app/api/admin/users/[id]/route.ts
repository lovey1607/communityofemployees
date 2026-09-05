// PATCH  /api/admin/users/:id — approve/reject, suspend/unsuspend.
// DELETE /api/admin/users/:id — soft-delete an account.
//
// Every branch writes an audit row, and an admin cannot act on themselves.

import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, users } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { revokeAllSessionsForUser } from '@/lib/server/session';
import { recordAudit } from '@/lib/server/audit';
import { sendApprovalEmail } from '@/lib/server/email';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { adminUserPatchSchema } from '@/lib/validation';
import { serializeUser } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  if (id === admin.user.id) throw badRequest('You cannot change your own account from here.');

  const body = await parseJson(request, adminUserPatchSchema);

  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  if (!target) throw notFound('No such account.');

  const now = new Date();
  const approvalChanged =
    body.approvalStatus !== undefined && body.approvalStatus !== target.approvalStatus;

  const [updated] = await db
    .update(users)
    .set({
      approvalStatus: body.approvalStatus ?? target.approvalStatus,
      approvedAt: body.approvalStatus === 'approved' ? now : target.approvedAt,
      approvedBy: body.approvalStatus === 'approved' ? admin.user.id : target.approvedBy,
      rejectionReason:
        body.approvalStatus === 'rejected' ? body.rejectionReason ?? null : target.rejectionReason,
      isSuspended: body.isSuspended ?? target.isSuspended,
      updatedAt: now,
    })
    .where(eq(users.id, id))
    .returning();

  // Losing approval or getting suspended kicks the user out immediately.
  const revoked =
    (body.isSuspended === true && !target.isSuspended) ||
    (approvalChanged && body.approvalStatus !== 'approved');
  if (revoked) await revokeAllSessionsForUser(id);

  await recordAudit(admin, {
    action: 'admin.user.updated',
    entityType: 'user',
    entityId: id,
    metadata: {
      approvalStatus: updated!.approvalStatus,
      isSuspended: updated!.isSuspended,
      reason: body.rejectionReason,
      sessionsRevoked: revoked,
    },
    ip: clientIp(request),
  });

  if (approvalChanged && (body.approvalStatus === 'approved' || body.approvalStatus === 'rejected')) {
    await sendApprovalEmail(target.email, body.approvalStatus === 'approved', body.rejectionReason);
  }

  return jsonOk(serializeUser(updated!));
});

export const DELETE = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  if (id === admin.user.id) throw badRequest('You cannot delete your own account from here.');

  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  if (!target) throw notFound('No such account.');

  // Soft delete: RFPs, bids and the audit trail all reference this row.
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(rfps)
      .set({ status: 'cancelled', updatedAt: now })
      .where(and(eq(rfps.corporateUserId, id), inArray(rfps.status, ['draft', 'open', 'bid-received'])));
    await tx
      .update(bids)
      .set({ status: 'withdrawn', deletedAt: now, updatedAt: now })
      .where(and(eq(bids.vendorUserId, id), eq(bids.status, 'pending')));
    await tx
      .update(users)
      .set({
        deletedAt: now,
        isSuspended: true,
        email: `deleted+${id}@invalid.local`,
        emailNormalized: `deleted+${id}@invalid.local`,
        passwordHash: 'deleted',
        passwordChangedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, id));
  });
  await revokeAllSessionsForUser(id);

  await recordAudit(admin, {
    action: 'admin.user.deleted',
    entityType: 'user',
    entityId: id,
    metadata: { email: target.email, role: target.role },
    ip: clientIp(request),
  });

  return jsonOk({ status: 'deleted' });
});
