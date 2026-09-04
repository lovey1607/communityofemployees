// POST /api/rfps/:id/complete — the poster marks the event as delivered,
// which is what unlocks the post-event vendor rating.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rfps } from '@/lib/db/schema';
import { requireActiveUser } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  forbidden,
  jsonOk,
  notFound,
  route,
} from '@/lib/server/http';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const caller = await requireActiveUser();

  const [rfp] = await db
    .select()
    .from(rfps)
    .where(and(eq(rfps.id, id), isNull(rfps.deletedAt)))
    .limit(1);
  if (!rfp) throw notFound('That requirement does not exist.');
  if (rfp.corporateUserId !== caller.user.id && caller.user.role !== 'admin') throw forbidden();
  if (rfp.status !== 'awarded') throw badRequest('Award a bid before marking this complete.');

  const now = new Date();
  await db
    .update(rfps)
    .set({ status: 'completed', completedAt: now, updatedAt: now })
    .where(eq(rfps.id, id));

  await recordAudit(caller, {
    action: 'rfp.completed',
    entityType: 'rfp',
    entityId: id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'completed' });
});
