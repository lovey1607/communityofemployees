import 'server-only';
import { db } from '@/lib/db';
import { emailDomainRules } from '@/lib/db/schema';
import { checkWorkEmail, type EmailPolicyResult } from '@/lib/emailDomains';

/** Admin-managed overrides layered on top of the static free-provider list. */
export async function loadDomainOverrides(): Promise<Record<string, 'allow' | 'block'>> {
  const rows = await db
    .select({ domain: emailDomainRules.domain, rule: emailDomainRules.rule })
    .from(emailDomainRules);
  return Object.fromEntries(rows.map((r) => [r.domain, r.rule]));
}

export async function checkWorkEmailWithOverrides(email: string): Promise<EmailPolicyResult> {
  return checkWorkEmail(email, await loadDomainOverrides());
}
