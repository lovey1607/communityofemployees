// GET  /api/admin/communities — every listing (researched + added + hidden)
//      with filters: q, category, pricing, platform, city, status, source, page.
// POST /api/admin/communities — add a new listing.
import { requireAdmin } from '@/lib/server/guards';
import { assertSameOrigin, clientIp, jsonOk, parseJson, route } from '@/lib/server/http';
import { recordAudit } from '@/lib/server/audit';
import { CITY_GROUPS } from '@/lib/communities';
import { communityInputSchema, getAdminListing, saveCommunity } from '@/lib/communities/admin';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  await requireAdmin();
  const sp = new URL(request.url).searchParams;
  const q = (sp.get('q') ?? '').trim().toLowerCase();
  const pick = (k: string) => { const v = sp.get(k); return v && v !== 'all' && v !== 'any' ? v : null; };
  const category = pick('category'), pricing = pick('pricing'), platform = pick('platform'), city = pick('city'), status = pick('status'), source = pick('source');
  const page = Math.max(1, Number(sp.get('page') ?? 1)), per = Math.min(200, Math.max(10, Number(sp.get('per') ?? 50)));

  const all = await getAdminListing();
  const rows = all.filter((c) => {
    if (category && c.category !== category) return false;
    if (pricing === 'free' && c.pricing.type !== 'free') return false;
    if (pricing === 'paid' && !['paid', 'pay-per-event', 'membership'].includes(c.pricing.type)) return false;
    if (pricing && !['free', 'paid'].includes(pricing) && c.pricing.type !== pricing) return false;
    if (platform && c.join.platform !== platform) return false;
    if (city && !(CITY_GROUPS[city] ?? [city]).includes(c.city)) return false;
    if (status === 'hidden' && !c._hidden) return false;
    if (status && status !== 'hidden' && (c._hidden || c.status !== status)) return false;
    if (source && c._source !== source) return false;
    if (q && !`${c.name} ${c.slug} ${c.tagline} ${c.city} ${c.area ?? ''} ${c.tags.join(' ')}`.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => (b._updatedAt ?? '').localeCompare(a._updatedAt ?? '') || a.name.localeCompare(b.name));

  return jsonOk({
    total: rows.length,
    totals: { all: all.length, hidden: all.filter((c) => c._hidden).length, edited: all.filter((c) => c._source === 'edited').length, added: all.filter((c) => c._source === 'added').length },
    page, per,
    items: rows.slice((page - 1) * per, page * per).map((c) => ({
      slug: c.slug, name: c.name, category: c.category, city: c.city, area: c.area, status: c.status, hidden: c._hidden, source: c._source,
      pricing: c.pricing.type, platform: c.join.platform, joinUrl: c.join.url, updatedAt: c._updatedAt, verifiedOn: c.source.verifiedOn,
    })),
  });
});

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const caller = await requireAdmin();
  const input = await parseJson(request, communityInputSchema);
  const res = await saveCommunity(input, { origin: 'admin', actorId: caller.user.id });
  await recordAudit(caller, { action: 'community.create', entityType: 'community', entityId: res.slug, ip: clientIp(request) });
  return jsonOk({ slug: res.slug, community: res.community });
});
