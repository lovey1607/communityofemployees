// GET/PUT /api/profile/corporate — the signed-in employee's own profile.
// A corporate user can only ever read or write their own row: the WHERE
// clause is keyed on the session, never on an id from the request.

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { corporateProfiles } from '@/lib/db/schema';
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
import { corporateProfileSchema } from '@/lib/validation';
import { serializeCorporateProfile } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const caller = await requireUser();
  if (caller.user.role !== 'corporate') throw forbidden();
  const [profile] = await db
    .select()
    .from(corporateProfiles)
    .where(eq(corporateProfiles.userId, caller.user.id))
    .limit(1);
  if (!profile) throw notFound('No profile yet.');
  return jsonOk(serializeCorporateProfile(profile, caller.user));
});

export const PUT = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireUser();
  if (caller.user.role !== 'corporate') throw forbidden();

  const body = await parseJson(request, corporateProfileSchema);
  const now = new Date();

  const [updated] = await db
    .update(corporateProfiles)
    .set({
      name: body.name,
      mobile: body.mobile,
      officeCompanyName: body.officeCompanyName,
      officeAddress: body.officeAddress,
      city: body.city,
      position: body.position,
      department: body.department,
      cinNumber: body.cinNumber ?? null,
      teamSize: body.teamSize ?? null,
      annualProcurementBudget: body.annualProcurementBudget ?? null,
      placeId: body.placeId ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      isCompleted: true,
      submittedAt: now,
      updatedAt: now,
    })
    .where(eq(corporateProfiles.userId, caller.user.id))
    .returning();

  if (!updated) throw notFound('No profile to update.');

  await recordAudit(caller, {
    action: 'profile.corporate.updated',
    entityType: 'corporate_profile',
    entityId: updated.id,
    ip: clientIp(request),
  });

  return jsonOk(serializeCorporateProfile(updated, caller.user));
});
