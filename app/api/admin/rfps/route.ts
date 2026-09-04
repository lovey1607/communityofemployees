// GET /api/admin/rfps — every requirement, including cancelled ones.

import { and, desc, eq, isNull, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rfps } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';
import { serializeRfp } from '@/lib/server/serialize';
import { paginationSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  await requireAdmin();
  const url = new URL(request.url);
  const { limit, offset } = paginationSchema.parse({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });

  const conditions: SQL[] = [];
  if (url.searchParams.get('includeDeleted') !== 'true') conditions.push(isNull(rfps.deletedAt));
  const status = url.searchParams.get('status');
  if (status) conditions.push(eq(rfps.status, status as 'open'));

  const rows = await db
    .select()
    .from(rfps)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(rfps.submittedAt))
    .limit(limit)
    .offset(offset);

  return jsonOk({ rfps: rows.map((r) => serializeRfp(r)) });
});
