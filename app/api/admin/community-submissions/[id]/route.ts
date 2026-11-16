// POST /api/admin/community-submissions/:id — { action: 'approve'|'reject', note?, payload? }
// Approving applies the request: new → listing added, update → listing
// changed (admin may tweak the payload first), remove → listing hidden.
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { communitySubmissions as S } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { assertSameOrigin, badRequest, clientIp, conflict, jsonOk, notFound, parseJson, route } from '@/lib/server/http';
import { recordAudit } from '@/lib/server/audit';
import { communityInputSchema, toInput } from '@/lib/communities/input';
import { getAdminListing, hideCommunity, saveCommunity } from '@/lib/communities/admin';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };
const bodySchema = z.object({ action: z.enum(['approve', 'reject']), note: z.string().trim().max(500).optional(), payload: z.record(z.string(), z.unknown()).optional() });

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function deepMerge(base: Record<string, unknown>, patch: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = isObj(v) && isObj(base[k]) ? { ...(base[k] as object), ...v } : v;
  return out;
}

export const POST = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const caller = await requireAdmin();
  const { id } = await ctx.params;
  const body = await parseJson(request, bodySchema);
  const [sub] = await db.select().from(S).where(eq(S.id, id)).limit(1);
  if (!sub) throw notFound();
  if (sub.status !== 'pending') throw conflict('This request was already reviewed.');

  let slug = sub.targetSlug;
  if (body.action === 'approve') {
    const payload = body.payload ?? sub.payload;
    const signal = `Submitted by the ${sub.submitterRole}, approved ${new Date().toISOString().slice(0, 10)}`;
    if (sub.kind === 'new') {
      const res = await saveCommunity(communityInputSchema.parse(payload), { origin: 'lead', actorId: caller.user.id, signal });
      slug = res.slug;
    } else if (sub.kind === 'update') {
      const current = (await getAdminListing()).find((c) => c.slug === sub.targetSlug);
      if (!current) throw badRequest('That listing no longer exists.');
      const merged = deepMerge(toInput(current) as Record<string, unknown>, payload);
      await saveCommunity(communityInputSchema.parse(merged), { slug: current.slug, origin: 'lead', actorId: caller.user.id, signal });
    } else {
      await hideCommunity(sub.targetSlug!, caller.user.id);
    }
  }
  await db.update(S).set({ status: body.action === 'approve' ? 'approved' : 'rejected', reviewNote: body.note ?? null, reviewedBy: caller.user.id, reviewedAt: new Date() }).where(eq(S.id, id));
  await recordAudit(caller, { action: `community_submission.${body.action}`, entityType: 'community_submission', entityId: id, metadata: { kind: sub.kind, slug }, ip: clientIp(request) });
  return jsonOk({ id, status: body.action === 'approve' ? 'approved' : 'rejected', slug });
});
