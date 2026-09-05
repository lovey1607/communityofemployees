// ============================================================
// lib/server/audit.ts — Append-only record of consequential actions.
// ============================================================

import 'server-only';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { newId } from './crypto';
import type { Caller } from './guards';

export interface AuditInput {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}

export async function recordAudit(actor: Caller | null, input: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id: newId('audit'),
      actorId: actor?.user.id ?? null,
      actorEmail: actor?.user.email ?? null,
      actorRole: actor?.user.role ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata ?? {},
      ip: input.ip ?? null,
    });
  } catch (error) {
    // Audit logging must never break the operation it is describing.
    console.error('[audit] write failed', { action: input.action, error });
  }
}
