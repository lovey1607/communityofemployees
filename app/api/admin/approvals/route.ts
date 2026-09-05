// GET /api/admin/approvals — the queue: verified accounts still awaiting a
// decision, oldest first, with whatever profile detail exists to judge on.

import { and, asc, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { corporateProfiles, users, vendorProfiles } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';
import {
  serializeCorporateProfile,
  serializeUser,
  serializeVendorProfile,
} from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  await requireAdmin();
  const roleFilter = new URL(request.url).searchParams.get('role');

  const conditions = [
    eq(users.approvalStatus, 'pending'),
    isNull(users.deletedAt),
    // Unverified signups are noise in an approval queue — they may never
    // confirm. They still appear under /api/admin/users.
    isNotNull(users.emailVerifiedAt),
  ];
  if (roleFilter === 'corporate' || roleFilter === 'vendor') {
    conditions.push(eq(users.role, roleFilter));
  }

  const rows = await db
    .select({ user: users, corporate: corporateProfiles, vendor: vendorProfiles })
    .from(users)
    .leftJoin(corporateProfiles, eq(corporateProfiles.userId, users.id))
    .leftJoin(vendorProfiles, eq(vendorProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(asc(users.createdAt))
    .limit(200);

  return jsonOk({
    pending: rows.map((r) => ({
      ...serializeUser(r.user),
      corporateProfile: r.corporate ? serializeCorporateProfile(r.corporate, r.user) : null,
      vendorProfile: r.vendor ? serializeVendorProfile(r.vendor, r.user) : null,
    })),
  });
});
