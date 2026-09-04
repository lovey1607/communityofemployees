// GET /api/auth/session — who am I? The client store hydrates from this on
// boot instead of trusting anything kept in localStorage.

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { corporateProfiles, vendorProfiles } from '@/lib/db/schema';
import { getSessionContext } from '@/lib/server/session';
import { jsonOk, route } from '@/lib/server/http';
import {
  serializeCorporateProfile,
  serializeUser,
  serializeVendorProfile,
} from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const ctx = await getSessionContext();
  if (!ctx) {
    return jsonOk({ user: null, corporateProfile: null, vendorProfile: null });
  }
  const { user } = ctx;

  const [corporate] =
    user.role === 'corporate'
      ? await db.select().from(corporateProfiles).where(eq(corporateProfiles.userId, user.id)).limit(1)
      : [];
  const [vendor] =
    user.role === 'vendor'
      ? await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, user.id)).limit(1)
      : [];

  return jsonOk({
    user: serializeUser(user),
    corporateProfile: corporate ? serializeCorporateProfile(corporate, user) : null,
    vendorProfile: vendor ? serializeVendorProfile(vendor, user) : null,
  });
});
