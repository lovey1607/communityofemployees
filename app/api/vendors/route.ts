// GET /api/vendors — public directory of approved vendors.
//
// Supports ?category=, ?q=, ?area=, and ?lat=&lng= to sort by real distance
// from the visitor. Contact details are withheld from the public payload.

import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, vendorProfiles } from '@/lib/db/schema';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import { clientIp, jsonOk, route } from '@/lib/server/http';
import { publicVendorSummary } from '@/lib/server/serialize';
import { paginationSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const EARTH_RADIUS_KM = 6371;

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const GET = route(async (request) => {
  await enforceRateLimit(RATE_LIMITS.publicRead, `ip:${clientIp(request)}`);

  const url = new URL(request.url);
  const { limit, offset } = paginationSchema.parse({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });
  const category = url.searchParams.get('category');
  const q = url.searchParams.get('q')?.trim();
  const area = url.searchParams.get('area')?.trim();
  // Note: Number(null) is 0, which is a valid-looking coordinate. Check that
  // the parameters were actually supplied before treating them as an origin,
  // or every caller gets distances measured from the Gulf of Guinea.
  const latParam = url.searchParams.get('lat');
  const lngParam = url.searchParams.get('lng');
  const lat = Number(latParam);
  const lng = Number(lngParam);
  const hasOrigin =
    latParam !== null &&
    lngParam !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  const conditions = [
    eq(users.approvalStatus, 'approved'),
    eq(users.isSuspended, false),
    isNull(users.deletedAt),
    eq(vendorProfiles.isCompleted, true),
  ];
  if (category) conditions.push(eq(vendorProfiles.category, category as 'sports'));
  if (area) {
    conditions.push(
      or(
        sql`${vendorProfiles.city} ILIKE ${'%' + area + '%'}`,
        sql`${vendorProfiles.locality} ILIKE ${'%' + area + '%'}`
      )!
    );
  }
  if (q) {
    // Parameterised LIKE — the value never reaches the SQL string.
    conditions.push(
      or(
        sql`${vendorProfiles.companyName} ILIKE ${'%' + q + '%'}`,
        sql`${vendorProfiles.portfolioSummary} ILIKE ${'%' + q + '%'}`,
        sql`${vendorProfiles.locality} ILIKE ${'%' + q + '%'}`
      )!
    );
  }

  const rows = await db
    .select({ vendor: vendorProfiles })
    .from(vendorProfiles)
    .innerJoin(users, eq(users.id, vendorProfiles.userId))
    .where(and(...conditions))
    .limit(hasOrigin ? 500 : limit)
    .offset(hasOrigin ? 0 : offset);

  let results = rows.map((r) => ({
    ...publicVendorSummary(r.vendor),
    distanceFromYouKm:
      hasOrigin && r.vendor.lat != null && r.vendor.lng != null
        ? haversineKm({ lat, lng }, { lat: r.vendor.lat, lng: r.vendor.lng })
        : null,
  }));

  if (hasOrigin) {
    results = results
      .sort((a, b) => (a.distanceFromYouKm ?? 1e9) - (b.distanceFromYouKm ?? 1e9))
      .slice(offset, offset + limit);
  }

  return jsonOk({ vendors: results, count: results.length, sortedByDistance: hasOrigin });
});
