// PATCH  /api/admin/rfps/:id — admin overrides an RFP's status.
// DELETE /api/admin/rfps/:id — soft-delete (bids reference it).

import { and, eq, inArray, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { bids, rfps } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import {
  assertSameOrigin,
  clientIp,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { safeText } from '@/lib/validation';
import { serializeRfp } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(['draft', 'open', 'bid-received', 'awarded', 'completed', 'cancelled', 'closed']).optional(),
  bidVisibility: z.enum(['masked', 'open']).optional(),
  reason: safeText(300).optional(),
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  const body = await parseJson(request, patchSchema);

  const [existing] = await db.select().from(rfps).where(eq(rfps.id, id)).limit(1);
  if (!existing) throw notFound('No such requirement.');

  const [updated] = await db
    .update(rfps)
    .set({
      status: body.status ?? existing.status,
      bidVisibility: body.bidVisibility ?? existing.bidVisibility,
      updatedAt: new Date(),
    })
    .where(eq(rfps.id, id))
    .returning();

  await recordAudit(admin, {
    action: 'admin.rfp.updated',
    entityType: 'rfp',
    entityId: id,
    metadata: { from: existing.status, to: updated!.status, reason: body.reason },
    ip: clientIp(request),
  });

  return jsonOk(serializeRfp(updated!));
});

export const DELETE = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const admin = await requireAdmin();

  const [existing] = await db
    .select()
    .from(rfps)
    .where(and(eq(rfps.id, id), isNull(rfps.deletedAt)))
    .limit(1);
  if (!existing) throw notFound('No such requirement.');

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(rfps)
      .set({ status: 'cancelled', deletedAt: now, updatedAt: now })
      .where(eq(rfps.id, id));
    await tx
      .update(bids)
      .set({ status: 'rejected', updatedAt: now })
      .where(and(eq(bids.rfpId, id), inArray(bids.status, ['pending'])));
  });

  await recordAudit(admin, {
    action: 'admin.rfp.deleted',
    entityType: 'rfp',
    entityId: id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'deleted' });
});
