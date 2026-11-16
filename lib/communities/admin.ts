// ============================================================
// lib/communities/admin.ts — write operations on listings, used by the
// admin API and by "approve submission". Every write busts the cache.
// ============================================================
import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { communities as T } from '@/lib/db/schema';
import { newId } from '@/lib/server/crypto';
import { badRequest, notFound } from '@/lib/server/http';
import { communityInputSchema, slugify, toCommunity, type CommunityInputParsed } from './input';
import { bustCommunities, getAdminListing, isStaticSlug, staticBySlug } from './store';
import type { Community } from './index';

const today = () => new Date().toISOString().slice(0, 10);

/** Stable JSON (sorted keys, undefined dropped) — Postgres JSONB reorders keys. */
const canon = (v: unknown): string => JSON.stringify(v, (_k, x) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]])) : x);

async function currentListing(slug: string): Promise<Community | undefined> {
  const [row] = await db.select().from(T).where(eq(T.slug, slug)).limit(1);
  if (row) return row.data as unknown as Community;
  return staticBySlug(slug);
}

async function uniqueSlug(base: string): Promise<string> {
  let s = base || `community-${Date.now().toString(36)}`;
  for (let n = 2; n < 50; n++) {
    const [row] = await db.select({ id: T.id }).from(T).where(eq(T.slug, s)).limit(1);
    if (!row && !isStaticSlug(s)) return s;
    s = `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Create (no slug or new slug) or replace a listing. */
export async function saveCommunity(input: CommunityInputParsed, opts: { slug?: string; origin: 'admin' | 'lead'; actorId: string | null; signal?: string }) {
  const editing = opts.slug ? await currentListing(opts.slug) : undefined;
  if (opts.slug && !editing) throw notFound('No listing with that slug.');
  const slug = opts.slug ?? (await uniqueSlug(input.slug ? slugify(input.slug) : slugify(`${input.name}-${input.city}`)));
  const status = input.status ?? (editing?.status ?? 'approved');
  const data = toCommunity(input, {
    slug, prev: editing, verifiedOn: today(),
    signal: opts.signal ?? (editing ? `Updated by admin on ${today()}` : `Added by admin on ${today()}`),
  });
  const values = {
    slug, name: data.name, category: data.category, city: data.city, status,
    pricingType: data.pricing.type, joinPlatform: data.join.platform,
    data: data as unknown as Record<string, unknown>, origin: opts.origin, updatedBy: opts.actorId, updatedAt: new Date(),
  };
  const [existing] = await db.select({ id: T.id }).from(T).where(eq(T.slug, slug)).limit(1);
  if (existing) await db.update(T).set(values).where(eq(T.id, existing.id));
  else await db.insert(T).values({ id: newId('com'), ...values });
  bustCommunities();
  return { slug, community: data, created: !editing };
}

/** Hide (soft-remove) a listing from the public site. Reversible. */
export async function hideCommunity(slug: string, actorId: string | null) {
  const current = await currentListing(slug);
  if (!current) throw notFound('No listing with that slug.');
  const [existing] = await db.select({ id: T.id }).from(T).where(eq(T.slug, slug)).limit(1);
  if (existing) await db.update(T).set({ status: 'hidden', updatedBy: actorId, updatedAt: new Date() }).where(eq(T.id, existing.id));
  else await db.insert(T).values({
    id: newId('com'), slug, name: current.name, category: current.category, city: current.city, status: 'hidden',
    pricingType: current.pricing.type, joinPlatform: current.join.platform, data: current as unknown as Record<string, unknown>, origin: 'admin', updatedBy: actorId,
  });
  bustCommunities();
}

/** Bring a hidden listing back, or drop an edit and return to the researched version. */
export async function restoreCommunity(slug: string, mode: 'unhide' | 'revert') {
  const [row] = await db.select().from(T).where(eq(T.slug, slug)).limit(1);
  if (!row) throw notFound('Nothing to restore — this listing has no changes.');
  if (mode === 'revert') {
    if (!isStaticSlug(slug)) throw badRequest('This listing was added here, so there is no original to revert to. Hide or delete it instead.');
    await db.delete(T).where(eq(T.id, row.id));
  } else if (isStaticSlug(slug) && canon(row.data) === canon(staticBySlug(slug))) {
    // hidden without any edits → drop the row so it's plain "researched" again
    await db.delete(T).where(eq(T.id, row.id));
  } else {
    const prev = (row.data as unknown as Community).status ?? 'approved';
    await db.update(T).set({ status: prev === 'unverified' ? 'unverified' : 'approved', updatedAt: new Date() }).where(eq(T.id, row.id));
  }
  bustCommunities();
}

/** Permanently delete a listing that was ADDED here (researched ones can only be hidden). */
export async function deleteAddedCommunity(slug: string) {
  if (isStaticSlug(slug)) throw badRequest('Researched listings can be hidden, not deleted.');
  const res = await db.delete(T).where(eq(T.slug, slug)).returning({ id: T.id });
  if (!res.length) throw notFound();
  bustCommunities();
}

export { communityInputSchema, getAdminListing };
