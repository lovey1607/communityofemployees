// POST /api/maintenance — retention housekeeping.
//
// Backs up the retention promises in the privacy policy: dead sessions and
// consumed/expired one-time tokens are deleted, stale rate-limit counters are
// dropped, and audit rows older than the stated window are removed.
//
// Auth: an admin session, or CRON_SECRET presented one of two ways —
//   · `x-cron-secret: <secret>`            (any scheduler)
//   · `authorization: Bearer <secret>`     (how Vercel Cron sends it)
// Without CRON_SECRET set, only an admin can run it.
//
// Exported as both POST and GET because Vercel Cron issues a GET. The work is
// identical; GET is not cacheable here (force-dynamic, and vercel.json sends
// no-store for /api/*), and it is authenticated, so it is not an open
// side-effecting GET.

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server/guards';
import { purgeExpiredSessions } from '@/lib/server/session';
import { purgeStaleRateLimits } from '@/lib/server/ratelimit';
import { recordAudit } from '@/lib/server/audit';
import { clientIp, forbidden, jsonOk, route } from '@/lib/server/http';
import { safeEqual } from '@/lib/server/crypto';

export const dynamic = 'force-dynamic';

const AUDIT_RETENTION_MONTHS = 24;

const handler = route(async (request) => {
  const expected = process.env.CRON_SECRET;
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null;
  const provided = request.headers.get('x-cron-secret') ?? bearer;
  const viaCron = Boolean(expected && provided && safeEqual(provided, expected));

  let actor = null;
  if (!viaCron) {
    try {
      actor = await requireAdmin();
    } catch {
      throw forbidden('This endpoint needs an admin session or a valid cron secret.');
    }
  }

  const sessionsPurged = await purgeExpiredSessions();
  await purgeStaleRateLimits();

  const tokens = await db.execute(sql`
    DELETE FROM auth_tokens
    WHERE consumed_at IS NOT NULL OR expires_at < NOW() - INTERVAL '7 days'
  `);
  const audits = await db.execute(sql`
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (${AUDIT_RETENTION_MONTHS} || ' months')::interval
  `);

  const result = {
    sessionsPurged,
    tokensPurged: tokens.rowCount ?? 0,
    auditRowsPurged: audits.rowCount ?? 0,
    auditRetentionMonths: AUDIT_RETENTION_MONTHS,
  };

  await recordAudit(actor, {
    action: 'maintenance.retention',
    entityType: 'system',
    metadata: { ...result, viaCron },
    ip: clientIp(request),
  });

  return jsonOk(result);
});

export const POST = handler;
export const GET = handler;
