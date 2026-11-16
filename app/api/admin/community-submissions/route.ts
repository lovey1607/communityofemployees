// GET /api/admin/community-submissions?status=pending|approved|rejected|all
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { communitySubmissions as S } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';
import { getAdminListing } from '@/lib/communities/admin';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  await requireAdmin();
  const status = new URL(request.url).searchParams.get('status') ?? 'pending';
  const q = db.select().from(S);
  const rows = await (status === 'all' ? q : q.where(eq(S.status, status as 'pending' | 'approved' | 'rejected'))).orderBy(desc(S.createdAt)).limit(200);
  const listing = new Map((await getAdminListing()).map((c) => [c.slug, c]));
  const [pending] = await db.$count(S, eq(S.status, 'pending')).then((n) => [n]);
  return jsonOk({
    pending,
    items: rows.map((r) => {
      const t = r.targetSlug ? listing.get(r.targetSlug) : undefined;
      return {
        id: r.id, kind: r.kind, status: r.status, targetSlug: r.targetSlug, targetName: t?.name ?? null,
        current: t ? { name: t.name, tagline: t.tagline, city: t.city, category: t.category, join: t.join, pricing: t.pricing, meets: t.meets } : null,
        payload: r.payload, submitterName: r.submitterName, submitterEmail: r.submitterEmail, submitterRole: r.submitterRole,
        message: r.message, reviewNote: r.reviewNote, reviewedAt: r.reviewedAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString(),
      };
    }),
  });
});
