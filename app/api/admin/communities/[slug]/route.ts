// GET    /api/admin/communities/:slug — the listing as editable form input.
// PUT    /api/admin/communities/:slug — replace a listing's details.
// PATCH  /api/admin/communities/:slug — { action: 'hide' | 'unhide' | 'revert' }.
// DELETE /api/admin/communities/:slug — delete a listing that was added here.
import { z } from 'zod';
import { requireAdmin } from '@/lib/server/guards';
import { assertSameOrigin, clientIp, jsonOk, notFound, parseJson, route } from '@/lib/server/http';
import { recordAudit } from '@/lib/server/audit';
import { toInput } from '@/lib/communities/input';
import { communityInputSchema, deleteAddedCommunity, getAdminListing, hideCommunity, restoreCommunity, saveCommunity } from '@/lib/communities/admin';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ slug: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  await requireAdmin();
  const { slug } = await ctx.params;
  const c = (await getAdminListing()).find((x) => x.slug === slug);
  if (!c) throw notFound();
  const { _source, _hidden, _updatedAt, ...community } = c;
  return jsonOk({ input: toInput(community), source: _source, hidden: _hidden, updatedAt: _updatedAt, community });
});

export const PUT = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const caller = await requireAdmin();
  const { slug } = await ctx.params;
  const input = await parseJson(request, communityInputSchema);
  const res = await saveCommunity(input, { slug, origin: 'admin', actorId: caller.user.id });
  await recordAudit(caller, { action: 'community.update', entityType: 'community', entityId: slug, ip: clientIp(request) });
  return jsonOk({ slug: res.slug, community: res.community });
});

const patchSchema = z.object({ action: z.enum(['hide', 'unhide', 'revert']) });
export const PATCH = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const caller = await requireAdmin();
  const { slug } = await ctx.params;
  const { action } = await parseJson(request, patchSchema);
  if (action === 'hide') await hideCommunity(slug, caller.user.id);
  else await restoreCommunity(slug, action);
  await recordAudit(caller, { action: `community.${action}`, entityType: 'community', entityId: slug, ip: clientIp(request) });
  return jsonOk({ slug, action });
});

export const DELETE = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const caller = await requireAdmin();
  const { slug } = await ctx.params;
  await deleteAddedCommunity(slug);
  await recordAudit(caller, { action: 'community.delete', entityType: 'community', entityId: slug, ip: clientIp(request) });
  return jsonOk({ slug, deleted: true });
});
