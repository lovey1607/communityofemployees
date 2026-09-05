// PATCH  /api/bids/:id — vendor revises their own pending bid.
// DELETE /api/bids/:id — vendor withdraws it.
//
// Ownership is checked against the session, so changing the id in the URL to
// another vendor's bid returns 404, not their data.

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, vendorProfiles } from '@/lib/db/schema';
import { requireActiveUser } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  forbidden,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { reviseBidSchema } from '@/lib/validation';
import { serializeBid } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function loadOwnBid(bidId: string, vendorUserId: string) {
  const [row] = await db
    .select({ bid: bids, vendor: vendorProfiles })
    .from(bids)
    .innerJoin(vendorProfiles, eq(vendorProfiles.id, bids.vendorId))
    .where(and(eq(bids.id, bidId), eq(bids.vendorUserId, vendorUserId), isNull(bids.deletedAt)))
    .limit(1);
  if (!row) throw notFound('That bid does not exist.');
  return row;
}

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const caller = await requireActiveUser();
  if (caller.user.role !== 'vendor') throw forbidden();

  const { bid, vendor } = await loadOwnBid(id, caller.user.id);
  if (bid.status !== 'pending') throw badRequest('Only a pending bid can be revised.');

  const [rfp] = await db.select().from(rfps).where(eq(rfps.id, bid.rfpId)).limit(1);
  if (!rfp || (rfp.status !== 'open' && rfp.status !== 'bid-received')) {
    throw badRequest('This requirement is no longer accepting changes.');
  }

  const body = await parseJson(request, reviseBidSchema);
  const totalPrice = body.totalPrice ?? bid.totalPrice;
  const lineItems = body.lineItems ?? bid.lineItems;
  const lineTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  if (lineItems.length > 0 && lineTotal !== totalPrice) {
    throw badRequest('Line items must add up to your quoted total.');
  }

  const now = new Date();
  const [updated] = await db
    .update(bids)
    .set({
      totalPrice,
      lineItems,
      proposal: body.proposal ?? bid.proposal,
      validUntil: body.validUntil ? new Date(body.validUntil) : bid.validUntil,
      revisedAt: now,
      updatedAt: now,
    })
    .where(eq(bids.id, id))
    .returning();

  await recordAudit(caller, {
    action: 'bid.revised',
    entityType: 'bid',
    entityId: id,
    metadata: { totalPrice },
    ip: clientIp(request),
  });

  return jsonOk(
    serializeBid(
      updated!,
      {
        vendorName: vendor.vendorName,
        vendorCompany: vendor.companyName,
        category: vendor.category,
        rating: vendor.rating,
        userRatingsTotal: vendor.userRatingsTotal,
        amenities: vendor.amenities,
        avgCostPerPerson: vendor.avgCostPerPerson,
        locality: vendor.locality,
      },
      true
    )
  );
});

export const DELETE = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id } = await ctx.params;
  const caller = await requireActiveUser();
  if (caller.user.role !== 'vendor') throw forbidden();

  const { bid } = await loadOwnBid(id, caller.user.id);
  if (bid.status === 'accepted') {
    throw badRequest('An accepted bid cannot be withdrawn. Contact the poster.');
  }

  const now = new Date();
  await db
    .update(bids)
    .set({ status: 'withdrawn', deletedAt: now, updatedAt: now })
    .where(eq(bids.id, id));

  // If that was the last live bid, the requirement goes back to plain "open".
  const remaining = await db
    .select({ id: bids.id })
    .from(bids)
    .where(and(eq(bids.rfpId, bid.rfpId), isNull(bids.deletedAt), eq(bids.status, 'pending')));
  if (remaining.length === 0) {
    await db
      .update(rfps)
      .set({ status: 'open', updatedAt: now })
      .where(and(eq(rfps.id, bid.rfpId), eq(rfps.status, 'bid-received')));
  }

  await recordAudit(caller, {
    action: 'bid.withdrawn',
    entityType: 'bid',
    entityId: id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'withdrawn' });
});
