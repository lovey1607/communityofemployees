// POST /api/communities/submissions — public. A group lead (or member)
// asks to ADD a listing, UPDATE one, or REMOVE one. Nothing goes live
// until an admin approves it in /admin/communities.
import { newId } from '@/lib/server/crypto';
import { db } from '@/lib/db';
import { communitySubmissions } from '@/lib/db/schema';
import { badRequest, clientIp, assertSameOrigin, jsonOk, parseJson, route } from '@/lib/server/http';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/server/ratelimit';
import { communityInputSchema, communityPatchSchema, submissionSchema } from '@/lib/communities/input';
import { getAllCommunities, isStaticSlug } from '@/lib/communities/store';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const ip = clientIp(request);
  await enforceRateLimit(RATE_LIMITS.communitySubmit, ip);
  const body = await parseJson(request, submissionSchema);
  if (body.website) return jsonOk({ received: true }); // honeypot: pretend success

  let payload: Record<string, unknown> = {};
  if (body.kind === 'new') {
    const p = communityInputSchema.parse(body.payload ?? {});
    const { status: _s, featured: _f, ...rest } = p; // leads can't set these
    payload = rest;
  } else {
    if (!body.targetSlug) throw badRequest('Pick the listing you want to change.');
    const exists = isStaticSlug(body.targetSlug) || (await getAllCommunities()).some((c) => c.slug === body.targetSlug);
    if (!exists) throw badRequest('We could not find that listing.');
    if (body.kind === 'update') {
      const p = communityPatchSchema.parse(body.payload ?? {});
      // zod fills defaults for fields the lead never sent (meets → "unknown",
      // mode → "offline"…). Keep only the keys they actually changed.
      const sent = new Set(Object.keys((body.payload ?? {}) as object));
      const { status: _s, featured: _f, ...all } = p;
      const rest = Object.fromEntries(Object.entries(all).filter(([k]) => sent.has(k)));
      if (!Object.keys(rest).length && !body.message) throw badRequest('Tell us what should change.');
      payload = rest;
    }
  }

  const id = newId('sub');
  await db.insert(communitySubmissions).values({
    id, kind: body.kind, targetSlug: body.targetSlug ?? null, payload,
    submitterName: body.submitterName, submitterEmail: body.submitterEmail, submitterRole: body.submitterRole,
    message: body.message ?? null, ip,
  });
  return jsonOk({ received: true, id });
});
