// POST /api/admin/approvals/:id — one-click approve / reject.
// Thin wrapper over the same logic as PATCH /api/admin/users/:id, kept
// separate so the approval queue can call something obvious.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, vendorProfiles } from '@/lib/db/schema';
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
import { approvalDecisionSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  if (id === admin.user.id) throw badRequest('You cannot approve your own account.');

  const { decision, reason } = await parseJson(request, approvalDecisionSchema);

  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  if (!target) throw notFound('No such account.');
  if (target.role === 'admin') throw badRequest('Admin accounts are not part of the approval queue.');

  const now = new Date();
  await db
    .update(users)
    .set({
      approvalStatus: decision,
      approvedAt: decision === 'approved' ? now : null,
      approvedBy: decision === 'approved' ? admin.user.id : null,
      rejectionReason: decision === 'rejected' ? reason ?? null : null,
      updatedAt: now,
    })
    .where(eq(users.id, id));

  // Approving a vendor is also the point at which their GSTIN is treated as
  // checked — the admin has seen the number and the documents.
  if (decision === 'approved' && target.role === 'vendor') {
    await db
      .update(vendorProfiles)
      .set({ gstVerified: true, updatedAt: now })
      .where(eq(vendorProfiles.userId, id));
  }
  if (decision !== 'approved') await revokeAllSessionsForUser(id);

  await recordAudit(admin, {
    action: `admin.approval.${decision}`,
    entityType: 'user',
    entityId: id,
    metadata: { role: target.role, reason },
    ip: clientIp(request),
  });

  if (decision === 'approved' || decision === 'rejected') {
    await sendApprovalEmail(target.email, decision === 'approved', reason);
  }

  return jsonOk({ status: decision });
});
