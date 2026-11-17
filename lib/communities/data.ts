// ============================================================
// lib/communities/data.ts — every researched listing, assembled. Import this
// only from server code (pages, API routes, scripts): it is the bulk of the
// payload, and client components get just the slice they need as props.
// ============================================================
import { CITY_CENTRE, type Community } from '@/data/communities';
import { COMMUNITIES_CORE } from '@/data/communities-core';
import { COMMUNITIES_INDIA } from '@/data/communities-india';
import { COMMUNITIES_DISCOVERED } from '@/data/communities-discovered';
import { COMMUNITIES_MEETUP_NOV } from '@/data/communities-meetup-nov';
import { COMMUNITIES_WORLD } from '@/data/communities-world';
import { UPDATES, REMOVED, VERIFIED_ON } from '@/data/communities-updates';

/** Apply the dated verification layer (data/communities-updates.ts) to seed rows. */
export function applyUpdates(rows: Community[]): Community[] {
  return rows.filter((r) => !REMOVED.has(r.slug)).map((r) => {
    const u = UPDATES[r.slug];
    if (!u) return r;
    const { activitySignal, links, ...rest } = u;
    const next: Community = { ...r, ...rest, links: { ...r.links, ...(links ?? {}) }, source: { url: r.links.instagram ?? r.source.url, verifiedOn: VERIFIED_ON, activitySignal } };
    if (rest.city && rest.city !== r.city && r.location?.precision === 'city') {
      const centre = CITY_CENTRE[rest.city];
      next.location = centre ? { lat: centre[0], lng: centre[1], label: rest.city, precision: 'city' } : null;
      next.area = null;
    }
    return next;
  });
}

export const COMMUNITIES: Community[] = [
  ...applyUpdates([...COMMUNITIES_CORE, ...COMMUNITIES_INDIA]),
  ...COMMUNITIES_DISCOVERED,
  ...COMMUNITIES_MEETUP_NOV,
  ...COMMUNITIES_WORLD,
];

export function bySlug(slug: string): Community | undefined {
  return COMMUNITIES.find((c) => c.slug === slug);
}
