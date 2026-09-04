// GET/POST/DELETE /api/admin/domains — admin-managed overrides for the
// signup email-domain policy (allow a partner's free-mail domain, or block
// a domain that is abusing signups).

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { emailDomainRules } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  jsonOk,
  parseJson,
  route,
} from '@/lib/server/http';
import { domainRuleSchema } from '@/lib/validation';
import { FREE_EMAIL_DOMAINS } from '@/lib/emailDomains';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  await requireAdmin();
  const rows = await db.select().from(emailDomainRules).orderBy(emailDomainRules.domain);
  return jsonOk({
    overrides: rows.map((r) => ({
      domain: r.domain,
      rule: r.rule,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    })),
    // The static list is shown read-only so an admin can see what they are overriding.
    blockedByDefault: [...FREE_EMAIL_DOMAINS].sort(),
  });
});

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const admin = await requireAdmin();
  const body = await parseJson(request, domainRuleSchema);

  await db
    .insert(emailDomainRules)
    .values({ domain: body.domain, rule: body.rule, note: body.note ?? null, createdBy: admin.user.id })
    .onConflictDoUpdate({
      target: emailDomainRules.domain,
      set: { rule: body.rule, note: body.note ?? null, createdBy: admin.user.id },
    });

  await recordAudit(admin, {
    action: 'admin.domain_rule.set',
    entityType: 'email_domain_rule',
    entityId: body.domain,
    metadata: { rule: body.rule },
    ip: clientIp(request),
  });

  return jsonOk({ domain: body.domain, rule: body.rule });
});

export const DELETE = route(async (request) => {
  assertSameOrigin(request);
  const admin = await requireAdmin();
  const { domain } = await parseJson(request, z.object({ domain: z.string().trim().toLowerCase() }));
  if (!domain) throw badRequest('domain is required.');

  await db.delete(emailDomainRules).where(eq(emailDomainRules.domain, domain));
  await recordAudit(admin, {
    action: 'admin.domain_rule.removed',
    entityType: 'email_domain_rule',
    entityId: domain,
    ip: clientIp(request),
  });

  return jsonOk({ status: 'removed' });
});
