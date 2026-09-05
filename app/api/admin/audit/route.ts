// GET /api/admin/audit — who did what, to what, when.

import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { jsonOk, route } from '@/lib/server/http';
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
  const action = url.searchParams.get('action');
  const entityType = url.searchParams.get('entityType');
  const entityId = url.searchParams.get('entityId');
  const actorId = url.searchParams.get('actorId');
  if (action) conditions.push(sql`${auditLogs.action} LIKE ${action + '%'}`);
  if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
  if (entityId) conditions.push(eq(auditLogs.entityId, entityId));
  if (actorId) conditions.push(eq(auditLogs.actorId, actorId));

  const rows = await db
    .select()
    .from(auditLogs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return jsonOk({
    entries: rows.map((r) => ({
      id: r.id,
      actorId: r.actorId,
      actorEmail: r.actorEmail,
      actorRole: r.actorRole,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      metadata: r.metadata,
      ip: r.ip,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});
