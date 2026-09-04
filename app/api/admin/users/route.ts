// GET /api/admin/users — every account with its profile, filterable.
// Powers both the approval queues and the full management tables.

import { and, desc, eq, isNull, or, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { corporateProfiles, users, vendorProfiles } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';
import {
  serializeCorporateProfile,
  serializeUser,
  serializeVendorProfile,
} from '@/lib/server/serialize';
import { paginationSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  await requireAdmin();

  const url = new URL(request.url);
  const { limit, offset } = paginationSchema.parse({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const q = url.searchParams.get('q')?.trim();
  const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

  const conditions: SQL[] = [];
  if (!includeDeleted) conditions.push(isNull(users.deletedAt));
  if (role === 'corporate' || role === 'vendor' || role === 'admin') {
    conditions.push(eq(users.role, role));
  }
  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    conditions.push(eq(users.approvalStatus, status));
  }
  if (q) {
    conditions.push(
      or(
        sql`${users.email} ILIKE ${'%' + q + '%'}`,
        sql`${corporateProfiles.officeCompanyName} ILIKE ${'%' + q + '%'}`,
        sql`${vendorProfiles.companyName} ILIKE ${'%' + q + '%'}`
      )!
    );
  }

  const rows = await db
    .select({ user: users, corporate: corporateProfiles, vendor: vendorProfiles })
    .from(users)
    .leftJoin(corporateProfiles, eq(corporateProfiles.userId, users.id))
    .leftJoin(vendorProfiles, eq(vendorProfiles.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return jsonOk({
    users: rows.map((r) => ({
      ...serializeUser(r.user),
      deletedAt: r.user.deletedAt?.toISOString() ?? null,
      lockedUntil: r.user.lockedUntil?.toISOString() ?? null,
      rejectionReason: r.user.rejectionReason,
      corporateProfile: r.corporate ? serializeCorporateProfile(r.corporate, r.user) : null,
      vendorProfile: r.vendor ? serializeVendorProfile(r.vendor, r.user) : null,
    })),
  });
});
