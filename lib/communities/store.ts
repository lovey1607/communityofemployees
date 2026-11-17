// ============================================================
// lib/communities/store.ts — the live listing set = researched static
// listings (data/*.ts) overlaid with rows from the `communities` table.
//
//   row.slug not in static  → a new listing (added by admin / approved lead)
//   row.slug in static      → replaces that listing (edited)
//   row.status = 'hidden'   → removed from the public site
//
// Cached for 5 minutes and busted on every admin change (tag
// 'communities'). If the database is unreachable or not configured, the
// public site falls back to the static listings — it never goes blank.
// ============================================================
import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { communities as communitiesTable, type CommunityRow } from '@/lib/db/schema';
import { COMMUNITIES as STATIC } from './data';
import { cityPoolOf, countByCity, ONLINE_CITY, type Community } from './index';

export const COMMUNITIES_TAG = 'communities';
const STATIC_BY_SLUG = new Map(STATIC.map((c) => [c.slug, c]));
export const isStaticSlug = (slug: string) => STATIC_BY_SLUG.has(slug);
export const staticBySlug = (slug: string) => STATIC_BY_SLUG.get(slug);

export type Overlay = { slug: string; status: CommunityRow['status']; data: Community; origin: CommunityRow['origin']; updatedAt: string };

async function readOverlay(): Promise<Overlay[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await db.select().from(communitiesTable);
    return rows.map((r) => ({ slug: r.slug, status: r.status, data: r.data as unknown as Community, origin: r.origin, updatedAt: r.updatedAt.toISOString() }));
  } catch (error) {
    console.error('[communities] overlay read failed — serving static listings', error);
    return [];
  }
}

const cachedOverlay = unstable_cache(readOverlay, ['communities-overlay-v1'], { revalidate: 300, tags: [COMMUNITIES_TAG] });

export function mergeOverlay(overlay: Overlay[]): Community[] {
  const bySlug = new Map(STATIC_BY_SLUG);
  for (const o of overlay) {
    if (o.status === 'hidden') bySlug.delete(o.slug);
    else bySlug.set(o.slug, { ...o.data, slug: o.slug, id: o.slug, status: o.status });
  }
  return [...bySlug.values()];
}

/** Everything the public site should show. */
export async function getAllCommunities(): Promise<Community[]> {
  return mergeOverlay(await cachedOverlay());
}

export async function getCommunity(slug: string): Promise<Community | undefined> {
  return (await getAllCommunities()).find((c) => c.slug === slug);
}

/** What a city page sends to the browser: that city's slice + picker counts. */
export async function getCityPayload(city: string) {
  const list = await getAllCommunities();
  return {
    all: cityPoolOf(list, city),
    cityCounts: countByCity(list),
    totals: { listings: list.length, cities: new Set(list.map((c) => c.city).filter((c) => c !== ONLINE_CITY)).size },
  };
}

/** Admin view: every listing incl. hidden, with where it comes from. Not cached. */
export async function getAdminListing(): Promise<(Community & { _source: 'static' | 'edited' | 'added'; _hidden: boolean; _updatedAt: string | null })[]> {
  const overlay = await readOverlay();
  const ov = new Map(overlay.map((o) => [o.slug, o]));
  const out: (Community & { _source: 'static' | 'edited' | 'added'; _hidden: boolean; _updatedAt: string | null })[] = [];
  for (const c of STATIC) {
    const o = ov.get(c.slug);
    if (!o) out.push({ ...c, _source: 'static', _hidden: false, _updatedAt: null });
    else out.push({ ...(o.status === 'hidden' ? c : o.data), slug: c.slug, _source: 'edited', _hidden: o.status === 'hidden', _updatedAt: o.updatedAt });
  }
  for (const o of overlay) if (!STATIC_BY_SLUG.has(o.slug)) out.push({ ...o.data, slug: o.slug, _source: 'added', _hidden: o.status === 'hidden', _updatedAt: o.updatedAt });
  return out;
}

export function bustCommunities() {
  revalidateTag(COMMUNITIES_TAG, { expire: 0 });
}
