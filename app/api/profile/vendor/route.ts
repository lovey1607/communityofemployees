// GET/PUT /api/profile/vendor — the signed-in vendor's own profile.
// Scoped to the session user; a vendor cannot address another vendor's row.

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { vendorProfiles } from '@/lib/db/schema';
import { requireUser } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import {
  assertSameOrigin,
  clientIp,
  forbidden,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { vendorProfileSchema } from '@/lib/validation';
import { serializeVendorProfile } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const caller = await requireUser();
  if (caller.user.role !== 'vendor') throw forbidden();
  const [profile] = await db
    .select()
    .from(vendorProfiles)
    .where(eq(vendorProfiles.userId, caller.user.id))
    .limit(1);
  if (!profile) throw notFound('No profile yet.');
  return jsonOk(serializeVendorProfile(profile, caller.user));
});

export const PUT = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireUser();
  if (caller.user.role !== 'vendor') throw forbidden();

  const body = await parseJson(request, vendorProfileSchema);
  const now = new Date();

  const [existing] = await db
    .select()
    .from(vendorProfiles)
    .where(eq(vendorProfiles.userId, caller.user.id))
    .limit(1);
  if (!existing) throw notFound('No profile to update.');

  // Changing the GSTIN drops the verified flag — re-verification is required.
  const gstChanged = existing.gstNumber !== body.gstNumber;

  const [updated] = await db
    .update(vendorProfiles)
    .set({
      category: body.category,
      extraCategories: body.extraCategories ?? existing.extraCategories,
      serviceAreas: body.serviceAreas ?? existing.serviceAreas,
      vendorName: body.vendorName,
      companyName: body.companyName,
      mobile: body.mobile,
      companyMobile: body.companyMobile || '',
      address: body.address,
      city: body.city,
      locality: body.locality ?? null,
      entityType: body.entityType ?? null,
      panNumber: body.panNumber || null,
      gstNumber: body.gstNumber,
      gstVerified: gstChanged ? false : existing.gstVerified,
      portfolioSummary: body.portfolioSummary ?? null,
      corporateSuitability: body.corporateSuitability ?? null,
      pastClients: body.pastClients ?? existing.pastClients,
      amenities: body.amenities ?? existing.amenities,
      timings: body.timings ?? null,
      avgCostPerPerson: body.avgCostPerPerson ?? null,
      placeId: body.placeId ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      isCompleted: true,
      submittedAt: existing.submittedAt ?? now,
      updatedAt: now,
    })
    .where(eq(vendorProfiles.userId, caller.user.id))
    .returning();

  await recordAudit(caller, {
    action: 'profile.vendor.updated',
    entityType: 'vendor_profile',
    entityId: updated!.id,
    metadata: { gstChanged },
    ip: clientIp(request),
  });

  return jsonOk(serializeVendorProfile(updated!, caller.user));
});
