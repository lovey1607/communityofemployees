// GET    /api/rfps/:id — the RFP plus its bids, visibility applied per role.
// PATCH  /api/rfps/:id — poster edits (only while nothing is awarded).
// DELETE /api/rfps/:id — poster cancels. Soft delete only; bids reference it.

import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, vendorProfiles, vendorReviews } from '@/lib/db/schema';
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
import { updateRfpSchema } from '@/lib/validation';
import { serializeBid, serializeRfp } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  const caller = await requireActiveUser();

  const [rfp] = await db
    .select()
    .from(rfps)
    .where(and(eq(rfps.id, id), isNull(rfps.deletedAt)))
    .limit(1);
  if (!rfp) throw notFound('That requirement does not exist.');

  const isOwner = rfp.corporateUserId === caller.user.id;
  const isAdmin = caller.user.role === 'admin';
  const isVendor = caller.user.role === 'vendor';

  // A vendor may read an RFP only while it is live, or if they bid on it.
  let vendorBidId: string | null = null;
  if (isVendor) {
    const [own] = await db
      .select({ id: bids.id })
      .from(bids)
      .where(and(eq(bids.rfpId, id), eq(bids.vendorUserId, caller.user.id), isNull(bids.deletedAt)))
      .limit(1);
    vendorBidId = own?.id ?? null;
    const isLive = rfp.status === 'open' || rfp.status === 'bid-received';
    if (!isLive && !vendorBidId) throw forbidden();
  } else if (!isOwner && !isAdmin) {
    throw forbidden();
  }

  const bidRows = await db
    .select({ bid: bids, vendor: vendorProfiles })
    .from(bids)
    .innerJoin(vendorProfiles, eq(vendorProfiles.id, bids.vendorId))
    .where(and(eq(bids.rfpId, id), isNull(bids.deletedAt)))
    .orderBy(asc(bids.totalPrice));

  // Visibility rules:
  //  · vendor  → only their own bid, in full. Rival identities and quotes are
  //              never sent to the browser, so "inspect element" reveals nothing.
  //  · poster  → all bids. Identity is revealed once the RFP is awarded, or
  //              immediately if this RFP was posted with open bidding.
  //  · admin   → everything.
  const revealToPoster =
    isAdmin || rfp.bidVisibility === 'open' || rfp.status === 'awarded' || rfp.status === 'completed';

  const visible = isVendor
    ? bidRows.filter((r) => r.bid.id === vendorBidId)
    : bidRows;

  const serializedBids = visible.map((r) =>
    serializeBid(
      r.bid,
      {
        vendorName: r.vendor.vendorName,
        vendorCompany: r.vendor.companyName,
        category: r.vendor.category,
        placeId: r.vendor.placeId,
        rating: r.vendor.rating,
        userRatingsTotal: r.vendor.userRatingsTotal,
        timings: r.vendor.timings,
        amenities: r.vendor.amenities,
        avgCostPerPerson: r.vendor.avgCostPerPerson,
        locality: r.vendor.locality,
        corporateSuitability: r.vendor.corporateSuitability,
      },
      isVendor ? true : revealToPoster || r.bid.id === rfp.acceptedBidId
    )
  );

  const [review] = await db
    .select({ id: vendorReviews.id })
    .from(vendorReviews)
    .where(eq(vendorReviews.rfpId, id))
    .limit(1);

  const prices = bidRows.map((r) => r.bid.totalPrice);
  return jsonOk({
    rfp: serializeRfp(rfp, {
      bidCount: bidRows.length,
      lowestBid: prices.length ? Math.min(...prices) : null,
      reviewed: Boolean(review),
    }),
    bids: serializedBids,
  });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
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

  const body = await parseJson(request, updateRfpSchema);

  if (body.status === 'completed' && rfp.status !== 'awarded') {
    throw badRequest('Only an awarded requirement can be marked complete.');
  }
  const locked = rfp.status === 'awarded' || rfp.status === 'completed';
  const editingContent =
    body.category || body.universal || body.categoryDetails || body.occasion || body.serviceArea;
  if (locked && editingContent) {
    throw badRequest('This requirement has been awarded and can no longer be edited.');
  }

  const universal = body.universal ?? (rfp.universal as { persons?: number; budgetPerPerson?: number });
  const totalBudget =
    body.universal
      ? body.universal.persons * body.universal.budgetPerPerson
      : rfp.totalBudget;

  const [updated] = await db
    .update(rfps)
    .set({
      category: body.category ?? rfp.category,
      occasion: body.occasion ?? rfp.occasion,
      categoryDetails: body.categoryDetails ?? rfp.categoryDetails,
      universal: (universal ?? rfp.universal) as Record<string, unknown>,
      serviceArea: body.serviceArea ?? rfp.serviceArea,
      bidVisibility: body.bidVisibility ?? rfp.bidVisibility,
      totalBudget,
      status: body.status ?? rfp.status,
      completedAt: body.status === 'completed' ? new Date() : rfp.completedAt,
      updatedAt: new Date(),
    })
    .where(eq(rfps.id, id))
    .returning();

  await recordAudit(caller, {
    action: 'rfp.updated',
    entityType: 'rfp',
    entityId: id,
    metadata: { status: updated!.status },
    ip: clientIp(request),
  });

  return jsonOk(serializeRfp(updated!));
});

export const DELETE = route(async (request: Request, ctx: Ctx) => {
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
  if (rfp.status === 'awarded' || rfp.status === 'completed') {
    throw badRequest('An awarded requirement cannot be withdrawn. Contact support if you need to.');
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(rfps).set({ status: 'cancelled', deletedAt: now, updatedAt: now }).where(eq(rfps.id, id));
    await tx
      .update(bids)
      .set({ status: 'rejected', updatedAt: now })
      .where(and(eq(bids.rfpId, id), inArray(bids.status, ['pending'])));
  });

  await recordAudit(caller, {
    action: 'rfp.cancelled',
    entityType: 'rfp',
    entityId: id,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'cancelled' });
});
