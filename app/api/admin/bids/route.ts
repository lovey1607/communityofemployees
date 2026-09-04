// GET /api/admin/bids — all bids with vendor identity revealed.

import { and, desc, eq, isNull, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, vendorProfiles } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';
import { serializeBid } from '@/lib/server/serialize';
import { paginationSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  await requireAdmin();
  const url = new URL(request.url);
  const { limit, offset } = paginationSchema.parse({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });

  const conditions: SQL[] = [];
  if (url.searchParams.get('includeDeleted') !== 'true') conditions.push(isNull(bids.deletedAt));
  const rfpId = url.searchParams.get('rfpId');
  if (rfpId) conditions.push(eq(bids.rfpId, rfpId));

  const rows = await db
    .select({ bid: bids, vendor: vendorProfiles })
    .from(bids)
    .innerJoin(vendorProfiles, eq(vendorProfiles.id, bids.vendorId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(bids.submittedAt))
    .limit(limit)
    .offset(offset);

  return jsonOk({
    bids: rows.map((r) =>
      serializeBid(
        r.bid,
        {
          vendorName: r.vendor.vendorName,
          vendorCompany: r.vendor.companyName,
          category: r.vendor.category,
          rating: r.vendor.rating,
          userRatingsTotal: r.vendor.userRatingsTotal,
          amenities: r.vendor.amenities,
          avgCostPerPerson: r.vendor.avgCostPerPerson,
          locality: r.vendor.locality,
        },
        true
      )
    ),
  });
});
