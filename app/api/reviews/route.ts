// GET  /api/reviews?vendorId=… — public rating summary for a vendor.
// POST /api/reviews             — the poster rates the vendor after the event.

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, corporateProfiles, rfps, vendorProfiles, vendorReviews } from '@/lib/db/schema';
import { newId } from '@/lib/server/crypto';
import { requireActiveUser } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  conflict,
  forbidden,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { createReviewSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get('vendorId');
  if (!vendorId) throw badRequest('vendorId is required.');
  await enforceRateLimit(RATE_LIMITS.publicRead, `ip:${clientIp(request)}`);

  const rows = await db
    .select({ review: vendorReviews, company: corporateProfiles.officeCompanyName })
    .from(vendorReviews)
    .innerJoin(rfps, eq(rfps.id, vendorReviews.rfpId))
    .innerJoin(corporateProfiles, eq(corporateProfiles.id, rfps.corporateId))
    .where(and(eq(vendorReviews.vendorId, vendorId), eq(vendorReviews.isHidden, false)))
    .orderBy(desc(vendorReviews.createdAt))
    .limit(50);

  const ratings = rows.map((r) => r.review.rating);
  const average = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  return jsonOk({
    vendorId,
    average,
    count: ratings.length,
    reviews: rows.map((r) => ({
      id: r.review.id,
      rating: r.review.rating,
      comment: r.review.comment,
      // Reviewers are shown as the company, not the individual employee.
      author: r.company || 'A COE member company',
      createdAt: r.review.createdAt.toISOString(),
    })),
  });
});

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireActiveUser();
  if (caller.user.role !== 'corporate') throw forbidden('Only the poster can rate a vendor.');
  await enforceRateLimit(RATE_LIMITS.review, `user:${caller.user.id}`);

  const body = await parseJson(request, createReviewSchema);

  const [rfp] = await db.select().from(rfps).where(eq(rfps.id, body.rfpId)).limit(1);
  if (!rfp) throw notFound('That requirement does not exist.');
  if (rfp.corporateUserId !== caller.user.id) throw forbidden();
  if (rfp.status !== 'completed') {
    throw badRequest('Mark the event complete before rating the vendor.');
  }
  if (!rfp.acceptedBidId) throw badRequest('No vendor was awarded on this requirement.');

  const [winning] = await db.select().from(bids).where(eq(bids.id, rfp.acceptedBidId)).limit(1);
  if (!winning) throw notFound('The awarded bid is missing.');

  const [existing] = await db
    .select({ id: vendorReviews.id })
    .from(vendorReviews)
    .where(and(eq(vendorReviews.rfpId, body.rfpId), eq(vendorReviews.authorUserId, caller.user.id)))
    .limit(1);
  if (existing) throw conflict('You have already rated this event.');

  const [created] = await db
    .insert(vendorReviews)
    .values({
      id: newId('rev'),
      rfpId: body.rfpId,
      bidId: winning.id,
      vendorId: winning.vendorId,
      authorUserId: caller.user.id,
      rating: body.rating,
      comment: body.comment,
    })
    .returning();

  await refreshVendorRating(winning.vendorId);
  await recordAudit(caller, {
    action: 'review.created',
    entityType: 'vendor_review',
    entityId: created!.id,
    metadata: { vendorId: winning.vendorId, rating: body.rating },
    ip: clientIp(request),
  });

  return jsonOk({ id: created!.id, rating: created!.rating }, { status: 201 });
});

/** Keeps the denormalised rating on the vendor profile in step with reviews. */
async function refreshVendorRating(vendorId: string) {
  const rows = await db
    .select({ rating: vendorReviews.rating })
    .from(vendorReviews)
    .where(and(eq(vendorReviews.vendorId, vendorId), eq(vendorReviews.isHidden, false)));
  if (rows.length === 0) return;
  const average = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
  await db
    .update(vendorProfiles)
    .set({
      rating: Math.round(average * 10) / 10,
      userRatingsTotal: rows.length,
      updatedAt: new Date(),
    })
    .where(eq(vendorProfiles.id, vendorId));
}
