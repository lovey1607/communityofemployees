// ============================================================
// lib/server/guards.ts — Server-side authentication & RBAC.
//
// Every protected route calls one of these. The UI hides things too, but
// hiding is cosmetic: these functions are the actual access control.
// ============================================================

import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { corporateProfiles, vendorProfiles, type UserRow } from '@/lib/db/schema';
import { getSessionContext } from './session';
import { forbidden, unauthorized } from './http';

export interface Caller {
  user: UserRow;
  sessionId: string;
}

/** Authenticated, not suspended, not deleted. Says nothing about approval. */
export async function requireUser(): Promise<Caller> {
  const ctx = await getSessionContext();
  if (!ctx) throw unauthorized();
  if (ctx.user.isSuspended) {
    throw forbidden('This account has been suspended. Contact support@communityofemployees.com.');
  }
  return ctx;
}

/** Authenticated + email verified + approved by an admin. The bar for doing anything real. */
export async function requireActiveUser(): Promise<Caller> {
  const caller = await requireUser();
  if (!caller.user.emailVerifiedAt) {
    throw forbidden('Verify your email address before using the portal.');
  }
  if (caller.user.approvalStatus === 'rejected') {
    throw forbidden('Your registration was not approved.');
  }
  if (caller.user.approvalStatus !== 'approved') {
    throw forbidden('Your account is awaiting admin approval.');
  }
  return caller;
}

export async function requireRole(
  ...roles: Array<'corporate' | 'vendor' | 'admin'>
): Promise<Caller> {
  const caller = await requireActiveUser();
  if (!roles.includes(caller.user.role)) throw forbidden();
  return caller;
}

/** Admins skip the approval gate only in the sense that admins are created approved. */
export async function requireAdmin(): Promise<Caller> {
  const caller = await requireUser();
  if (caller.user.role !== 'admin') throw forbidden();
  if (!caller.user.emailVerifiedAt) throw forbidden('Verify your email address first.');
  return caller;
}

export async function requireCorporateProfile(caller: Caller) {
  const [profile] = await db
    .select()
    .from(corporateProfiles)
    .where(eq(corporateProfiles.userId, caller.user.id))
    .limit(1);
  if (!profile) throw forbidden('Complete your company profile first.');
  return profile;
}

export async function requireVendorProfile(caller: Caller) {
  const [profile] = await db
    .select()
    .from(vendorProfiles)
    .where(eq(vendorProfiles.userId, caller.user.id))
    .limit(1);
  if (!profile) throw forbidden('Complete your vendor profile first.');
  return profile;
}
