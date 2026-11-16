// ============================================================
// lib/communities/input.ts — what an admin or a group lead may send when
// adding / changing a listing, and how that becomes a full Community.
// Shared by the API routes (validation) and the forms (types).
// ============================================================
import { z } from 'zod';
import { CITY_CENTRE, CATEGORY_META, type Community, type CommunityCategory, type JoinPlatform } from '@/data/communities';

export const CATEGORIES = Object.keys(CATEGORY_META) as [CommunityCategory, ...CommunityCategory[]];
export const PLATFORMS = ['whatsapp', 'telegram', 'instagram', 'meetup', 'luma', 'misfits', 'strava', 'website', 'hangout', 'discord', 'reddit', 'facebook', 'other'] as const satisfies readonly JoinPlatform[];
export const CITIES = [...Object.keys(CITY_CENTRE), 'Online'];
export const PRICING = ['free', 'paid', 'pay-per-event', 'membership', 'unknown'] as const;

const url = z.string().trim().url('Must be a full link starting with https://').max(500).refine((u) => /^https?:\/\//i.test(u), 'Must start with http(s)://');
const optUrl = z.union([url, z.literal('')]).optional().transform((v) => v || undefined);
const short = (max: number) => z.string().trim().max(max);

export const communityInputSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes').max(80).optional(),
  name: short(120).min(2, 'Name is required'),
  tagline: short(160).min(5, 'Add a one-line description'),
  description: short(2000).default(''),
  category: z.enum(CATEGORIES),
  tags: z.array(short(40).min(1)).max(12).default([]),
  city: z.string().refine((c) => CITIES.includes(c), 'Pick a city from the list'),
  area: short(120).nullable().optional().transform((v) => v || null),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  meets: z.object({ cadence: z.enum(['weekly', 'fortnightly', 'monthly', 'irregular', 'unknown']), summary: short(200).nullable().optional().transform((v) => v || null) }).default({ cadence: 'unknown', summary: null }),
  audience: z.object({ gender: z.enum(['all', 'women', 'men', 'unknown']), ageNote: short(120).nullable().optional().transform((v) => v || null), level: z.enum(['beginner', 'all', 'advanced', 'unknown']) }).default({ gender: 'all', ageNote: null, level: 'all' }),
  pricing: z.object({ type: z.enum(PRICING), note: short(160).nullable().optional().transform((v) => v || null) }).default({ type: 'unknown', note: null }),
  size: z.object({ bucket: z.enum(['<50', '50–200', '200–1000', '1000+', 'unknown']), note: short(160).nullable().optional().transform((v) => v || null) }).default({ bucket: 'unknown', note: null }),
  hasEvents: z.boolean().default(true),
  mode: z.enum(['offline', 'online', 'hybrid']).default('offline'),
  ageBand: z.enum(['genz', 'millennial', '50plus']).nullable().default(null),
  join: z.object({ url, platform: z.enum(PLATFORMS), cta: short(60).min(2).default('Join') }),
  links: z.object({ instagram: optUrl, website: optUrl, meetup: optUrl, whatsapp: optUrl, facebook: optUrl, luma: optUrl, strava: optUrl }).prefault({}),
  imageUrl: z.union([url, z.literal('')]).nullable().optional().transform((v) => v || null),
  // admin-only (ignored for lead submissions)
  status: z.enum(['approved', 'unverified', 'hidden']).optional(),
  featured: z.boolean().optional(),
});
export type CommunityInput = z.input<typeof communityInputSchema>;
export type CommunityInputParsed = z.output<typeof communityInputSchema>;

/** Partial version for "update my listing" requests from group leads. */
export const communityPatchSchema = communityInputSchema.partial();

export const submissionSchema = z.object({
  kind: z.enum(['new', 'update', 'remove']),
  targetSlug: z.string().trim().max(80).optional(),
  payload: z.unknown().optional(),
  submitterName: short(80).min(2, 'Tell us your name'),
  submitterEmail: z.string().trim().toLowerCase().email('Enter a valid email').max(200),
  submitterRole: z.enum(['organiser', 'co-organiser', 'member', 'other']).default('organiser'),
  message: short(1500).optional(),
  /** honeypot — real people never fill this */
  website: z.string().max(0).optional(),
});

export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

/** Turn validated input into a full listing. `prev` keeps fields the input doesn't set. */
export function toCommunity(i: CommunityInputParsed, opts: { slug: string; prev?: Community; signal: string; verifiedOn: string }): Community {
  const centre = CITY_CENTRE[i.city];
  const location = i.lat != null && i.lng != null
    ? { lat: i.lat, lng: i.lng, label: i.area ?? i.city, precision: 'area' as const }
    : opts.prev && opts.prev.city === i.city ? opts.prev.location
    : centre ? { lat: centre[0], lng: centre[1], label: i.city, precision: 'city' as const } : null;
  const links = Object.fromEntries(Object.entries(i.links).filter(([, v]) => !!v)) as Community['links'];
  return {
    id: opts.slug,
    slug: opts.slug,
    name: i.name,
    tagline: i.tagline,
    description: i.description || i.tagline,
    category: i.category,
    tags: i.tags,
    city: i.city,
    area: i.area ?? null,
    location,
    meets: i.meets,
    audience: i.audience,
    pricing: i.pricing,
    size: i.size,
    hasEvents: i.hasEvents,
    mode: i.city === 'Online' && i.mode === 'offline' ? 'online' : i.mode,
    ageBand: i.ageBand,
    join: i.join,
    links,
    source: { url: i.join.url, verifiedOn: opts.verifiedOn, activitySignal: opts.signal },
    status: i.status === 'hidden' ? 'unverified' : i.status ?? opts.prev?.status ?? 'approved',
    featured: i.featured ?? opts.prev?.featured,
    imageUrl: i.imageUrl ?? null,
    createdAt: opts.prev?.createdAt ?? opts.verifiedOn,
  };
}

/** Community → form input (for editing an existing listing). */
export function toInput(c: Community): CommunityInput {
  return {
    slug: c.slug, name: c.name, tagline: c.tagline, description: c.description, category: c.category, tags: c.tags,
    city: c.city, area: c.area, lat: c.location?.precision === 'city' ? null : c.location?.lat ?? null, lng: c.location?.precision === 'city' ? null : c.location?.lng ?? null,
    meets: c.meets, audience: c.audience, pricing: c.pricing, size: c.size, hasEvents: c.hasEvents, mode: c.mode, ageBand: c.ageBand,
    join: c.join, links: c.links, imageUrl: c.imageUrl ?? '', status: c.status, featured: c.featured ?? false,
  };
}
