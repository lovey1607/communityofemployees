// POST /api/auth/logout — revokes the session row server-side, so the cookie
// is dead even if it was copied elsewhere before logout.

import { getSessionContext, clearSessionCookie, revokeSession } from '@/lib/server/session';
import { recordAudit } from '@/lib/server/audit';
import { assertSameOrigin, clientIp, jsonOk, route } from '@/lib/server/http';

export const POST = route(async (request) => {
  assertSameOrigin(request);
  const ctx = await getSessionContext();
  if (ctx) {
    await revokeSession(ctx.sessionId);
    await recordAudit(ctx, {
      action: 'auth.logout',
      entityType: 'user',
      entityId: ctx.user.id,
      ip: clientIp(request),
    });
  }
  await clearSessionCookie();
  return jsonOk({ status: 'signed_out' });
});
