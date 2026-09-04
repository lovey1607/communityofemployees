// GET /api/admin/stats — the numbers the admin dashboard header shows.

import { count, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, users, vendorProfiles } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  await requireAdmin();

  const [userCounts, rfpCounts, categoryCounts, bidTotals, vendorCategories] = await Promise.all([
    db
      .select({
        role: users.role,
        approvalStatus: users.approvalStatus,
        suspended: users.isSuspended,
        n: count(),
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(users.role, users.approvalStatus, users.isSuspended),
    db
      .select({ status: rfps.status, n: count() })
      .from(rfps)
      .where(isNull(rfps.deletedAt))
      .groupBy(rfps.status),
    db
      .select({ category: rfps.category, n: count() })
      .from(rfps)
      .where(isNull(rfps.deletedAt))
      .groupBy(rfps.category),
    db
      .select({
        n: count(),
        value: sql<number>`coalesce(sum(${bids.totalPrice}), 0)::bigint`,
        accepted: sql<number>`count(*) filter (where ${bids.status} = 'accepted')::int`,
      })
      .from(bids)
      .where(isNull(bids.deletedAt)),
    db.select({ category: vendorProfiles.category, n: count() }).from(vendorProfiles).groupBy(vendorProfiles.category),
  ]);

  const sumWhere = (role: string, predicate: (r: (typeof userCounts)[number]) => boolean) =>
    userCounts.filter((r) => r.role === role && predicate(r)).reduce((s, r) => s + r.n, 0);

  const byStatus = Object.fromEntries(rfpCounts.map((r) => [r.status, r.n]));

  return jsonOk({
    employees: {
      total: sumWhere('corporate', () => true),
      approved: sumWhere('corporate', (r) => r.approvalStatus === 'approved' && !r.suspended),
      pending: sumWhere('corporate', (r) => r.approvalStatus === 'pending'),
      rejected: sumWhere('corporate', (r) => r.approvalStatus === 'rejected'),
      suspended: sumWhere('corporate', (r) => r.suspended),
    },
    vendors: {
      total: sumWhere('vendor', () => true),
      approved: sumWhere('vendor', (r) => r.approvalStatus === 'approved' && !r.suspended),
      pending: sumWhere('vendor', (r) => r.approvalStatus === 'pending'),
      rejected: sumWhere('vendor', (r) => r.approvalStatus === 'rejected'),
      suspended: sumWhere('vendor', (r) => r.suspended),
    },
    rfps: {
      total: rfpCounts.reduce((s, r) => s + r.n, 0),
      active: (byStatus['open'] ?? 0) + (byStatus['bid-received'] ?? 0),
      byStatus,
    },
    bids: {
      total: Number(bidTotals[0]?.n ?? 0),
      accepted: Number(bidTotals[0]?.accepted ?? 0),
      totalQuotedValue: Number(bidTotals[0]?.value ?? 0),
    },
    categories: {
      rfps: Object.fromEntries(categoryCounts.map((r) => [r.category, r.n])),
      vendors: Object.fromEntries(vendorCategories.map((r) => [r.category, r.n])),
    },
  });
});
