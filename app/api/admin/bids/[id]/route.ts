// PATCH  /api/admin/bids/:id — status override (e.g. reject a spam quote).
// DELETE /api/admin/bids/:id — soft-delete a bid.

import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { bids, rfps } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { safeText } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(['pending', 'rejected', 'withdrawn']).optional(),
  reason: safeText(300).optional(),
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  const body = await parseJson(request, patchSchema);

  const [existing] = await db.select().from(bids).where(eq(bids.id, id)).limit(1);
  if (!existing) throw notFound('No such bid.');
  if (existing.status === 'accepted') {
    throw badRequest('Reverse the award on the requirement before changing the winning bid.');
  }

  const [updated] = await db
    .update(bids)
    .set({ status: body.status ?? existing.status, updatedAt: new Date() })
    .where(eq(bids.id, id))
    .returning();

  await recordAudit(admin, {
    action: 'admin.bid.updated',
    entityType: 'bid',
    entityId: id,
    metadata: { from: existing.status, to: updated!.status, reason: body.reason },
    ip: clientIp(request),
  });

  return jsonOk({ id, status: updated!.status });
});

export const DELETE = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();

  const [existing] = await db
    .select()
    .from(bids)
    .where(and(eq(bids.id, id), isNull(bids.deletedAt)))
    .limit(1);
  if (!existing) throw notFound('No such bid.');
  if (existing.status === 'accepted') {
    throw badRequest('An awarded bid cannot be deleted — reverse the award first.');
  }

  const now = new Date();
  await db
    .update(bids)
    .set({ status: 'withdrawn', deletedAt: now, updatedAt: now })
    .where(eq(bids.id, id));

  const remaining = await db
    .select({ id: bids.id })
    .from(bids)
    .where(and(eq(bids.rfpId, existing.rfpId), isNull(bids.deletedAt), eq(bids.status, 'pending')));
  if (remaining.length === 0) {
    await db
      .update(rfps)
      .set({ status: 'open', updatedAt: now })
      .where(and(eq(rfps.id, existing.rfpId), eq(rfps.status, 'bid-received')));
  }

  await recordAudit(admin, {
    action: 'admin.bid.deleted',
    entityType: 'bid',
    entityId: id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'deleted' });
});
