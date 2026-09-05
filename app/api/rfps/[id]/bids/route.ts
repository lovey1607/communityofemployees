// POST /api/rfps/:id/bids — an approved vendor quotes on a live requirement.
// One live bid per vendor per RFP; posting again revises the existing one.

import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, corporateProfiles, rfps, vendorProfiles } from '@/lib/db/schema';
import { newId } from '@/lib/server/crypto';
import { requireActiveUser, requireVendorProfile } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
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
import { createBidSchema } from '@/lib/validation';
import { serializeBid } from '@/lib/server/serialize';
import { scoreBid } from '@/lib/server/match';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Rough locality match used for the "how close is this vendor" signal. */
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const POST = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id: rfpId } = await ctx.params;
  const caller = await requireActiveUser();
  if (caller.user.role !== 'vendor') throw forbidden('Only vendor accounts can bid.');
  await enforceRateLimit(RATE_LIMITS.bidCreate, `user:${caller.user.id}`);

  const vendor = await requireVendorProfile(caller);
  if (!vendor.isCompleted) throw badRequest('Complete your vendor profile before bidding.');

  const body = await parseJson(request, createBidSchema);
  if (body.rfpId !== rfpId) throw badRequest('Bid does not match this requirement.');

  const [rfp] = await db
    .select()
    .from(rfps)
    .where(and(eq(rfps.id, rfpId), isNull(rfps.deletedAt)))
    .limit(1);
  if (!rfp) throw notFound('That requirement does not exist.');
  if (rfp.status !== 'open' && rfp.status !== 'bid-received') {
    throw badRequest('This requirement is no longer accepting bids.');
  }

  const vendorCategories = [vendor.category, ...(vendor.extraCategories ?? [])];
  if (!vendorCategories.includes(rfp.category)) {
    throw forbidden('This requirement is outside your registered categories.');
  }

  const lineTotal = body.lineItems.reduce((sum, item) => sum + item.amount, 0);
  if (body.lineItems.length > 0 && lineTotal !== body.totalPrice) {
    throw badRequest(`Line items add up to ₹${lineTotal.toLocaleString('en-IN')}, not your quoted total.`);
  }

  const validUntil = body.validUntil ? new Date(body.validUntil) : null;
  if (validUntil && validUntil.getTime() < Date.now()) {
    throw badRequest('The validity date is in the past.');
  }

  // Distance is derived server-side from the two saved coordinates, never
  // supplied by the bidder.
  const [poster] = await db
    .select({ lat: corporateProfiles.lat, lng: corporateProfiles.lng })
    .from(corporateProfiles)
    .where(eq(corporateProfiles.id, rfp.corporateId))
    .limit(1);
  const distanceKm =
    poster?.lat != null && poster?.lng != null && vendor.lat != null && vendor.lng != null
      ? haversineKm({ lat: poster.lat, lng: poster.lng }, { lat: vendor.lat, lng: vendor.lng })
      : vendor.distanceKm;

  // How well this bid answers the requirement. Scored server-side from the
  // saved RFP and vendor records so a bidder cannot influence their own
  // score, and stored with its breakdown so the buyer can see the reasoning
  // on the comparison screen rather than a bare number.
  const [record] = await db
    .select({
      // Completed work on COE, counted through the accepted bid rather than
      // a denormalised column — rfps records the winning bid id, and the bid
      // is what carries the vendor.
      completed: sql<number>`(
        SELECT COUNT(*)::int
        FROM rfps r
        JOIN bids b ON b.id = r.accepted_bid_id
        WHERE r.status = 'completed' AND b.vendor_id = ${vendor.id}
      )`,
      avgRating: sql<number | null>`(
        SELECT AVG(rating)::float FROM vendor_reviews vr WHERE vr.vendor_id = ${vendor.id}
      )`,
      ratingCount: sql<number>`(
        SELECT COUNT(*)::int FROM vendor_reviews vr WHERE vr.vendor_id = ${vendor.id}
      )`,
    })
    .from(vendorProfiles)
    .where(eq(vendorProfiles.id, vendor.id))
    .limit(1);

  const universal = (rfp.universal ?? {}) as { persons?: number };
  const match = scoreBid({
    budget: rfp.totalBudget,
    bidPrice: body.totalPrice,
    headcount: Number(universal.persons ?? 0),
    requirements: (rfp.categoryDetails ?? {}) as Record<string, unknown>,
    distanceKm: distanceKm ?? null,
    serviceArea: rfp.serviceArea ?? null,
    vendor: {
      amenities: vendor.amenities ?? null,
      avgCostPerPerson: vendor.avgCostPerPerson ?? null,
      serviceAreas: vendor.serviceAreas ?? null,
      locality: vendor.locality ?? null,
      completedEvents: Number(record?.completed ?? 0),
      averageRating: record?.avgRating ?? null,
      ratingCount: Number(record?.ratingCount ?? 0),
    },
  });
  const matchPercentage = match.percentage;

  const now = new Date();
  const [existing] = await db
    .select()
    .from(bids)
    .where(and(eq(bids.rfpId, rfpId), eq(bids.vendorUserId, caller.user.id), isNull(bids.deletedAt)))
    .limit(1);

  let saved;
  if (existing) {
    if (existing.status === 'accepted') throw badRequest('This bid has already been accepted.');
    [saved] = await db
      .update(bids)
      .set({
        totalPrice: body.totalPrice,
        lineItems: body.lineItems,
        proposal: body.proposal,
        validUntil,
        distanceKm,
        matchPercentage,
        matchFactors: match.factors,
        status: 'pending',
        revisedAt: now,
        updatedAt: now,
      })
      .where(eq(bids.id, existing.id))
      .returning();
  } else {
    [saved] = await db
      .insert(bids)
      .values({
        id: newId('bid'),
        rfpId,
        vendorId: vendor.id,
        vendorUserId: caller.user.id,
        totalPrice: body.totalPrice,
        lineItems: body.lineItems,
        proposal: body.proposal,
        validUntil,
        distanceKm,
        matchPercentage,
        matchFactors: match.factors,
      })
      .returning();
  }

  if (rfp.status === 'open') {
    await db.update(rfps).set({ status: 'bid-received', updatedAt: now }).where(eq(rfps.id, rfpId));
  }

  await recordAudit(caller, {
    action: existing ? 'bid.revised' : 'bid.submitted',
    entityType: 'bid',
    entityId: saved!.id,
    metadata: { rfpId, totalPrice: body.totalPrice },
    ip: clientIp(request),
  });

  return jsonOk(
    serializeBid(
      saved!,
      {
        vendorName: vendor.vendorName,
        vendorCompany: vendor.companyName,
        category: vendor.category,
        placeId: vendor.placeId,
        rating: vendor.rating,
        userRatingsTotal: vendor.userRatingsTotal,
        timings: vendor.timings,
        amenities: vendor.amenities,
        avgCostPerPerson: vendor.avgCostPerPerson,
        locality: vendor.locality,
        corporateSuitability: vendor.corporateSuitability,
      },
      true
    ),
    { status: existing ? 200 : 201 }
  );
});

// Deliberately no GET here: a vendor listing rival bids is exactly what the
// masked model prevents. Read bids via GET /api/rfps/:id (poster/admin) or
// GET /api/bids (a vendor's own bids).
