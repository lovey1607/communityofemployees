// ============================================================
// lib/communities/index.ts — pure helpers for the communities
// marketplace: filtering, sorting, distance, URL state, generated marks.
// No React, no DOM, so everything here is unit-testable with tsx.
// ============================================================

import { COMMUNITIES_CORE, CATEGORY_META, CITY_CENTRE, type Community, type CommunityCategory, type JoinPlatform } from '@/data/communities';
import { COMMUNITIES_INDIA } from '@/data/communities-india';
import { COMMUNITIES_DISCOVERED } from '@/data/communities-discovered';
import { COMMUNITIES_MEETUP_NOV } from '@/data/communities-meetup-nov';
import { UPDATES, REMOVED, VERIFIED_ON } from '@/data/communities-updates';

export type { Community, CommunityCategory, JoinPlatform };

/** City used for pan-India / internet-first rows; they appear in every city view. */
export const ONLINE_CITY = 'Online';

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

export const COMMUNITIES: Community[] = [...applyUpdates([...COMMUNITIES_CORE, ...COMMUNITIES_INDIA]), ...COMMUNITIES_DISCOVERED, ...COMMUNITIES_MEETUP_NOV];
export { CATEGORY_META };

// ─── Brand ───────────────────────────────────────────────────
export const BRAND = {
  name: 'Community of People',
  short: 'CoP',
  domain: 'communityofpeople.com',
  tagline: 'Find your people.',
} as const;

// ─── Geography ───────────────────────────────────────────────
export type Place = { label: string; lat: number; lng: number; city: string };

/** Pickable areas, Gurgaon-first. Coordinates are approximate centroids. */
export const AREAS: Place[] = [
  { label: 'DLF Cyber City / Cyber Hub', lat: 28.495, lng: 77.089, city: 'Gurgaon' },
  { label: 'Udyog Vihar', lat: 28.502, lng: 77.08, city: 'Gurgaon' },
  { label: 'MG Road / DLF Phase 1–3', lat: 28.48, lng: 77.09, city: 'Gurgaon' },
  { label: 'Golf Course Road', lat: 28.4515, lng: 77.0975, city: 'Gurgaon' },
  { label: 'Golf Course Ext Rd / Sector 62–63', lat: 28.408, lng: 77.088, city: 'Gurgaon' },
  { label: 'Sector 29 / Leisure Valley', lat: 28.4665, lng: 77.064, city: 'Gurgaon' },
  { label: 'Sushant Lok / Sector 43–56', lat: 28.455, lng: 77.07, city: 'Gurgaon' },
  { label: 'Sohna Road / Sector 48–49', lat: 28.418, lng: 77.04, city: 'Gurgaon' },
  { label: 'South City / Sector 30–40', lat: 28.445, lng: 77.03, city: 'Gurgaon' },
  { label: 'New Gurgaon / Dwarka Expressway', lat: 28.46, lng: 76.98, city: 'Gurgaon' },
  { label: 'Nehru Park / Chanakyapuri', lat: 28.589, lng: 77.195, city: 'Delhi' },
  { label: 'Lodhi Garden / Khan Market', lat: 28.593, lng: 77.22, city: 'Delhi' },
  { label: 'Connaught Place', lat: 28.631, lng: 77.219, city: 'Delhi' },
  { label: 'Hauz Khas / Saket', lat: 28.55, lng: 77.2, city: 'Delhi' },
  { label: 'Dwarka', lat: 28.59, lng: 77.05, city: 'Delhi' },
  { label: 'Noida Sector 18 / 62', lat: 28.57, lng: 77.33, city: 'Noida' },
  { label: 'Bandra / Carter Road', lat: 19.06, lng: 72.82, city: 'Mumbai' },
  { label: 'Marine Drive / Nariman Point', lat: 18.93, lng: 72.82, city: 'Mumbai' },
  { label: 'Worli / Lower Parel', lat: 19.01, lng: 72.82, city: 'Mumbai' },
  { label: 'Powai / Andheri East', lat: 19.12, lng: 72.9, city: 'Mumbai' },
  { label: 'Thane', lat: 19.218, lng: 72.978, city: 'Mumbai' },
  { label: 'Navi Mumbai (Kharghar / Belapur)', lat: 19.04, lng: 73.05, city: 'Mumbai' },
  { label: 'Cubbon Park / MG Road', lat: 12.976, lng: 77.593, city: 'Bengaluru' },
  { label: 'Indiranagar', lat: 12.978, lng: 77.64, city: 'Bengaluru' },
  { label: 'Koramangala / HSR', lat: 12.93, lng: 77.63, city: 'Bengaluru' },
  { label: 'Jayanagar / JP Nagar', lat: 12.925, lng: 77.583, city: 'Bengaluru' },
  { label: 'Whitefield', lat: 12.97, lng: 77.75, city: 'Bengaluru' },
  { label: 'Electronic City', lat: 12.845, lng: 77.66, city: 'Bengaluru' },
  { label: 'Jawahar Circle / Malviya Nagar', lat: 26.84, lng: 75.8, city: 'Jaipur' },
  { label: 'C-Scheme / MI Road', lat: 26.91, lng: 75.8, city: 'Jaipur' },
  { label: 'Vaishali Nagar', lat: 26.91, lng: 75.74, city: 'Jaipur' },
  { label: 'Koregaon Park / Kalyani Nagar', lat: 18.54, lng: 73.9, city: 'Pune' },
  { label: 'Baner / Balewadi / Aundh', lat: 18.56, lng: 73.79, city: 'Pune' },
  { label: 'Deccan / FC Road', lat: 18.52, lng: 73.84, city: 'Pune' },
  { label: 'Hinjewadi / Wakad / PCMC', lat: 18.6, lng: 73.76, city: 'Pune' },
  { label: 'Kharadi / Viman Nagar', lat: 18.55, lng: 73.93, city: 'Pune' },
  { label: 'Gachibowli / Hitec City', lat: 17.44, lng: 78.36, city: 'Hyderabad' },
  { label: 'Jubilee Hills / KBR Park', lat: 17.42, lng: 78.42, city: 'Hyderabad' },
  { label: 'Banjara Hills', lat: 17.41, lng: 78.44, city: 'Hyderabad' },
  { label: 'Secunderabad', lat: 17.44, lng: 78.5, city: 'Hyderabad' },
  { label: 'Kondapur / Madhapur', lat: 17.46, lng: 78.37, city: 'Hyderabad' },
  { label: 'Besant Nagar / Adyar', lat: 13.0, lng: 80.26, city: 'Chennai' },
  { label: 'Anna Nagar', lat: 13.09, lng: 80.21, city: 'Chennai' },
  { label: 'T. Nagar / Mylapore', lat: 13.04, lng: 80.25, city: 'Chennai' },
  { label: 'OMR / Sholinganallur', lat: 12.9, lng: 80.23, city: 'Chennai' },
  { label: 'Velachery / Guindy', lat: 12.98, lng: 80.22, city: 'Chennai' },
  { label: 'Rabindra Sarovar / Southern Ave', lat: 22.51, lng: 88.36, city: 'Kolkata' },
  { label: 'Park Street / Esplanade', lat: 22.55, lng: 88.35, city: 'Kolkata' },
  { label: 'Salt Lake / New Town', lat: 22.58, lng: 88.43, city: 'Kolkata' },
  { label: 'Ballygunge / Gariahat', lat: 22.52, lng: 88.37, city: 'Kolkata' },
  { label: 'Navrangpura / Parimal Garden', lat: 23.03, lng: 72.56, city: 'Ahmedabad' },
  { label: 'SG Highway / Prahlad Nagar', lat: 23.01, lng: 72.51, city: 'Ahmedabad' },
  { label: 'Sabarmati Riverfront', lat: 23.03, lng: 72.57, city: 'Ahmedabad' },
  { label: 'Panampilly Nagar / Kadavanthra', lat: 9.96, lng: 76.3, city: 'Kochi' },
  { label: 'Kakkanad', lat: 10.01, lng: 76.35, city: 'Kochi' },
  { label: 'Sector 17 / Sukhna Lake', lat: 30.74, lng: 76.79, city: 'Chandigarh' },
  { label: 'Mohali', lat: 30.7, lng: 76.72, city: 'Chandigarh' },
];

/** Every city we list, in display order: metros first, then the rest A–Z. */
export const METRO_CITIES = ['Gurgaon', 'Delhi', 'Noida', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur'];
const GROUP_MEMBERS = new Set(['Faridabad', 'Ghaziabad', 'Navi Mumbai', 'Thane', 'Gandhinagar', 'Mohali']);
export const ALL_CITIES: string[] = [
  ...METRO_CITIES,
  ...Object.keys(CITY_CENTRE).filter((c) => !METRO_CITIES.includes(c) && !GROUP_MEMBERS.has(c)).sort(),
];
export const CITY_CENTRES: Record<string, Place> = Object.fromEntries(
  ALL_CITIES.map((city) => [city, { label: city, lat: CITY_CENTRE[city][0], lng: CITY_CENTRE[city][1], city }]),
);

/** NCR is one market: a Gurgaon search should see Delhi/Noida clubs too. */
export const CITY_GROUPS: Record<string, string[]> = Object.fromEntries(ALL_CITIES.map((c) => [c, [c]]));
Object.assign(CITY_GROUPS, {
  Gurgaon: ['Gurgaon', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad'],
  Delhi: ['Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad'],
  Noida: ['Noida', 'Delhi', 'Gurgaon', 'Ghaziabad', 'Faridabad'],
  Mumbai: ['Mumbai', 'Navi Mumbai', 'Thane'],
  Ahmedabad: ['Ahmedabad', 'Gandhinagar'],
  Chandigarh: ['Chandigarh', 'Mohali'],
});

const R = 6371;
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const p = Math.PI / 180;
  const dLat = (bLat - aLat) * p;
  const dLng = (bLng - aLng) * p;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * p) * Math.cos(bLat * p) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatKm(km: number): string {
  if (km < 1) return '< 1 km';
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Nearest city centre to a point, so geolocation can pick a market. */
export function nearestCity(lat: number, lng: number): { city: string; km: number } {
  let best = { city: 'Gurgaon', km: Infinity };
  for (const c of Object.values(CITY_CENTRES)) {
    const km = distanceKm(lat, lng, c.lat, c.lng);
    if (km < best.km) best = { city: c.city, km };
  }
  return best;
}

// ─── Filters ─────────────────────────────────────────────────
export type Gender = 'all' | 'women' | 'men';
export type Price = 'any' | 'free' | 'paid' | 'membership';
export type Mode = 'any' | 'inperson' | 'online';
export type Age = 'any' | 'genz' | '50plus';
export type Cadence = 'any' | 'weekly' | 'monthly';
export type Size = 'any' | 'small' | 'medium' | 'large';
export type Sort = 'nearest' | 'active' | 'newest' | 'az';

export type Filters = {
  q: string;
  category: CommunityCategory | 'all';
  city: string;
  gender: Gender;
  beginner: boolean;
  price: Price;
  events: boolean;
  cadence: Cadence;
  size: Size;
  join: JoinPlatform | 'any';
  mode: Mode;
  age: Age;
  verified: boolean;
  sort: Sort;
};

export const DEFAULT_FILTERS: Filters = {
  q: '', category: 'all', city: 'Gurgaon', gender: 'all', beginner: false, price: 'any',
  events: false, cadence: 'any', size: 'any', join: 'any', mode: 'any', age: 'any', verified: false, sort: 'nearest',
};

export const CATEGORY_ORDER: (CommunityCategory | 'all')[] = [
  'all', 'running', 'sports', 'social', 'dating', 'outdoors', 'cycling', 'fitness', 'books', 'games', 'creative',
  'food', 'women', 'men', 'startup', 'tech', 'professional', 'wellbeing', 'cause', 'civic', 'pets', 'parents', 'language',
];

/** Which categories actually have listings — hides empty chips. */
export function categoriesWithListings(list: Community[] = COMMUNITIES): CommunityCategory[] {
  const set = new Set(list.map((c) => c.category));
  return CATEGORY_ORDER.filter((k): k is CommunityCategory => k !== 'all' && set.has(k));
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ');

export function matchesQuery(c: Community, q: string): boolean {
  const needle = norm(q).trim();
  if (!needle) return true;
  const hay = norm([c.name, c.tagline, c.area ?? '', c.city, c.category, CATEGORY_META[c.category].label, ...c.tags].join(' '));
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

export type Origin = { lat: number; lng: number; label: string } | null;

export type Scored = Community & { km: number | null };

export function applyFilters(all: Community[], f: Filters, origin: Origin): Scored[] {
  const cities = CITY_GROUPS[f.city] ?? [f.city];
  const out: Scored[] = [];
  for (const c of all) {
    if (c.city !== ONLINE_CITY && !cities.includes(c.city)) continue;
    if (f.category !== 'all' && c.category !== f.category) continue;
    if (f.gender !== 'all' && c.audience.gender !== f.gender) continue;
    if (f.beginner && !(c.audience.level === 'beginner' || c.tags.includes('beginner-friendly'))) continue;
    if (f.price === 'free' && c.pricing.type !== 'free') continue;
    if (f.price === 'paid' && !(c.pricing.type === 'paid' || c.pricing.type === 'membership' || c.pricing.type === 'pay-per-event')) continue;
    if (f.price === 'membership' && c.pricing.type !== 'membership') continue;
    if (f.mode === 'inperson' && c.mode === 'online') continue;
    if (f.mode === 'online' && c.mode === 'offline') continue;
    if (f.age !== 'any' && c.ageBand !== f.age) continue;
    if (f.events && !(c.hasEvents && c.meets.cadence !== 'unknown')) continue;
    if (f.cadence === 'weekly' && c.meets.cadence !== 'weekly') continue;
    if (f.cadence === 'monthly' && !(c.meets.cadence === 'monthly' || c.meets.cadence === 'fortnightly')) continue;
    if (f.size === 'small' && c.size.bucket !== '<50' && c.size.bucket !== '50–200') continue;
    if (f.size === 'medium' && c.size.bucket !== '200–1000') continue;
    if (f.size === 'large' && c.size.bucket !== '1000+') continue;
    if (f.join !== 'any' && c.join.platform !== f.join) continue;
    if (f.verified && c.status !== 'approved') continue;
    if (!matchesQuery(c, f.q)) continue;
    const km = origin && c.location ? distanceKm(origin.lat, origin.lng, c.location.lat, c.location.lng) : null;
    out.push({ ...c, km });
  }
  return sortScored(out, f.sort, origin != null);
}

const SIZE_RANK: Record<Community['size']['bucket'], number> = { '1000+': 4, '200–1000': 3, '50–200': 2, '<50': 1, unknown: 0 };
const CAD_RANK: Record<Community['meets']['cadence'], number> = { weekly: 4, fortnightly: 3, monthly: 2, irregular: 1, unknown: 0 };

export function activityScore(c: Community): number {
  return (c.status === 'approved' ? 10 : 0) + CAD_RANK[c.meets.cadence] * 2 + SIZE_RANK[c.size.bucket] + (c.featured ? 3 : 0);
}

export function sortScored(list: Scored[], sort: Sort, hasOrigin: boolean): Scored[] {
  const byName = (a: Scored, b: Scored) => a.name.localeCompare(b.name);
  const arr = [...list];
  if (sort === 'az') return arr.sort(byName);
  if (sort === 'newest') return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || byName(a, b));
  if (sort === 'active') return arr.sort((a, b) => activityScore(b) - activityScore(a) || byName(a, b));
  // nearest: city-precision rows sink below area-precision rows at equal-ish distance
  if (!hasOrigin) return arr.sort((a, b) => activityScore(b) - activityScore(a) || byName(a, b));
  return arr.sort((a, b) => {
    const ak = a.km ?? 1e9, bk = b.km ?? 1e9;
    const ap = a.location?.precision === 'city' ? 1 : 0, bp = b.location?.precision === 'city' ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return ak - bk || activityScore(b) - activityScore(a);
  });
}

/** Short “where” label for cards: area, city, or online. */
export function whereLabel(c: Pick<Community, 'city' | 'area' | 'mode'>): string {
  if (c.city === ONLINE_CITY) return c.mode === 'hybrid' ? 'Online + city chapters' : 'Online · pan-India';
  return c.area ?? c.city;
}

/** Join-platform options shown in the Filters panel. */
export const JOIN_FILTER_OPTIONS: JoinPlatform[] = ['whatsapp', 'instagram', 'meetup', 'website', 'discord', 'reddit', 'facebook', 'hangout', 'other'];

// ─── URL state ───────────────────────────────────────────────
const KEYS: (keyof Filters)[] = ['q', 'category', 'city', 'gender', 'beginner', 'price', 'events', 'cadence', 'size', 'join', 'mode', 'age', 'verified', 'sort'];

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  for (const k of KEYS) {
    const v = f[k], d = DEFAULT_FILTERS[k];
    if (v === d) continue;
    p.set(k, typeof v === 'boolean' ? '1' : String(v));
  }
  return p;
}

export function paramsToFilters(p: URLSearchParams | Record<string, string | string[] | undefined>, base: Filters = DEFAULT_FILTERS): Filters {
  const get = (k: string): string | null => {
    if (p instanceof URLSearchParams) return p.get(k);
    const v = p[k];
    return Array.isArray(v) ? v[0] ?? null : v ?? null;
  };
  const f: Filters = { ...base };
  const s = (k: keyof Filters, allowed?: readonly string[]) => {
    const v = get(k);
    if (v == null) return;
    if (allowed && !allowed.includes(v)) return;
    (f as unknown as Record<string, unknown>)[k] = v;
  };
  const b = (k: keyof Filters) => { const v = get(k); if (v != null) (f as unknown as Record<string, unknown>)[k] = v === '1' || v === 'true'; };
  s('q');
  s('category', [...CATEGORY_ORDER, 'other']);
  s('city', Object.keys(CITY_GROUPS));
  s('gender', ['all', 'women', 'men']);
  b('beginner');
  s('price', ['any', 'free', 'paid', 'membership']);
  b('events');
  s('cadence', ['any', 'weekly', 'monthly']);
  s('size', ['any', 'small', 'medium', 'large']);
  s('join', ['any', ...JOIN_FILTER_OPTIONS]);
  s('mode', ['any', 'inperson', 'online']);
  s('age', ['any', 'genz', '50plus']);
  b('verified');
  s('sort', ['nearest', 'active', 'newest', 'az']);
  return f;
}

export function activeFilterCount(f: Filters): number {
  let n = 0;
  for (const k of KEYS) if (k !== 'city' && k !== 'sort' && k !== 'q' && f[k] !== DEFAULT_FILTERS[k]) n++;
  return n;
}

// ─── Slugs for /communities/[city]/[category] ────────────────
export const CITY_SLUGS: Record<string, string> = { ...Object.fromEntries(ALL_CITIES.map((c) => [c.toLowerCase(), c])), bangalore: 'Bengaluru', gurugram: 'Gurgaon', bombay: 'Mumbai', madras: 'Chennai', calcutta: 'Kolkata', vizag: 'Visakhapatnam', trivandrum: 'Thiruvananthapuram', calicut: 'Kozhikode', mysore: 'Mysuru', 'delhi-ncr': 'Gurgaon' };
export const slugForCity = (city: string) => city.toLowerCase();

// ─── Generated visual mark ───────────────────────────────────
/** Deterministic colour + initials from the slug. No organiser imagery stored. */
export function markFor(c: Pick<Community, 'slug' | 'name' | 'category'>): { hue: number; initials: string; shape: 0 | 1 | 2 | 3 } {
  let h = 0;
  for (let i = 0; i < c.slug.length; i++) h = (h * 31 + c.slug.charCodeAt(i)) >>> 0;
  const base = CATEGORY_META[c.category].hue;
  const hue = (base + (h % 24) - 12 + 360) % 360;
  const words = c.name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const initials = (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)).toUpperCase();
  return { hue, initials, shape: (h % 4) as 0 | 1 | 2 | 3 };
}

export function bySlug(slug: string): Community | undefined {
  return COMMUNITIES.find((c) => c.slug === slug);
}

export function similarTo(c: Community, n = 4): Community[] {
  const cities = CITY_GROUPS[c.city] ?? [c.city];
  return COMMUNITIES
    .filter((o) => o.slug !== c.slug && cities.includes(o.city))
    .map((o) => ({ o, s: (o.category === c.category ? 5 : 0) + o.tags.filter((t) => c.tags.includes(t)).length + (o.city === c.city ? 1 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.o);
}

export const PLATFORM_LABEL: Record<JoinPlatform, string> = {
  whatsapp: 'WhatsApp', instagram: 'Instagram', meetup: 'Meetup', luma: 'Luma', misfits: 'Misfits',
  strava: 'Strava', website: 'Website', telegram: 'Telegram', hangout: 'hangout.in',
  discord: 'Discord', reddit: 'Reddit', facebook: 'Facebook', other: 'Link / form',
};
