// GET /api/bids — the signed-in vendor's own bids, with the requirement each
// one is against. Always scoped to the session user.

import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, vendorProfiles } from '@/lib/db/schema';
import { requireActiveUser } from '@/lib/server/guards';
import { forbidden, jsonOk, route } from '@/lib/server/http';
import { serializeBid, serializeRfp } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const caller = await requireActiveUser();
  if (caller.user.role !== 'vendor') throw forbidden('Only vendor accounts have bids.');

  const rows = await db
    .select({ bid: bids, rfp: rfps, vendor: vendorProfiles })
    .from(bids)
    .innerJoin(rfps, eq(rfps.id, bids.rfpId))
    .innerJoin(vendorProfiles, eq(vendorProfiles.id, bids.vendorId))
    .where(and(eq(bids.vendorUserId, caller.user.id), isNull(bids.deletedAt)))
    .orderBy(desc(bids.submittedAt))
    .limit(200);

  return jsonOk({
    bids: rows.map((r) => ({
      ...serializeBid(
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
        true
      ),
      rfp: serializeRfp(r.rfp),
    })),
  });
});
