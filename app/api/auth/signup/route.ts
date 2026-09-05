// POST /api/auth/signup — create a corporate (employee) or vendor account.
//
// The account is created unverified AND unapproved. No session is issued:
// the user must confirm their email, then wait for an admin to approve.

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { authTokens, corporateProfiles, users, vendorProfiles } from '@/lib/db/schema';
import { generateToken, hashPassword, hashToken, newId } from '@/lib/server/crypto';
import { emailDomain } from '@/lib/emailDomains';
import { checkWorkEmailWithOverrides } from '@/lib/server/domainRules';
import { sendVerificationEmail } from '@/lib/server/email';
import { recordAudit } from '@/lib/server/audit';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/ratelimit';
import { assertSameOrigin, badRequest, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { signupCorporateSchema, signupVendorSchema } from '@/lib/validation';

const bodySchema = z.discriminatedUnion('role', [
  signupCorporateSchema.extend({ role: z.literal('corporate') }),
  signupVendorSchema.extend({ role: z.literal('vendor') }),
]);

const VERIFY_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const ip = clientIp(request);
  await enforceRateLimit(RATE_LIMITS.signup, ip);

  const body = await parseJson(request, bodySchema);

  // Employees must use a work address. Vendors are businesses that often run on
  // a free mailbox, so the work-email rule applies to corporate signups only.
  if (body.role === 'corporate') {
    const policy = await checkWorkEmailWithOverrides(body.email);
    if (!policy.ok) throw badRequest(policy.message ?? 'That email address cannot be used.');
  }

  const existing = await db
    .select({ id: users.id, deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.emailNormalized, body.email))
    .limit(1);

  // Do not confirm or deny that an address is registered: respond identically
  // either way and let the (non-)arriving email do the talking.
  if (existing.some((u) => !u.deletedAt)) {
    await recordAudit(null, {
      action: 'auth.signup.duplicate',
      entityType: 'user',
      metadata: { email: body.email },
      ip,
    });
    return jsonOk({ status: 'verification_sent' });
  }

  const userId = newId('user');
  const passwordHash = await hashPassword(body.password);
  const token = generateToken(32);

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      email: body.email,
      emailNormalized: body.email,
      emailDomain: emailDomain(body.email),
      role: body.role,
      passwordHash,
      approvalStatus: 'pending',
    });

    if (body.role === 'corporate') {
      await tx.insert(corporateProfiles).values({
        id: newId('cp'),
        userId,
        email: body.email,
        name: body.name ?? '',
        officeCompanyName: body.officeCompanyName ?? '',
        submittedAt: new Date(),
      });
    } else {
      await tx.insert(vendorProfiles).values({
        id: newId('vp'),
        userId,
        category: body.category,
        extraCategories: body.extraCategories ?? [],
        serviceAreas: body.serviceAreas,
        companyName: body.companyName,
        vendorName: body.vendorName ?? '',
        gstNumber: body.gstNumber,
        gstVerified: false, // format-checked only; see README for real GSTIN verification
        mobile: body.mobile ?? '',
        city: body.city ?? '',
        submittedAt: new Date(),
      });
    }

    await tx.insert(authTokens).values({
      id: newId('tok'),
      userId,
      tokenHash: hashToken(token),
      purpose: 'email_verify',
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    });
  });

  await sendVerificationEmail(body.email, token);
  await recordAudit(null, {
    action: 'auth.signup',
    entityType: 'user',
    entityId: userId,
    metadata: { role: body.role, email: body.email },
    ip,
  });

  return jsonOk({ status: 'verification_sent' });
});
