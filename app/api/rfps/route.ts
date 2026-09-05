// GET  /api/rfps  — list RFPs, scoped by role:
//        corporate → only their own
//        vendor    → only OPEN ones matching their category / service area
//        admin     → everything
// POST /api/rfps  — an approved employee posts a requirement.

import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, users, vendorProfiles, vendorReviews } from '@/lib/db/schema';
import { newId } from '@/lib/server/crypto';
import { requireActiveUser, requireCorporateProfile } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import { sendNewRfpDigestEmail } from '@/lib/server/email';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import { assertSameOrigin, badRequest, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { createRfpSchema, paginationSchema } from '@/lib/validation';
import { serializeRfp } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

/**
 * Aggregates used by every list view: how many bids, and the current best
 * price. Built lazily inside the handler so importing this module does not
 * open a database connection at build time.
 */
function bidStatsSubquery() {
  return db
    .select({
      rfpId: bids.rfpId,
      bidCount: sql<number>`count(*)::int`.as('bid_count'),
      lowestBid: sql<number>`min(${bids.totalPrice})::int`.as('lowest_bid'),
    })
    .from(bids)
    .where(and(isNull(bids.deletedAt), inArray(bids.status, ['pending', 'accepted'])))
    .groupBy(bids.rfpId)
    .as('bid_stats');
}

export const GET = route(async (request) => {
  const caller = await requireActiveUser();
  const url = new URL(request.url);
  const { limit, offset } = paginationSchema.parse({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });
  const categoryFilter = url.searchParams.get('category');
  const statusFilter = url.searchParams.get('status');
  const areaFilter = url.searchParams.get('area');

  const conditions = [isNull(rfps.deletedAt)];

  if (caller.user.role === 'corporate') {
    conditions.push(eq(rfps.corporateUserId, caller.user.id));
  } else if (caller.user.role === 'vendor') {
    const [vendor] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, caller.user.id))
      .limit(1);
    if (!vendor) return jsonOk({ rfps: [], total: 0 });

    // A vendor sees live requirements in their categories, plus any RFP they
    // have already bid on (so awarded/closed work stays visible to them).
    const categories = [vendor.category, ...(vendor.extraCategories ?? [])];
    const ownBidRfpIds = (
      await db
        .select({ rfpId: bids.rfpId })
        .from(bids)
        .where(and(eq(bids.vendorUserId, caller.user.id), isNull(bids.deletedAt)))
    ).map((r) => r.rfpId);

    const liveAndMine = or(
      and(
        inArray(rfps.status, ['open', 'bid-received']),
        inArray(rfps.category, categories as ('sports' | 'food' | 'trips' | 'gifts' | 'dress')[])
      ),
      ownBidRfpIds.length > 0 ? inArray(rfps.id, ownBidRfpIds) : sql`false`
    );
    conditions.push(liveAndMine!);
  }
  // admin: no extra scoping

  if (categoryFilter) {
    conditions.push(eq(rfps.category, categoryFilter as 'sports'));
  }
  if (statusFilter) {
    conditions.push(inArray(rfps.status, statusFilter.split(',') as ('open')[]));
  }
  if (areaFilter) {
    conditions.push(sql`${rfps.serviceArea} ILIKE ${'%' + areaFilter + '%'}`);
  }

  const bidStats = bidStatsSubquery();
  const rows = await db
    .select({
      rfp: rfps,
      bidCount: bidStats.bidCount,
      lowestBid: bidStats.lowestBid,
      reviewId: vendorReviews.id,
    })
    .from(rfps)
    .leftJoin(bidStats, eq(bidStats.rfpId, rfps.id))
    .leftJoin(vendorReviews, eq(vendorReviews.rfpId, rfps.id))
    .where(and(...conditions))
    .orderBy(desc(rfps.submittedAt))
    .limit(limit)
    .offset(offset);

  return jsonOk({
    rfps: rows.map((r) =>
      serializeRfp(r.rfp, {
        bidCount: r.bidCount ?? 0,
        lowestBid: r.lowestBid ?? null,
        reviewed: Boolean(r.reviewId),
      })
    ),
    total: rows.length,
  });
});

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireActiveUser();
  if (caller.user.role !== 'corporate') throw badRequest('Only employee accounts can post requirements.');
  await enforceRateLimit(RATE_LIMITS.rfpCreate, `user:${caller.user.id}`);

  const profile = await requireCorporateProfile(caller);
  if (!profile.isCompleted) {
    throw badRequest('Finish your company profile before posting a requirement.');
  }

  const body = await parseJson(request, createRfpSchema);

  const start = Date.parse(body.universal.startDate);
  if (Number.isFinite(start) && start < Date.now() - 86_400_000) {
    throw badRequest('The start date is in the past.');
  }

  // The client is never trusted with the total — it is computed here.
  const totalBudget = body.universal.persons * body.universal.budgetPerPerson;
  const status = body.status === 'draft' ? 'draft' : 'open';

  const [created] = await db
    .insert(rfps)
    .values({
      id: newId('rfp'),
      corporateId: profile.id,
      corporateUserId: caller.user.id,
      companyName: profile.officeCompanyName || profile.name,
      category: body.category,
      occasion: body.occasion ?? null,
      categoryDetails: body.categoryDetails,
      universal: body.universal,
      serviceArea: body.serviceArea ?? profile.city ?? null,
      totalBudget,
      status,
      bidVisibility: body.bidVisibility ?? 'masked',
    })
    .returning();

  await recordAudit(caller, {
    action: 'rfp.created',
    entityType: 'rfp',
    entityId: created!.id,
    metadata: { category: body.category, totalBudget, status },
    ip: clientIp(request),
  });

  if (status === 'open') {
    void notifyMatchingVendors(created!.id, created!.category, created!.companyName);
  }

  return jsonOk(serializeRfp(created!, { bidCount: 0, lowestBid: null }), { status: 201 });
});

/** Fire-and-forget digest to approved vendors in the matching category. */
async function notifyMatchingVendors(rfpId: string, category: string, companyName: string) {
  try {
    const recipients = await db
      .select({ email: users.email })
      .from(vendorProfiles)
      .innerJoin(users, eq(users.id, vendorProfiles.userId))
      .where(
        and(
          eq(vendorProfiles.category, category as 'sports'),
          eq(users.approvalStatus, 'approved'),
          eq(users.isSuspended, false),
          isNull(users.deletedAt)
        )
      )
      .limit(200);
    await Promise.all(
      recipients.map((r) => sendNewRfpDigestEmail(r.email, `${companyName} — ${category}`))
    );
  } catch (error) {
    console.error('[rfp] vendor digest failed', { rfpId, error });
  }
}
